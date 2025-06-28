import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  ExternalLink,
  Music,
  RefreshCw,
  LogOut,
  Clock,
  User,
  Headphones
} from 'lucide-react'

// Types
interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  album: string
  duration: number
  progress: number
  image: string
  external_urls: { spotify: string }
}

interface SpotifyDevice {
  id: string
  name: string
  type: string
  volume_percent: number
}

interface CurrentTrackData {
  isPlaying: boolean
  track: SpotifyTrack | null
  device: SpotifyDevice | null
}

interface PlaybackState {
  isActive: boolean
  device: SpotifyDevice
  isPlaying: boolean
  shuffleState: boolean
  repeatState: string
  volume: number
}

interface SpotifyProfile {
  id: string
  name: string
  email: string
  country: string
  followers: number
  images: Array<{ url: string }>
  product: string
}

interface RecentTrack {
  track: SpotifyTrack
  playedAt: string
}

interface Playlist {
  id: string
  name: string
  description: string
  tracks: number
  images: Array<{ url: string }>
  owner: string
  public: boolean
  url: string
}

export const SpotifyPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrackData | null>(null)
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null)
  const [profile, setProfile] = useState<SpotifyProfile | null>(null)
  const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/status`)
      const data = await response.json()
      setIsAuthenticated(data.isAuthenticated)
      return data.isAuthenticated
    } catch (error) {
      console.error('Auth status check failed:', error)
      return false
    }
  }, [API_BASE])

  // Fetch current track
  const fetchCurrentTrack = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/current-track`)
      if (response.ok) {
        const data = await response.json()
        setCurrentTrack(data)
      }
    } catch (error) {
      console.error('Failed to fetch current track:', error)
    }
  }, [API_BASE])

  // Fetch playback state
  const fetchPlaybackState = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/playback-state`)
      if (response.ok) {
        const data = await response.json()
        setPlaybackState(data)
      }
    } catch (error) {
      console.error('Failed to fetch playback state:', error)
    }
  }, [API_BASE])

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }, [API_BASE])

  // Fetch recent tracks
  const fetchRecentTracks = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/recent-tracks`)
      if (response.ok) {
        const data = await response.json()
        setRecentTracks(data)
      }
    } catch (error) {
      console.error('Failed to fetch recent tracks:', error)
    }
  }, [API_BASE])

  // Fetch playlists
  const fetchPlaylists = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/playlists`)
      if (response.ok) {
        const data = await response.json()
        setPlaylists(data)
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error)
    }
  }, [API_BASE])

  // Initialize data
  const initializeData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const authenticated = await checkAuthStatus()
    
    if (authenticated) {
      try {
        await Promise.all([
          fetchCurrentTrack(),
          fetchPlaybackState(),
          fetchProfile(),
          fetchRecentTracks(),
          fetchPlaylists()
        ])
      } catch (err: any) {
        setError('Failed to load Spotify data')
      }
    }
    
    setLoading(false)
  }, [checkAuthStatus, fetchCurrentTrack, fetchPlaybackState, fetchProfile, fetchRecentTracks, fetchPlaylists])

  // Handle authentication
  const handleAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/spotify/auth`)
      const data = await response.json()
      
      if (data.authURL) {
        window.location.href = data.authURL
      } else {
        setError('Failed to initiate Spotify authentication')
      }
    } catch (error) {
      setError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/spotify/logout`, { method: 'POST' })
      setIsAuthenticated(false)
      setCurrentTrack(null)
      setPlaybackState(null)
      setProfile(null)
      setRecentTracks([])
      setPlaylists([])
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Playback controls
  const handlePlayPause = async () => {
    try {
      const action = currentTrack?.isPlaying ? 'pause' : 'play'
      const response = await fetch(`${API_BASE}/api/spotify/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        // Update local state immediately for responsiveness
        setCurrentTrack(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null)
        // Fetch updated state
        setTimeout(() => {
          fetchCurrentTrack()
          fetchPlaybackState()
        }, 500)
      }
    } catch (error) {
      console.error('Play/pause failed:', error)
    }
  }

  const handleSkip = async (direction: 'next' | 'previous') => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      })
      
      if (response.ok) {
        // Fetch updated track info
        setTimeout(() => {
          fetchCurrentTrack()
        }, 1000)
      }
    } catch (error) {
      console.error('Skip failed:', error)
    }
  }

  const handleVolumeChange = async (volume: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/volume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume })
      })
      
      if (response.ok) {
        setPlaybackState(prev => prev ? { ...prev, volume } : null)
      }
    } catch (error) {
      console.error('Volume change failed:', error)
    }
  }

  // Format time
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  // Auto-refresh current track
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchCurrentTrack()
      }, 10000) // Update every 10 seconds
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchCurrentTrack])

  // Check for auth success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('spotify_auth') === 'success') {
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      // Initialize data
      initializeData()
    } else {
      initializeData()
    }
  }, [initializeData])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-300" />
              <span className="text-lg font-medium text-slate-700 dark:text-slate-200">
                Loading Spotify data...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-950 
                            flex items-center justify-center">
              <Music className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Connect to Spotify
            </h2>
            <p className="text-lg subtitle-text mb-6">
              Control your music and see what you're listening to
            </p>
            <Button onClick={handleAuth} className="modern-button">
              <Music className="w-4 h-4 mr-2" />
              Connect Spotify Account
            </Button>
            {error && (
              <p className="text-red-500 dark:text-red-400 mt-4 text-sm">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {profile?.images?.[0] && (
              <img
                src={profile.images[0].url}
                alt={profile.name}
                className="w-16 h-16 rounded-full ring-4 ring-green-200 dark:ring-green-800"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Spotify Player
              </h1>
              {profile && (
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {profile.name}
                  </p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                    {profile.product}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-300 dark:border-slate-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Current Track Player */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="gradient-text">Now Playing</CardTitle>
        </CardHeader>
        <CardContent>
          {currentTrack?.track ? (
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                {currentTrack.track.image && (
                  <img
                    src={currentTrack.track.image}
                    alt={currentTrack.track.album}
                    className="w-24 h-24 rounded-lg shadow-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                    {currentTrack.track.name}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    {currentTrack.track.artists.join(', ')}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currentTrack.track.album}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={currentTrack.isPlaying ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>
                      {currentTrack.isPlaying ? 'Playing' : 'Paused'}
                    </Badge>
                    <a
                      href={currentTrack.track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(currentTrack.track.progress / currentTrack.track.duration) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{formatTime(currentTrack.track.progress)}</span>
                  <span>{formatTime(currentTrack.track.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => handleSkip('previous')}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handlePlayPause}
                  className="modern-button w-12 h-12 rounded-full"
                >
                  {currentTrack.isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  onClick={() => handleSkip('next')}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              {playbackState?.volume !== undefined && (
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-slate-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={playbackState.volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <Volume2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400 min-w-[3ch]">
                    {playbackState.volume}%
                  </span>
                </div>
              )}

              {/* Device Info */}
              {currentTrack.device && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Headphones className="w-4 h-4" />
                  Playing on {currentTrack.device.name}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                No music playing
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Start playing music on Spotify to see it here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tracks and Playlists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tracks */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Recently Played</CardTitle>
            <p className="subtitle-text">Your recent listening history</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTracks.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {item.track.image && (
                    <img
                      src={item.track.image}
                      alt={item.track.album}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {item.track.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item.track.artists.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTimeAgo(item.playedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Playlists */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Your Playlists</CardTitle>
            <p className="subtitle-text">Quick access to your playlists</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playlists.slice(0, 6).map((playlist) => (
                <div key={playlist.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {playlist.images?.[0] && (
                    <img
                      src={playlist.images[0].url}
                      alt={playlist.name}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {playlist.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {playlist.tracks} tracks • {playlist.owner}
                    </p>
                  </div>
                  <a
                    href={playlist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 