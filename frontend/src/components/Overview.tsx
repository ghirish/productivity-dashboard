import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
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
  Flag
} from 'lucide-react'
import { Link } from 'react-router-dom'

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

// Focus Timer Widget Component
const FocusTimerWidget: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work')
  const [sessionsToday, setSessionsToday] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('pomodoroSessions')
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      const todayStr = new Date().toDateString()
      const todaySessions = sessions.filter((session: any) => 
        new Date(session.startTime).toDateString() === todayStr && 
        session.type === 'work'
      )
      setSessionsToday(todaySessions.length)
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
        type: sessionType,
        duration: sessionType === 'work' ? 25 : 5,
        completed: true,
        startTime: new Date(Date.now() - (sessionType === 'work' ? 25 : 5) * 60 * 1000),
        endTime: new Date()
      }

      const savedSessions = JSON.parse(localStorage.getItem('pomodoroSessions') || '[]')
      localStorage.setItem('pomodoroSessions', JSON.stringify([completedSession, ...savedSessions]))
      
      if (sessionType === 'work') {
        setSessionsToday(prev => prev + 1)
        setSessionType('break')
        setTimeLeft(5 * 60) // 5 minute break
      } else {
        setSessionType('work')
        setTimeLeft(25 * 60) // 25 minute work session
      }

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Focus Timer', {
          body: sessionType === 'work' ? 'Work session complete! Time for a break.' : 'Break complete! Ready to focus?',
          icon: '/favicon.ico'
        })
      }
    }
  }, [timeLeft, isRunning, sessionType])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setSessionType('work')
    setTimeLeft(25 * 60)
  }

  const progress = sessionType === 'work' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Focus Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Type Indicator */}
        <div className="text-center">
          <Badge variant={sessionType === 'work' ? 'default' : 'secondary'} className="mb-2">
            {sessionType === 'work' ? 'Work Session' : 'Break Time'}
          </Badge>
        </div>

        {/* Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke={sessionType === 'work' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isRunning ? 'Running' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button
            onClick={isRunning ? handlePause : handleStart}
            className={sessionType === 'work' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Sessions Today */}
        <div className="text-center pt-2">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Sessions Today: <span className="font-semibold">{sessionsToday}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
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
  const maxWeek = Math.max(...contributions.map((c: any) => c.weekOfYear))
  
  for (let week = 0; week <= maxWeek; week++) {
    const weekContributions = contributions.filter((c: any) => c.weekOfYear === week)
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
                  const contribution = week.find((c: any) => c.dayOfWeek === dayIndex)
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

        {/* Month labels */}
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jul</span>
          <span>Sep</span>
          <span>Nov</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Condensed Stats Square */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Today's Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* LeetCode Streak */}
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {leetCodeStreak}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">
                  LeetCode Streak
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  days
                </div>
              </div>

              {/* Problems Solved */}
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {problemsSolved}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  Problems Solved
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  total
                </div>
              </div>

              {/* Focus Sessions */}
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {pomodoroSessionsToday}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">
                  Focus Sessions
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  today
                </div>
              </div>

              {/* Tasks Done */}
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {completedToday}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  Tasks Done
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  of {todayTasks.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus Timer Widget */}
        <FocusTimerWidget />

        {/* Large Square Spotify Player */}
        <div className="lg:col-span-2">
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
              <CardTitle className="gradient-text">GitHub Contribution Activity</CardTitle>
              <p className="subtitle-text mt-1">Your coding journey over the past year</p>
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

      {/* Today's Focus - Redesigned */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="gradient-text">Weekly Planning & Today's Focus</CardTitle>
            <p className="subtitle-text mt-1">Manage your tasks across the week</p>
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
              <div className="mb-4">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  {selectedDay === today ? "Today's Tasks" : `${selectedDay}'s Tasks`}
                </h3>
                <div className="flex items-center gap-2">
                  {selectedDay === today && (
                    <Badge variant="secondary" className="text-xs">Today</Badge>
                  )}
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {todayTasks.filter(t => t.completed).length} of {todayTasks.length} completed
                  </span>
                </div>
              </div>

              {/* Detailed Task List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      No tasks for {selectedDay === today ? 'today' : selectedDay} yet
                    </p>
                    <Button onClick={openAddDialog} size="sm" className="modern-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                ) : (
                  <>
                    {todayTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                            task.completed 
                              ? 'bg-emerald-500' 
                              : task.priority === 'high' 
                                ? 'bg-red-500' 
                                : task.priority === 'medium' 
                                  ? 'bg-amber-500' 
                                  : 'bg-slate-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${
                                task.completed 
                                  ? 'line-through text-slate-500 dark:text-slate-400' 
                                  : 'text-slate-900 dark:text-white'
                              }`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </Badge>
                                {task.estimatedTime && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.estimatedTime}m
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {task.description && (
                              <p className={`text-xs ${
                                task.completed 
                                  ? 'line-through text-slate-400 dark:text-slate-500' 
                                  : 'text-slate-600 dark:text-slate-300'
                              }`}>
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                              {task.completed && task.completedAt && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Button onClick={openAddDialog} variant="outline" size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add More Tasks
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="gradient-text">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to="/leetcode">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 border-slate-300 dark:border-slate-600">
                <BookOpen className="w-5 h-5" />
                <span className="text-xs">LeetCode</span>
              </Button>
            </Link>
            <Link to="/productivity">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 border-slate-300 dark:border-slate-600">
                <Target className="w-5 h-5" />
                <span className="text-xs">Productivity</span>
              </Button>
            </Link>
            <Link to="/integrations">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 border-slate-300 dark:border-slate-600">
                <Zap className="w-5 h-5" />
                <span className="text-xs">Integrations</span>
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-1 border-slate-300 dark:border-slate-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs">Analytics</span>
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