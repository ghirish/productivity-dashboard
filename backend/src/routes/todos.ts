import express from 'express'

const router = express.Router()

// GET /api/todos - Get all todos
router.get('/', (req, res) => {
  res.json({ message: 'Todos API - coming soon!' })
})

// GET /api/todos/week/:date - Get todos for specific week
router.get('/week/:date', (req, res) => {
  res.json({ message: 'Weekly todos API - coming soon!' })
})

// POST /api/todos - Create new todo
router.post('/', (req, res) => {
  res.json({ message: 'Create todo - coming soon!' })
})

// PUT /api/todos/:id - Update todo
router.put('/:id', (req, res) => {
  res.json({ message: 'Update todo - coming soon!' })
})

// DELETE /api/todos/:id - Delete todo
router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete todo - coming soon!' })
})

// PUT /api/todos/:id/complete - Toggle todo completion
router.put('/:id/complete', (req, res) => {
  res.json({ message: 'Toggle todo completion - coming soon!' })
})

export default router 