import express from 'express'
import Job from '../models/Job'
import jobScraper from '../services/jobScraper'

const router = express.Router()

// GET /api/jobs - Get all job postings with filtering
router.get('/', async (req, res) => {
  try {
    const {
      days = '3',
      status,
      company,
      location,
      source,
      page = '1',
      limit = '50'
    } = req.query

    // Build filter query
    const filter: any = { isActive: true }

    // Filter by date (last N days)
    if (days) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string))
      filter.postedDate = { $gte: cutoffDate }
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status
    }

    // Filter by company (case-insensitive search)
    if (company) {
      filter.company = { $regex: company as string, $options: 'i' }
    }

    // Filter by location (case-insensitive search)
    if (location) {
      filter.location = { $regex: location as string, $options: 'i' }
    }

    // Filter by source
    if (source) {
      filter.source = source
    }

    // Pagination
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Execute query
    const jobs = await Job.find(filter)
      .sort({ postedDate: -1, scrapedAt: -1 })
      .skip(skip)
      .limit(limitNum)

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter)
    const totalPages = Math.ceil(totalJobs / limitNum)

    // Get summary statistics
    const stats = await Job.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const summary = {
      total: totalJobs,
      new: stats.find(s => s._id === 'new')?.count || 0,
      interested: stats.find(s => s._id === 'interested')?.count || 0,
      applied: stats.find(s => s._id === 'applied')?.count || 0,
      interview: stats.find(s => s._id === 'interview')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      offer: stats.find(s => s._id === 'offer')?.count || 0
    }

    res.json({
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      summary,
      filters: {
        days: parseInt(days as string),
        status,
        company,
        location,
        source
      }
    })

  } catch (error: any) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ error: 'Failed to fetch jobs', message: error.message })
  }
})

// GET /api/jobs/scrape - Trigger manual job scraping
router.get('/scrape', async (req, res) => {
  try {
    console.log('🚀 Starting manual job scraping...')
    const results = await jobScraper.scrapeAllJobs()
    
    res.json({
      message: 'Job scraping completed',
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error during scraping:', error)
    res.status(500).json({ 
      error: 'Scraping failed', 
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// GET /api/jobs/recent - Get recent jobs (last 3 days)
router.get('/recent', async (req, res) => {
  try {
    const { days = '3' } = req.query
    const jobs = await jobScraper.getRecentJobs(parseInt(days as string))
    
    res.json({
      jobs,
      count: jobs.length,
      days: parseInt(days as string)
    })
  } catch (error: any) {
    console.error('Error fetching recent jobs:', error)
    res.status(500).json({ error: 'Failed to fetch recent jobs', message: error.message })
  }
})

// PUT /api/jobs/:id/status - Update job application status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes } = req.body

    const validStatuses = ['new', 'interested', 'applied', 'interview', 'rejected', 'offer']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status', 
        validStatuses 
      })
    }

    const updateData: any = { status }
    
    // Set appliedAt date when marking as applied
    if (status === 'applied') {
      updateData.appliedAt = new Date()
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes
    }

    const job = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json({
      message: `Job status updated to ${status}`,
      job
    })

  } catch (error: any) {
    console.error('Error updating job status:', error)
    res.status(500).json({ error: 'Failed to update job status', message: error.message })
  }
})

// POST /api/jobs/:id/apply - Mark job as applied (shortcut for status update)
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body

    const updateData: any = { 
      status: 'applied',
      appliedAt: new Date()
    }
    
    if (notes) {
      updateData.notes = notes
    }

    const job = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json({
      message: 'Job marked as applied',
      job
    })

  } catch (error: any) {
    console.error('Error marking job as applied:', error)
    res.status(500).json({ error: 'Failed to mark job as applied', message: error.message })
  }
})

// GET /api/jobs/applications - Get application history
router.get('/applications', async (req, res) => {
  try {
    const { status = 'applied', page = '1', limit = '20' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Get applied jobs
    const filter: any = { isActive: true }
    
    if (status === 'applied') {
      filter.status = { $in: ['applied', 'interview', 'rejected', 'offer'] }
    } else {
      filter.status = status
    }

    const applications = await Job.find(filter)
      .sort({ appliedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)

    const totalApplications = await Job.countDocuments(filter)
    const totalPages = Math.ceil(totalApplications / limitNum)

    // Get application statistics
    const appStats = await Job.aggregate([
      { $match: { isActive: true, status: { $in: ['applied', 'interview', 'rejected', 'offer'] } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const applicationSummary = {
      total: totalApplications,
      applied: appStats.find(s => s._id === 'applied')?.count || 0,
      interview: appStats.find(s => s._id === 'interview')?.count || 0,
      rejected: appStats.find(s => s._id === 'rejected')?.count || 0,
      offer: appStats.find(s => s._id === 'offer')?.count || 0
    }

    res.json({
      applications,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalApplications,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      summary: applicationSummary
    })

  } catch (error: any) {
    console.error('Error fetching applications:', error)
    res.status(500).json({ error: 'Failed to fetch applications', message: error.message })
  }
})

// GET /api/jobs/stats - Get job statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = '7' } = req.query
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days as string))

    // Get overall stats
    const totalJobs = await Job.countDocuments({ isActive: true })
    const recentJobs = await Job.countDocuments({ 
      isActive: true, 
      postedDate: { $gte: cutoffDate } 
    })

    // Status distribution
    const statusStats = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Source distribution
    const sourceStats = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ])

    // Top companies
    const topCompanies = await Job.aggregate([
      { $match: { isActive: true, postedDate: { $gte: cutoffDate } } },
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Recent activity (jobs per day for last week)
    const dailyStats = await Job.aggregate([
      { $match: { isActive: true, postedDate: { $gte: cutoffDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$postedDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const stats = {
      overview: {
        totalJobs,
        recentJobs: recentJobs,
        daysRange: parseInt(days as string)
      },
      statusDistribution: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {} as any),
      sourceDistribution: sourceStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {} as any),
      topCompanies: topCompanies.map(company => ({
        name: company._id,
        jobCount: company.count
      })),
      dailyActivity: dailyStats.map(day => ({
        date: day._id,
        jobs: day.count
      }))
    }

    res.json(stats)

  } catch (error: any) {
    console.error('Error fetching job stats:', error)
    res.status(500).json({ error: 'Failed to fetch job statistics', message: error.message })
  }
})

// DELETE /api/jobs/:id - Soft delete a job (mark as inactive)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const job = await Job.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json({
      message: 'Job deleted successfully',
      job
    })

  } catch (error: any) {
    console.error('Error deleting job:', error)
    res.status(500).json({ error: 'Failed to delete job', message: error.message })
  }
})

export default router 