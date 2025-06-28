import express from 'express'
import axios from 'axios'

const router = express.Router()

// Helper function to get GitHub API headers
const getGitHubHeaders = () => ({
  'Authorization': `token ${process.env.GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Productivity-Dashboard'
})

// GET /api/github/user - Get authenticated user info
router.get('/user', async (req, res) => {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return res.status(401).json({ error: 'GitHub token not configured' })
    }

    const response = await axios.get('https://api.github.com/user', {
      headers: getGitHubHeaders()
    })

    res.json({
      username: response.data.login,
      name: response.data.name,
      avatar: response.data.avatar_url,
      bio: response.data.bio,
      location: response.data.location,
      publicRepos: response.data.public_repos,
      followers: response.data.followers,
      following: response.data.following,
      createdAt: response.data.created_at
    })
  } catch (error: any) {
    console.error('GitHub user fetch error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch GitHub user data',
      details: error.response?.data?.message || error.message
    })
  }
})

// GET /api/github/contributions - Get contribution data
router.get('/contributions', async (req, res) => {
  try {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_USERNAME) {
      return res.status(401).json({ error: 'GitHub credentials not configured' })
    }

    const username = process.env.GITHUB_USERNAME
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    
    // Get commits from the last year
    const response = await axios.get(`https://api.github.com/search/commits`, {
      headers: {
        ...getGitHubHeaders(),
        'Accept': 'application/vnd.github.cloak-preview+json'
      },
      params: {
        q: `author:${username} committer-date:>${oneYearAgo.toISOString().split('T')[0]}`,
        sort: 'committer-date',
        order: 'desc',
        per_page: 100
      }
    })

    // Process commits by date
    const commitsByDate: { [key: string]: number } = {}
    const commits = response.data.items || []

    commits.forEach((commit: any) => {
      const date = commit.commit.committer.date.split('T')[0]
      commitsByDate[date] = (commitsByDate[date] || 0) + 1
    })

    // Calculate streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (commitsByDate[dateStr]) {
        tempStreak++
        if (i === 0 || (commitsByDate[new Date(today.getTime() - (i-1) * 24*60*60*1000).toISOString().split('T')[0]])) {
          currentStreak = tempStreak
        }
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        if (i === 0) {
          // Check yesterday
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]
          if (!commitsByDate[yesterdayStr]) {
            currentStreak = 0
          }
        }
        tempStreak = 0
      }
    }

    // Generate contribution graph data
    const contributionData = []
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      contributionData.push({
        date: dateStr,
        count: commitsByDate[dateStr] || 0,
        level: Math.min(4, Math.floor((commitsByDate[dateStr] || 0) / 2))
      })
    }

    res.json({
      totalCommits: commits.length,
      currentStreak,
      longestStreak,
      contributionData,
      commitsByDate
    })
  } catch (error: any) {
    console.error('GitHub contributions fetch error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch GitHub contributions',
      details: error.response?.data?.message || error.message
    })
  }
})

// GET /api/github/repos - Get repository information
router.get('/repos', async (req, res) => {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return res.status(401).json({ error: 'GitHub token not configured' })
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: getGitHubHeaders(),
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 10
      }
    })

    const repos = response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      url: repo.html_url,
      topics: repo.topics || []
    }))

    res.json(repos)
  } catch (error: any) {
    console.error('GitHub repos fetch error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch GitHub repositories',
      details: error.response?.data?.message || error.message
    })
  }
})

// GET /api/github/stats - Get GitHub statistics
router.get('/stats', async (req, res) => {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return res.status(401).json({ error: 'GitHub token not configured' })
    }

    // Get user data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: getGitHubHeaders()
    })

    // Get repository languages
    const reposResponse = await axios.get('https://api.github.com/user/repos', {
      headers: getGitHubHeaders(),
      params: { per_page: 100 }
    })

    // Calculate language statistics
    const languageStats: { [key: string]: number } = {}
    const repos = reposResponse.data

    for (const repo of repos) {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1
      }
    }

    // Get recent activity
    const eventsResponse = await axios.get(`https://api.github.com/users/${userResponse.data.login}/events/public`, {
      headers: getGitHubHeaders(),
      params: { per_page: 10 }
    })

    const recentActivity = eventsResponse.data.map((event: any) => ({
      type: event.type,
      repo: event.repo.name,
      createdAt: event.created_at,
      action: getEventAction(event)
    }))

    res.json({
      totalRepos: userResponse.data.public_repos,
      totalStars: repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0),
      languageStats,
      recentActivity,
      followers: userResponse.data.followers,
      following: userResponse.data.following
    })
  } catch (error: any) {
    console.error('GitHub stats fetch error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch GitHub statistics',
      details: error.response?.data?.message || error.message
    })
  }
})

// Helper function to get human-readable event actions
function getEventAction(event: any): string {
  switch (event.type) {
    case 'PushEvent':
      return `Pushed ${event.payload.commits?.length || 1} commit(s)`
    case 'CreateEvent':
      return `Created ${event.payload.ref_type}`
    case 'WatchEvent':
      return 'Starred repository'
    case 'ForkEvent':
      return 'Forked repository'
    case 'IssueCommentEvent':
      return 'Commented on issue'
    case 'PullRequestEvent':
      return `${event.payload.action} pull request`
    case 'IssuesEvent':
      return `${event.payload.action} issue`
    default:
      return event.type.replace('Event', '')
  }
}

export default router 