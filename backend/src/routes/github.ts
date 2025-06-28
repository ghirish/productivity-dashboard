import express from 'express'

const router = express.Router()

// GET /api/github/contributions - Get GitHub contribution data
router.get('/contributions', (req, res) => {
  res.json({ message: 'GitHub contributions API - coming soon!' })
})

// GET /api/github/repos - Get repository information
router.get('/repos', (req, res) => {
  res.json({ message: 'GitHub repositories API - coming soon!' })
})

// GET /api/github/stats - Get GitHub statistics
router.get('/stats', (req, res) => {
  res.json({ message: 'GitHub stats API - coming soon!' })
})

export default router 