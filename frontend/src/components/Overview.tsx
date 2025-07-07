import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { 
  Plus, 
  TrendingUp, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Target, 
  Activity, 
  Calendar,
  Coffee,
  Brain,
  ChevronRight,
  Trophy,
  Star,
  Zap,
  Code,
  Flame,
  Github,
  Music,
  Users,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ExternalLink,
  Volume2,
  RotateCcw,
  X,
  Flag,
  MapPin,
  Briefcase,
  Filter,
  RefreshCw,
  Building,
  History
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

// Productivity data types
interface TodayTask {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

interface TaskData {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'work' | 'personal' | 'learning' | 'health' | 'other'  
  estimatedTime: number
  day: string
  completedAt?: Date
}

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

interface CurrentTrackData {
  isPlaying: boolean
  track: SpotifyTrack | null
  device: any
}



// GitHub contribution chart component
const GitHubContributionChart: React.FC<{ contributionData?: any }> = ({ contributionData }) => {
  const [hoveredContribution, setHoveredContribution] = useState<{ date: string; count: number } | null>(null)
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number } | null>(null)

  // Generate mock contribution data for the past year
  const generateContributionData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const count = Math.floor(Math.random() * 5) // 0-4 contributions per day
      const daysSinceStart = Math.floor((d.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
      data.push({
        date: d.toISOString().split('T')[0],
        count,
        level: Math.min(4, Math.floor(count / 2)),
        dayOfWeek: d.getDay(),
        weekOfYear: Math.floor(daysSinceStart / 7)
      })
    }
    return data
  }

  const contributions = contributionData?.contributions?.contributionData || generateContributionData()
  const totalContributions = Array.isArray(contributions) ? contributions.reduce((sum: number, day: any) => sum + (day.count || 0), 0) : 0

  const getContributionColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800'
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-800'
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600'
    if (count === 3) return 'bg-emerald-600 dark:bg-emerald-500'
    return 'bg-emerald-700 dark:bg-emerald-400'
  }

  const handleMouseEnter = (contribution: any, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setHoveredContribution({
      date: new Date(contribution.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      count: contribution.count
    })
    setHoveredPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleMouseLeave = () => {
    setHoveredContribution(null)
    setHoveredPosition(null)
  }

  // Group contributions by week
  const weeks = []
  for (let i = 0; i < 53; i++) {
    const weekContributions = contributions.slice(i * 7, (i + 1) * 7)
    weeks.push(weekContributions)
  }

  return (
    <div className="relative">
      {/* Tooltip */}
      {hoveredContribution && hoveredPosition && (
        <div 
          className="fixed z-50 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{
            left: hoveredPosition.x,
            top: hoveredPosition.y,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="font-medium">{hoveredContribution.date}</div>
          <div className="text-slate-300">
            {hoveredContribution.count} contribution{hoveredContribution.count !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {totalContributions} contributions in the last year
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-800"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-600"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500"></div>
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-700 dark:bg-emerald-400"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Contribution grid */}
        <div className="overflow-x-auto">
          <div className="flex gap-0.5 min-w-fit">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const contribution = week[dayIndex]
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-2.5 h-2.5 rounded-sm cursor-pointer transition-all hover:scale-125 ${
                        contribution ? getContributionColor(contribution.count) : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      onMouseEnter={contribution ? (e) => handleMouseEnter(contribution, e) : undefined}
                      onMouseLeave={handleMouseLeave}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Spotify Square Player Component
const SpotifySquarePlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrackData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002'

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/spotify/status`)
      const data = await response.json()
      setIsAuthenticated(data.isAuthenticated)
      return data.isAuthenticated
    } catch (error) {
      console.error('Spotify auth status check failed:', error)
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
        setCurrentTrack(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null)
        setTimeout(fetchCurrentTrack, 500)
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
        setTimeout(fetchCurrentTrack, 1000)
      }
    } catch (error) {
      console.error('Skip failed:', error)
    }
  }

  // Handle authentication
  const handleAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/api/spotify/auth`)
      const data = await response.json()
      
      if (data.authURL) {
        window.location.href = data.authURL
      }
    } catch (error) {
      console.error('Authentication failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format time
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      const authenticated = await checkAuthStatus()
      if (authenticated) {
        await fetchCurrentTrack()
      }
      setLoading(false)
    }
    
    initialize()
  }, [checkAuthStatus, fetchCurrentTrack])

  // Auto-refresh
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchCurrentTrack, 10000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchCurrentTrack])

  // Check for auth success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('spotify_auth') === 'success') {
      window.history.replaceState({}, document.title, window.location.pathname)
      checkAuthStatus().then(authenticated => {
        if (authenticated) fetchCurrentTrack()
      })
    }
  }, [checkAuthStatus, fetchCurrentTrack])

  if (loading) {
    return (
      <Card className="glass-card h-full">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="glass-card h-full">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 
                          flex items-center justify-center">
            <Music className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Connect Spotify
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
            Control your music and see what you're listening to
          </p>
          <Button onClick={handleAuth} className="modern-button">
            <Music className="w-4 h-4 mr-2" />
            Connect Account
          </Button>
    </CardContent>
  </Card>
    )
  }

  if (!currentTrack?.track) {
    return (
      <Card className="glass-card h-full">
        <CardContent className="p-6 h-full flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 
                          flex items-center justify-center">
            <Music className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            No Music Playing
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
            Start playing music on Spotify to see it here
          </p>
          <Link to="/integrations">
            <Button variant="outline" size="sm">
              Open Full Player
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const track = currentTrack.track
  const progress = (track.progress / track.duration) * 100

  return (
    <Card className="glass-card h-full">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="relative">
            <img
              src={track.image}
              alt={track.album}
              className="w-40 h-40 rounded-lg shadow-lg"
            />
            {currentTrack.isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-green-500 animate-pulse"></div>
                    <div className="w-1 h-6 bg-green-500 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-3 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-1">
            {track.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
            {track.artists.join(', ')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{formatTime(track.progress)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
  </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSkip('previous')}
            className="w-8 h-8 p-0"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            className="w-10 h-10 p-0 rounded-full bg-green-500 hover:bg-green-600 text-white"
          >
            {currentTrack.isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSkip('next')}
            className="w-8 h-8 p-0"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Spotify Link */}
        <div className="mt-4 text-center">
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 
                       flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Open in Spotify
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

// Weekly Tasks Widget Component
const WeeklyTasksWidget: React.FC<{ 
  onTaskUpdate: (day: string, taskId: string) => void;
  selectedDay: string;
  onDaySelect: (day: string) => void;
  refreshTrigger?: number;
}> = ({ onTaskUpdate, selectedDay, onDaySelect, refreshTrigger }) => {
  const [weeklyTasks, setWeeklyTasks] = useState<any>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('weeklyTodos')
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks)
        // Convert date strings back to Date objects to match WeeklyTodos format
        const tasksWithDates: any = {}
        Object.keys(parsed).forEach(day => {
          tasksWithDates[day] = parsed[day].map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined
          }))
        })
        setWeeklyTasks(tasksWithDates)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      }
    }
  }, [refreshTrigger])

  const handleToggleComplete = (day: string, taskId: string) => {
    const updatedTasks = {
      ...weeklyTasks,
      [day]: weeklyTasks[day].map((task: any) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined
            }
          : task
      )
    }
    
    setWeeklyTasks(updatedTasks)
    localStorage.setItem('weeklyTodos', JSON.stringify(updatedTasks))
    onTaskUpdate(day, taskId)
  }

  const getTasksForDay = (day: string) => weeklyTasks[day] || []
  
  const getTodayString = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' })
  }

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {daysOfWeek.map((day) => {
        const tasks = getTasksForDay(day)
        const isToday = day === getTodayString()
        const isSelected = day === selectedDay
        const completedTasks = tasks.filter((task: any) => task.completed).length
        
        return (
          <div key={day} className="min-h-[200px]">
            <button
              onClick={() => onDaySelect(day)}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 shadow-md'
                  : isToday 
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              } hover:bg-slate-100 dark:hover:bg-slate-700 hover:shadow-sm`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-medium text-sm ${
                  isToday ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'
                }`}>
                  {day}
                  {isToday && (
                    <Badge variant="secondary" className="ml-1 text-xs">Today</Badge>
                  )}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {completedTasks}/{tasks.length}
    </span>
  </div>
              
              <div className="space-y-1">
                {tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No tasks
                  </p>
                ) : (
                  <>
                    {tasks.slice(0, 3).map((task: any) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleComplete(day, task.id)
                        }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          task.completed 
                            ? 'bg-emerald-500' 
                            : task.priority === 'high' 
                              ? 'bg-red-500' 
                              : task.priority === 'medium' 
                                ? 'bg-amber-500' 
                                : 'bg-slate-400'
                        }`} />
                        <span className={`truncate ${
                          task.completed 
                            ? 'line-through text-slate-400 dark:text-slate-500' 
                            : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        +{tasks.length - 3} more
                      </p>
                    )}
                  </>
                )}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Jobs Dashboard Component
const JobsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    newJobs: 0,
    appliedJobs: 0,
    remainingJobs: 0
  })
  const [filters, setFilters] = useState({
    days: '3',
    status: 'all',
    company: '',
    location: ''
  })

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002'

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      queryParams.append('days', filters.days)
      
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status)
      }
      if (filters.company && filters.company.trim()) {
        queryParams.append('company', filters.company.trim())
      }
      if (filters.location && filters.location.trim()) {
        queryParams.append('location', filters.location.trim())
      }

      // Fetch jobs and statistics in parallel
      const [jobsResponse, statsResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/api/jobs?${queryParams.toString()}`),
        fetch(`${API_BASE}/api/jobs/stats`)
      ])

      // Handle jobs response
      if (jobsResponse.status === 'fulfilled' && jobsResponse.value.ok) {
        const jobsData = await jobsResponse.value.json()
        setJobs(Array.isArray(jobsData.jobs) ? jobsData.jobs : [])
      } else {
        throw new Error('Failed to fetch jobs')
      }

      // Handle stats response
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        const statsData = await statsResponse.value.json()
        const byStatus = statsData.byStatus || {}
        setJobStats({
          totalJobs: Number(statsData.totalJobs) || 0,
          newJobs: Number(statsData.newJobsToday) || 0,
          appliedJobs: (Number(byStatus.applied) || 0) + (Number(byStatus.interview) || 0) + (Number(byStatus.offer) || 0),
          remainingJobs: (Number(byStatus.new) || 0) + (Number(byStatus.interested) || 0)
        })
      }
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err)
      setError(err.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [API_BASE, filters.days, filters.status, filters.company, filters.location])

  const triggerScrape = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs/scrape`, { method: 'POST' })
      if (response.ok) {
        await fetchJobs()
      }
    } catch (err: any) {
      console.error('Scrape failed:', err)
    }
  }

  // Debounced effect to prevent rapid API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [fetchJobs])

  const filteredJobs = jobs.slice(0, 6) // Show only 6 most recent jobs

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'interested': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'applied': return 'bg-green-50 text-green-700 border-green-200'
      case 'interview': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'offer': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const formatDate = (dateInput: any) => {
    try {
      if (!dateInput) return 'Unknown date'
      
      // Handle different input types
      let date: Date
      if (dateInput instanceof Date) {
        date = dateInput
      } else if (typeof dateInput === 'string') {
        // Try to parse the date string
        date = new Date(dateInput)
      } else {
        return 'Invalid date'
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }

      const now = new Date()
      const diffInMilliseconds = now.getTime() - date.getTime()
      const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInHours / 24)
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInDays === 1) return 'Yesterday'
      if (diffInDays < 7) return `${diffInDays} days ago`
      
      // For older dates, show in a consistent format
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Recent Job Opportunities
            </CardTitle>
            <CardDescription>
              Latest internships and entry-level positions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={triggerScrape}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Link to="/jobs">
              <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Job Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {jobStats.totalJobs}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Total Jobs
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {jobStats.remainingJobs}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              To Review
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {jobStats.appliedJobs}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Applied
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {jobStats.newJobs}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              New Today
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Select value={filters.days} onValueChange={(value) => setFilters(prev => ({ ...prev, days: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="2">2 Days</SelectItem>
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">1 Week</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search company..."
            value={filters.company}
            onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
            className="w-40"
          />

          <Input
            placeholder="Search location..."
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="w-40"
          />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-600 dark:text-slate-300" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading jobs: {error}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No jobs found matching your criteria
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job, index) => (
              <div key={job._id || index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {job.title}
                      </h3>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(job.postedDate)}
                      </div>
                    </div>
                    {job.salary && (
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                        {job.salary}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {job.source}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-300 dark:border-slate-600"
                      onClick={() => window.open(job.applicationUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Focus Timer Dashboard Component
const FocusTimerDashboard: React.FC = () => {
  // Timer settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    soundEnabled: true
  })

  // Timer state
  const [currentSession, setCurrentSession] = useState<'work' | 'shortBreak' | 'longBreak'>('work')
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionHistory, setSessionHistory] = useState<any[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const sessionConfigs = {
    work: {
      label: 'Focus Time',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      duration: settings.workDuration,
      icon: Brain
    },
    shortBreak: {
      label: 'Short Break',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      duration: settings.shortBreakDuration,
      icon: Coffee
    },
    longBreak: {
      label: 'Long Break',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      duration: settings.longBreakDuration,
      icon: Coffee
    }
  }

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions')
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      const todayStr = new Date().toDateString()
      const todaySessions = sessions.filter((session: any) => 
        new Date(session.startTime).toDateString() === todayStr
      )
      setSessionHistory(sessions.slice(0, 10)) // Show last 10 sessions
      setCompletedSessions(todaySessions.length)
      setWorkSessionsCompleted(todaySessions.filter((s: any) => s.type === 'work').length)
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Handle session completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      
      // Save completed session
      const completedSession = {
        id: `session-${Date.now()}`,
        type: currentSession,
        duration: sessionConfigs[currentSession].duration,
        completed: true,
        startTime: new Date(Date.now() - sessionConfigs[currentSession].duration * 60 * 1000),
        endTime: new Date()
      }

      const savedSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]')
      localStorage.setItem('pomodoroSessions', JSON.stringify([completedSession, ...savedSessions]))
      
      setSessionHistory(prev => [completedSession, ...prev].slice(0, 10))
      setCompletedSessions(prev => prev + 1)
      
      if (currentSession === 'work') {
        setWorkSessionsCompleted(prev => prev + 1)
        const nextSession = (workSessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
        setCurrentSession(nextSession)
        setTimeLeft(sessionConfigs[nextSession].duration * 60)
      } else {
        setCurrentSession('work')
        setTimeLeft(sessionConfigs.work.duration * 60)
      }

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer', {
          body: currentSession === 'work' ? 'Work session complete! Time for a break.' : 'Break complete! Ready to focus?',
          icon: '/favicon.ico'
        })
      }
    }
  }, [timeLeft, isRunning, currentSession, workSessionsCompleted])

  // Update timer when session type changes
  useEffect(() => {
    const config = sessionConfigs[currentSession]
    setTimeLeft(config.duration * 60)
  }, [currentSession, settings])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    const config = sessionConfigs[currentSession]
    setTimeLeft(config.duration * 60)
  }

  const switchSession = (type: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false)
    setCurrentSession(type)
  }

  const config = sessionConfigs[currentSession]
  const Icon = config.icon
  const progress = ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Focus Timer
            </CardTitle>
            <CardDescription>
              Use the Pomodoro Technique to boost your productivity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
            <Link to="/productivity">
              <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600">
                Full Timer
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {completedSessions}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Sessions Today
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {workSessionsCompleted}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Focus Sessions
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {Math.floor((workSessionsCompleted * 25) / 60)}h {(workSessionsCompleted * 25) % 60}m
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Focus Time
            </div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {workSessionsCompleted > 0 ? Math.floor(workSessionsCompleted / 4) : 0}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Pomodoro Cycles
            </div>
          </div>
        </div>

        {/* Session Type Selector */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {Object.entries(sessionConfigs).map(([type, conf]) => (
              <button
                key={type}
                onClick={() => switchSession(type as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentSession === type
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {conf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timer and Controls Section */}
        <div className="flex flex-col items-center space-y-6">
          {/* Timer Display */}
          <div className="relative">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                  className={config.color}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon className={`w-8 h-8 ${config.color} mb-2`} />
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {isRunning ? 'Running' : 'Paused'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={isRunning ? handlePause : handleStart}
              size="lg"
              className="px-8 py-3 text-lg modern-button"
            >
              {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg border-slate-300 dark:border-slate-600"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Recent Sessions */}
        {sessionHistory.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Recent Sessions
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {sessionHistory.slice(0, 3).map((session, index) => {
                const sessionConfig = sessionConfigs[session.type as keyof typeof sessionConfigs]
                const SessionIcon = sessionConfig?.icon || Clock
                return (
                  <div
                    key={session.id || index}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <SessionIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {sessionConfig?.label || 'Session'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {session.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(session.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="gradient-text">Session History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sessionHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="subtitle-text">No sessions completed yet</p>
              </div>
            ) : (
              sessionHistory.map((session, index) => {
                const sessionConfig = sessionConfigs[session.type as keyof typeof sessionConfigs]
                const SessionIcon = sessionConfig?.icon || Clock
                return (
                  <div
                    key={session.id || index}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <SessionIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {sessionConfig?.label || 'Session'}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {session.duration} minutes
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {new Date(session.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export const Overview: React.FC = () => {
  // State management
  const [leetCodeStreak, setLeetCodeStreak] = useState(7)
  const [problemsSolved, setProblemsSolved] = useState(142)
  const [todayTasks, setTodayTasks] = useState<TaskData[]>([])
  const [pomodoroSessionsToday, setPomodoroSessionsToday] = useState(0)
  const [githubData, setGithubData] = useState<any>(null)
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'work' as 'work' | 'personal' | 'learning' | 'health' | 'other',
    estimatedTime: ''
  })

  // Get today's day string
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  // Load tasks for selected day from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('weeklyTodos')
    if (savedTasks) {
      const weeklyData = JSON.parse(savedTasks)
      const tasks = weeklyData[selectedDay] || []
      setTodayTasks(tasks) // Show all tasks for selected day
    }
  }, [selectedDay])

  // Load today's Pomodoro sessions
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions')
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      const todayStr = new Date().toDateString()
      const todaySessions = sessions.filter((session: any) => 
        new Date(session.startTime).toDateString() === todayStr && 
        session.type === 'work'
      )
      setPomodoroSessionsToday(todaySessions.length)
    }
  }, [])

  // Load GitHub data
  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002'
        const [userRes, contributionsRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/github/user`),
          fetch(`${API_BASE}/api/github/contributions`)
        ])

        const data: any = {}
        
        if (userRes.status === 'fulfilled' && userRes.value.ok) {
          data.user = await userRes.value.json()
        }
        
        if (contributionsRes.status === 'fulfilled' && contributionsRes.value.ok) {
          data.contributions = await contributionsRes.value.json()
        }
        
        if (Object.keys(data).length > 0) {
          setGithubData(data)
        }
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error)
      }
    }

    fetchGitHubData()
  }, [])

  const completedToday = todayTasks.filter(task => task.completed).length

  const handleStartFocusSession = () => {
    window.location.href = '/productivity'
  }

  const handleTaskUpdate = (day: string, taskId: string) => {
    // Reload tasks if the updated day is the currently selected day
    if (day === selectedDay) {
      const savedTasks = localStorage.getItem('weeklyTodos')
      if (savedTasks) {
        const weeklyData = JSON.parse(savedTasks)
        const tasks = weeklyData[selectedDay] || []
        setTodayTasks(tasks)
      }
    }
  }

  const handleDaySelect = (day: string) => {
    setSelectedDay(day)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'work',
      estimatedTime: ''
    })
  }

  const handleAddTask = () => {
    if (!formData.title.trim()) return

    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      completed: false,
      priority: formData.priority,
      category: formData.category,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      day: selectedDay,
      createdAt: new Date(),
      completedAt: undefined
    }

    // Update localStorage directly like WeeklyTodos does
    const savedTasks = localStorage.getItem('weeklyTodos')
    const weeklyTasks = savedTasks ? JSON.parse(savedTasks) : {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    }
    
    weeklyTasks[selectedDay] = [...(weeklyTasks[selectedDay] || []), newTask]
    localStorage.setItem('weeklyTodos', JSON.stringify(weeklyTasks))

    // Update local state and trigger refresh
    setTodayTasks(weeklyTasks[selectedDay])
    
    // Trigger update for WeeklyTasksWidget
    handleTaskUpdate(selectedDay, newTask.id)
    setRefreshTrigger(prev => prev + 1)
    
    resetForm()
    setShowAddDialog(false)
  }

  const openAddDialog = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const closeAddDialog = () => {
    setShowAddDialog(false)
    resetForm()
  }

  const toggleTask = (taskId: string) => {
    const updatedTasks = todayTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTodayTasks(updatedTasks)
    
    // Save to localStorage
    const savedTasks = localStorage.getItem('weeklyTodos')
    if (savedTasks) {
      const weeklyData = JSON.parse(savedTasks)
      weeklyData[selectedDay] = updatedTasks
      localStorage.setItem('weeklyTodos', JSON.stringify(weeklyData))
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950/30'
      case 'medium': return 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950/30'
      case 'low': return 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950/30'
      default: return 'border-slate-200 text-slate-700 bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800'
    }
  }

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-xl subtitle-text">
              Ready to crush your goals today? Let's make it productive.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleStartFocusSession} className="modern-button">
              <Target className="w-4 h-4 mr-2" />
              Start Focus Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Focus Timer Widget - Full Width */}
        <div className="lg:col-span-2">
          <FocusTimerDashboard />
        </div>

        {/* Large Square Spotify Player */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold gradient-text">Now Playing</h3>
          </div>
          <SpotifySquarePlayer />
        </div>
      </div>

      {/* GitHub Contribution Chart - Long Rectangle */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Github className="w-5 h-5" />
                GitHub Contribution Activity
              </CardTitle>
              <CardDescription>
                Your coding journey over the past year
              </CardDescription>
            </div>
            <Link to="/integrations">
              <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Github className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <GitHubContributionChart contributionData={githubData} />
        </CardContent>
      </Card>

      {/* Weekly Planning & Today's Focus */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="gradient-text">Weekly Planning & Today's Focus</CardTitle>
            <CardDescription>
              Manage your tasks across the week
            </CardDescription>
          </div>
          <Link to="/productivity">
            <Button size="sm" className="modern-button">
              Full View
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weekly Tasks Overview - Left Side */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Weekly Overview
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Click on a day to view its tasks in detail
                </p>
              </div>
              <WeeklyTasksWidget 
                onTaskUpdate={handleTaskUpdate}
                selectedDay={selectedDay}
                onDaySelect={handleDaySelect}
                refreshTrigger={refreshTrigger}
              />
            </div>

            {/* Today's Tasks Detail - Right Side */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                  {selectedDay === 'today' ? "Today's Tasks" : `${selectedDay} Tasks`}
                </h3>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  size="sm"
                  className="modern-button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks for {selectedDay === 'today' ? 'today' : selectedDay}</p>
                  </div>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        task.completed
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                            }`}
                          >
                            {task.completed && <CheckCircle className="w-3 h-3" />}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-medium ${
                              task.completed 
                                ? 'text-emerald-700 dark:text-emerald-300 line-through' 
                                : 'text-slate-900 dark:text-white'
                            }`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                              {task.estimatedTime && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.estimatedTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Dashboard */}
      <JobsDashboard />

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="gradient-text">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/leetcode">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600">
                <Code className="w-6 h-6" />
                <span className="text-sm">LeetCode</span>
              </Button>
            </Link>
            <Link to="/productivity">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600">
                <Target className="w-6 h-6" />
                <span className="text-sm">Productivity</span>
              </Button>
            </Link>
            <Link to="/integrations">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600">
                <Zap className="w-6 h-6" />
                <span className="text-sm">Integrations</span>
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600">
                <Briefcase className="w-6 h-6" />
                <span className="text-sm">Jobs</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Task to {selectedDay}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                Task Title *
              </label>
              <Input
                placeholder="Enter task title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Add a description (optional)..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="work">💼 Work</option>
                  <option value="personal">👤 Personal</option>
                  <option value="learning">📚 Learning</option>
                  <option value="health">💪 Health</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                Estimated Time (minutes)
              </label>
              <Input
                type="number"
                placeholder="e.g., 30"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                className="w-full"
                min="1"
                max="480"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={closeAddDialog} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAddTask} 
                className="flex-1 modern-button"
                disabled={!formData.title.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 