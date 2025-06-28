import express from 'express'

const router = express.Router()

// GET /api/pomodoro/sessions - Get pomodoro sessions
router.get('/sessions', (req, res) => {
  res.json({ message: 'Pomodoro sessions API - coming soon!' })
})

// POST /api/pomodoro/start - Start pomodoro session
router.post('/start', (req, res) => {
  res.json({ message: 'Start pomodoro session - coming soon!' })
})

// POST /api/pomodoro/complete - Complete pomodoro session
router.post('/complete', (req, res) => {
  res.json({ message: 'Complete pomodoro session - coming soon!' })
})

// GET /api/pomodoro/stats - Get pomodoro statistics
router.get('/stats', (req, res) => {
  res.json({ message: 'Pomodoro stats API - coming soon!' })
})

export default router 