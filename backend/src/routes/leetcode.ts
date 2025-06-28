import express from 'express'
import LeetCodeProblem, { ILeetCodeProblem } from '../models/LeetCodeProblem'

const router = express.Router()

// GET /api/leetcode - Get all LeetCode problems with optional filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { 
      difficulty, 
      topic, 
      page = 1, 
      limit = 20, 
      sortBy = 'dateCompleted', 
      sortOrder = 'desc',
      search 
    } = req.query

    // Build filter object
    const filter: any = {}
    
    if (difficulty) filter.difficulty = difficulty
    if (topic) filter.topic = { $in: Array.isArray(topic) ? topic : [topic] }
    if (search) {
      filter.$or = [
        { problemName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const problems = await LeetCodeProblem.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .exec()

    const total = await LeetCodeProblem.countDocuments(filter)

    res.json({
      problems,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: problems.length,
        totalProblems: total
      }
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch problems', message: error.message })
  }
})

// GET /api/leetcode/analytics - Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const totalProblems = await LeetCodeProblem.countDocuments()
    
    // Difficulty distribution
    const difficultyStats = await LeetCodeProblem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 }, avgTime: { $avg: '$timeSpent' } } },
      { $sort: { count: -1 } }
    ])

    // Topic distribution
    const topicStats = await LeetCodeProblem.aggregate([
      { $unwind: '$topic' },
      { $group: { _id: '$topic', count: { $sum: 1 }, avgTime: { $avg: '$timeSpent' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Monthly progress
    const monthlyProgress = await LeetCodeProblem.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$dateCompleted' },
            month: { $month: '$dateCompleted' }
          },
          count: { $sum: 1 },
          totalTime: { $sum: '$timeSpent' },
          avgSuccessRate: { $avg: '$successRate' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ])

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentActivity = await LeetCodeProblem.aggregate([
      { $match: { dateCompleted: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateCompleted' } },
          count: { $sum: 1 },
          totalTime: { $sum: '$timeSpent' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Overall stats
    const overallStats = await LeetCodeProblem.aggregate([
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$timeSpent' },
          avgTime: { $avg: '$timeSpent' },
          avgSuccessRate: { $avg: '$successRate' },
          totalAttempts: { $sum: '$attempts' }
        }
      }
    ])

    res.json({
      totalProblems,
      difficultyStats,
      topicStats,
      monthlyProgress,
      recentActivity,
      overallStats: overallStats[0] || {}
    })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch analytics', message: error.message })
  }
})

// GET /api/leetcode/:id - Get specific problem
router.get('/:id', async (req, res) => {
  try {
    const problem = await LeetCodeProblem.findById(req.params.id)
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }
    res.json(problem)
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch problem', message: error.message })
  }
})

// POST /api/leetcode - Add new LeetCode problem
router.post('/', async (req, res) => {
  try {
    const problemData = req.body
    
    // Check if problem number already exists
    const existingProblem = await LeetCodeProblem.findOne({ 
      problemNumber: problemData.problemNumber 
    })
    
    if (existingProblem) {
      return res.status(400).json({ 
        error: 'Problem number already exists',
        existingProblem: existingProblem.problemName
      })
    }

    const problem = new LeetCodeProblem(problemData)
    await problem.save()
    
    res.status(201).json(problem)
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    res.status(500).json({ error: 'Failed to create problem', message: error.message })
  }
})

// PUT /api/leetcode/:id - Update LeetCode problem
router.put('/:id', async (req, res) => {
  try {
    const problem = await LeetCodeProblem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }
    
    res.json(problem)
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    res.status(500).json({ error: 'Failed to update problem', message: error.message })
  }
})

// DELETE /api/leetcode/:id - Delete LeetCode problem
router.delete('/:id', async (req, res) => {
  try {
    const problem = await LeetCodeProblem.findByIdAndDelete(req.params.id)
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' })
    }
    
    res.json({ message: 'Problem deleted successfully', problem })
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete problem', message: error.message })
  }
})

// GET /api/leetcode/topics/list - Get all unique topics
router.get('/topics/list', async (req, res) => {
  try {
    const topics = await LeetCodeProblem.distinct('topic')
    res.json(topics.sort())
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch topics', message: error.message })
  }
})

export default router 