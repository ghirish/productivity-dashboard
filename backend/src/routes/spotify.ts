import express from 'express'

const router = express.Router()

// GET /api/spotify/auth - Start Spotify authentication
router.get('/auth', (req, res) => {
  res.json({ message: 'Spotify authentication - coming soon!' })
})

// GET /api/spotify/callback - Spotify OAuth callback
router.get('/callback', (req, res) => {
  res.json({ message: 'Spotify OAuth callback - coming soon!' })
})

// GET /api/spotify/current-track - Get currently playing track
router.get('/current-track', (req, res) => {
  res.json({ message: 'Current track API - coming soon!' })
})

// POST /api/spotify/play - Play/pause music
router.post('/play', (req, res) => {
  res.json({ message: 'Play/pause API - coming soon!' })
})

// POST /api/spotify/skip - Skip track
router.post('/skip', (req, res) => {
  res.json({ message: 'Skip track API - coming soon!' })
})

export default router 