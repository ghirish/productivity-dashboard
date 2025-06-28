import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Github, 
  Star, 
  GitFork, 
  Calendar, 
  MapPin, 
  Users, 
  Activity,
  Eye,
  Code,
  Flame,
  Award,
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

// Types
interface GitHubUser {
  username: string
  name: string
  avatar: string
  bio: string
  location: string
  publicRepos: number
  followers: number
  following: number
  createdAt: string
}

interface Repository {
  id: number
  name: string
  fullName: string
  description: string
  language: string
  stars: number
  forks: number
  isPrivate: boolean
  updatedAt: string
  url: string
  topics: string[]
}

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface GitHubStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  languageStats: { [key: string]: number }
  recentActivity: Array<{
    type: string
    repo: string
    createdAt: string
    action: string
  }>
  followers: number
  following: number
}

interface ContributionData {
  totalCommits: number
  currentStreak: number
  longestStreak: number
  contributionData: ContributionDay[]
}

// Language colors mapping
const languageColors: { [key: string]: string } = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  React: '#61dafb',
  Vue: '#4FC08D',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#fa7343',
  Kotlin: '#F18E33'
}

export const GitHubSection: React.FC = () => {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [contributions, setContributions] = useState<ContributionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'

  const fetchGitHubData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [userRes, reposRes, statsRes, contributionsRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/github/user`),
        fetch(`${API_BASE}/api/github/repos`),
        fetch(`${API_BASE}/api/github/stats`),
        fetch(`${API_BASE}/api/github/contributions`)
      ])

      // Process user data
      if (userRes.status === 'fulfilled' && userRes.value.ok) {
        const userData = await userRes.value.json()
        setUser(userData)
      } else if (userRes.status === 'fulfilled') {
        const errorData = await userRes.value.json()
        throw new Error(errorData.error || 'Failed to fetch user data')
      }

      // Process repos data
      if (reposRes.status === 'fulfilled' && reposRes.value.ok) {
        const reposData = await reposRes.value.json()
        setRepos(reposData)
      }

      // Process stats data
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const statsData = await statsRes.value.json()
        setStats(statsData)
      }

      // Process contributions data
      if (contributionsRes.status === 'fulfilled' && contributionsRes.value.ok) {
        const contributionsData = await contributionsRes.value.json()
        setContributions(contributionsData)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub data')
      console.error('GitHub data fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchGitHubData()
  }, [])

  const handleRefresh = () => {
    fetchGitHubData(true)
  }

  const getContributionColor = (level: number): string => {
    const colors = [
      'bg-slate-100 dark:bg-slate-800', // 0 contributions
      'bg-emerald-200 dark:bg-emerald-900', // 1-2 contributions
      'bg-emerald-400 dark:bg-emerald-700', // 3-4 contributions
      'bg-emerald-600 dark:bg-emerald-500', // 5-7 contributions
      'bg-emerald-800 dark:bg-emerald-300'  // 8+ contributions
    ]
    return colors[Math.min(level, 4)]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-300" />
              <span className="text-lg font-medium text-slate-700 dark:text-slate-200">
                Loading GitHub data...
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-card p-8">
          <div className="text-center">
            <Github className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              GitHub Not Connected
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              {error}
            </p>
            <Button onClick={handleRefresh} className="modern-button">
              Try Again
            </Button>
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
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name || user.username}
                className="w-20 h-20 rounded-full ring-4 ring-slate-200 dark:ring-slate-700"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                {user?.name || user?.username || 'GitHub Dashboard'}
              </h1>
              {user?.username && (
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  @{user.username}
                </p>
              )}
              {user?.bio && (
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                {user?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-slate-300 dark:border-slate-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Repositories
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalRepos || user?.publicRepos || 0}
                </p>
              </div>
              <Code className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Total Stars
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalStars || 0}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Current Streak
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {contributions?.currentStreak || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  days
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Followers
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {user?.followers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contribution Graph */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Contribution Activity</CardTitle>
            <p className="subtitle-text">
              {contributions?.totalCommits || 0} contributions in the last year
            </p>
          </CardHeader>
          <CardContent>
            {contributions?.contributionData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-53 gap-1">
                  {contributions.contributionData.map((day, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-sm ${getContributionColor(day.level)}`}
                      title={`${day.count} contributions on ${day.date}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-slate-600 dark:text-slate-300">
                        Longest streak: {contributions.longestStreak} days
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Less</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">More</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No contribution data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Top Languages</CardTitle>
            <p className="subtitle-text">
              Most used programming languages
            </p>
          </CardHeader>
          <CardContent>
            {stats?.languageStats ? (
              <div className="space-y-3">
                {Object.entries(stats.languageStats)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([language, count]) => {
                    const percentage = Math.round((count / Object.values(stats.languageStats).reduce((a, b) => a + b, 0)) * 100)
                    return (
                      <div key={language} className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: languageColors[language] || '#6b7280' }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                              {language}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: languageColors[language] || '#6b7280'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No language data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Repositories and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Repositories */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Recent Repositories</CardTitle>
            <p className="subtitle-text">
              Latest updated repositories
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {repos.slice(0, 5).map((repo) => (
                <div key={repo.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                          {repo.name}
                        </h4>
                        {repo.isPrivate && (
                          <Badge variant="outline" className="text-xs">
                            Private
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: languageColors[repo.language] || '#6b7280' }}
                            />
                            {repo.language}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {repo.forks}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(repo.updatedAt)}
                        </div>
                      </div>
                    </div>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </a>
                  </div>
                  {repo.topics.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Recent Activity</CardTitle>
            <p className="subtitle-text">
              Latest GitHub activity
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 6).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Activity className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.repo} • {formatTimeAgo(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No recent activity
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 