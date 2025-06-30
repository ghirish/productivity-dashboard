import express from 'express'
import axios from 'axios'
import querystring from 'querystring'

const router = express.Router()

// Spotify credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3002/api/spotify/callback'

// In-memory token storage (in production, use a database)
let accessToken: string | null = null
let refreshToken: string | null = null
let tokenExpiry: number | null = null

// Helper function to get Spotify API headers
const getSpotifyHeaders = () => ({
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
})

// Helper function to refresh access token
const refreshAccessToken = async (): Promise<boolean> => {
  if (!refreshToken) return false

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    accessToken = response.data.access_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000)
    
    if (response.data.refresh_token) {
      refreshToken = response.data.refresh_token
    }

    return true
  } catch (error) {
    console.error('Token refresh error:', error)
    return false
  }
}

// Helper function to ensure valid token
const ensureValidToken = async (): Promise<boolean> => {
  if (!accessToken || !tokenExpiry) return false
  
  if (Date.now() >= tokenExpiry - 60000) { // Refresh 1 minute before expiry
    return await refreshAccessToken()
  }
  
  return true
}

// GET /api/spotify/auth - Start Spotify authentication
router.get('/auth', (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing Spotify credentials:', { CLIENT_ID, CLIENT_SECRET })
    return res.status(500).json({ error: 'Spotify credentials not configured' })
  }

  const scope = 'streaming user-read-private user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state user-read-recently-played playlist-read-private playlist-read-collaborative'
  const state = Math.random().toString(36).substring(2, 15)
  
  const authURL = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    })

  res.json({ authURL })
})

// GET /api/spotify/callback - Spotify OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.status(400).json({ error: 'Spotify authorization failed', details: error })
  }

  if (!code) {
    return res.status(400).json({ error: 'Authorization code not provided' })
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    accessToken = response.data.access_token
    refreshToken = response.data.refresh_token
    tokenExpiry = Date.now() + (response.data.expires_in * 1000)

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://127.0.0.1:3000'}?spotify_auth=success`)
  } catch (error: any) {
    console.error('Spotify token exchange error:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Failed to exchange authorization code',
      details: error.response?.data || error.message
    })
  }
})

// GET /api/spotify/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: getSpotifyHeaders()
    })

    res.json({
      id: response.data.id,
      name: response.data.display_name,
      email: response.data.email,
      country: response.data.country,
      followers: response.data.followers.total,
      images: response.data.images,
      product: response.data.product
    })
  } catch (error: any) {
    console.error('Spotify profile fetch error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch Spotify profile',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// GET /api/spotify/current-track - Get currently playing track
router.get('/current-track', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: getSpotifyHeaders()
    })

    if (response.status === 204 || !response.data || !response.data.item) {
      return res.json({ isPlaying: false, track: null })
    }

    const track = response.data.item
    res.json({
      isPlaying: response.data.is_playing,
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => artist.name),
        album: track.album.name,
        duration: track.duration_ms,
        progress: response.data.progress_ms,
        image: track.album.images[0]?.url,
        external_urls: track.external_urls
      },
      device: response.data.device
    })
  } catch (error: any) {
    if (error.response?.status === 204) {
      return res.json({ isPlaying: false, track: null })
    }
    console.error('Spotify current track error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch current track',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// GET /api/spotify/playback-state - Get current playback state
router.get('/playback-state', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: getSpotifyHeaders()
    })

    if (response.status === 204 || !response.data) {
      return res.json({ isActive: false })
    }

    res.json({
      isActive: true,
      device: response.data.device,
      isPlaying: response.data.is_playing,
      shuffleState: response.data.shuffle_state,
      repeatState: response.data.repeat_state,
      volume: response.data.device.volume_percent
    })
  } catch (error: any) {
    if (error.response?.status === 204) {
      return res.json({ isActive: false })
    }
    console.error('Spotify playback state error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch playback state',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// POST /api/spotify/play - Play/pause music
router.post('/play', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const { action } = req.body // 'play' or 'pause'
    
    const endpoint = action === 'pause' 
      ? 'https://api.spotify.com/v1/me/player/pause'
      : 'https://api.spotify.com/v1/me/player/play'

    await axios.put(endpoint, {}, {
      headers: getSpotifyHeaders()
    })

    res.json({ success: true, action })
  } catch (error: any) {
    console.error('Spotify play/pause error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: `Failed to ${req.body.action || 'control'} playback`,
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// POST /api/spotify/skip - Skip track
router.post('/skip', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const { direction } = req.body // 'next' or 'previous'
    
    const endpoint = direction === 'previous'
      ? 'https://api.spotify.com/v1/me/player/previous'
      : 'https://api.spotify.com/v1/me/player/next'

    await axios.post(endpoint, {}, {
      headers: getSpotifyHeaders()
    })

    res.json({ success: true, direction })
  } catch (error: any) {
    console.error('Spotify skip error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to skip track',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// POST /api/spotify/volume - Set volume
router.post('/volume', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const { volume } = req.body // 0-100
    
    await axios.put(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {}, {
      headers: getSpotifyHeaders()
    })

    res.json({ success: true, volume })
  } catch (error: any) {
    console.error('Spotify volume error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to set volume',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// GET /api/spotify/recent-tracks - Get recently played tracks
router.get('/recent-tracks', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: getSpotifyHeaders(),
      params: { limit: 10 }
    })

    const tracks = response.data.items.map((item: any) => ({
      track: {
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map((artist: any) => artist.name),
        album: item.track.album.name,
        image: item.track.album.images[0]?.url,
        duration: item.track.duration_ms
      },
      playedAt: item.played_at
    }))

    res.json(tracks)
  } catch (error: any) {
    console.error('Spotify recent tracks error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch recent tracks',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// GET /api/spotify/playlists - Get user playlists
router.get('/playlists', async (req, res) => {
  try {
    if (!(await ensureValidToken())) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' })
    }

    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: getSpotifyHeaders(),
      params: { limit: 20 }
    })

    const playlists = response.data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      tracks: playlist.tracks.total,
      images: playlist.images,
      owner: playlist.owner.display_name,
      public: playlist.public,
      url: playlist.external_urls.spotify
    }))

    res.json(playlists)
  } catch (error: any) {
    console.error('Spotify playlists error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch playlists',
      details: error.response?.data?.error?.message || error.message
    })
  }
})

// GET /api/spotify/status - Check authentication status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: !!accessToken,
    hasRefreshToken: !!refreshToken,
    tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
  })
})

// POST /api/spotify/logout - Clear tokens
router.post('/logout', (req, res) => {
  accessToken = null
  refreshToken = null
  tokenExpiry = null
  
  res.json({ success: true, message: 'Logged out from Spotify' })
})

export default router 