import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
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
  Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { SpotifyMiniPlayer } from './SpotifyMiniPlayer'

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
}

export const Overview: React.FC = () => {
  // Mock data - in real app, this would come from state/API
  const [leetCodeStreak, setLeetCodeStreak] = useState(7)
  const [problemsSolved, setProblemsSolved] = useState(142)
  const [weeklyGoal, setWeeklyGoal] = useState(5)
  const [todayTasks, setTodayTasks] = useState<TaskData[]>([])
  const [pomodoroSessionsToday, setPomodoroSessionsToday] = useState(0)
  const [githubData, setGithubData] = useState<any>(null)

  // Get today's day string
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  // Load today's tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('weeklyTodos')
    if (savedTasks) {
      const weeklyData = JSON.parse(savedTasks)
      const tasks = weeklyData[today] || []
      setTodayTasks(tasks.slice(0, 3)) // Show first 3 tasks
    }
  }, [today])

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
    const fetchGitHubPreview = async () => {
      try {
        const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000'
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
        console.error('Failed to fetch GitHub preview:', error)
      }
    }

    fetchGitHubPreview()
  }, [])

  const completedToday = todayTasks.filter(task => task.completed).length

  const stats = [
    {
      title: 'LeetCode Streak',
      value: leetCodeStreak,
      unit: 'days',
      icon: BookOpen,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      trend: '+2 from yesterday'
    },
    {
      title: 'Problems Solved',
      value: problemsSolved,
      unit: 'total',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      trend: 'All time record!'
    },
    {
      title: 'Focus Sessions',
      value: pomodoroSessionsToday,
      unit: 'today',
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      trend: 'Stay focused!'
    },
    {
      title: 'Tasks Done',
      value: completedToday,
      unit: `of ${todayTasks.length}`,
      icon: CheckCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      trend: 'Keep it up!'
    }
  ]

  const achievements = [
    { id: 1, title: 'Week Warrior', description: '7-day streak!', icon: Trophy, unlocked: true },
    { id: 2, title: 'Problem Solver', description: '100+ problems', icon: Star, unlocked: true },
    { id: 3, title: 'Focus Master', description: '50 Pomodoros', icon: Zap, unlocked: false },
    { id: 4, title: 'Consistency King', description: '30-day streak', icon: Target, unlocked: false }
  ]

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
  }

  const handleStartFocusSession = () => {
    // This would navigate to the productivity page and start a session
    window.location.href = '/productivity'
  }

  const totalTasks = todayTasks.length
  const completionRate = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0

  // Mock data for demonstration
  const mockData = {
    weeklyGoal: 25,
    completedThisWeek: 18,
    streak: 12,
    totalProblemsCompleted: 247,
    averageTime: '15m',
    strongestTopic: 'Dynamic Programming',
    productivityScore: 85
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className={`glass-card hover:scale-105 transition-all duration-300 animate-slide-up ${stat.bg}`} 
                  style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {stat.unit}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Productivity */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="gradient-text">Today's Focus</CardTitle>
              <p className="subtitle-text mt-1">Your productivity at a glance</p>
            </div>
            <Link to="/productivity">
              <Button size="sm" className="modern-button">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Pomodoro Status */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Focus Sessions
                  </span>
                </div>
                <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
                  {pomodoroSessionsToday} today
                </Badge>
              </div>
              <Link to="/productivity">
                <Button variant="outline" size="sm" className="w-full border-slate-300 dark:border-slate-600">
                  <Clock className="w-4 h-4 mr-2" />
                  Start Pomodoro Timer
                </Button>
              </Link>
            </div>

            {/* Today's Tasks Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">
                  Today's Tasks
                </h4>
                <Link to="/productivity">
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {todayTasks.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                    No tasks for today yet
                  </p>
                  <Link to="/productivity">
                    <Button size="sm" className="modern-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        task.completed 
                          ? 'bg-emerald-500' 
                          : task.priority === 'high' 
                            ? 'bg-red-500' 
                            : task.priority === 'medium' 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${
                          task.completed 
                            ? 'line-through text-slate-500 dark:text-slate-400' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {task.title}
                        </span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                  {todayTasks.length >= 3 && (
                    <Link to="/productivity">
                      <div className="text-center py-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View all tasks
                        </Button>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Achievements</CardTitle>
            <p className="subtitle-text">Your progress milestones</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        achievement.unlocked ? 'text-white' : 'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${
                        achievement.unlocked 
                          ? 'text-slate-900 dark:text-white' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spotify Mini Player */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold gradient-text mb-4">Now Playing</h3>
          <SpotifyMiniPlayer />
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LeetCode Progress */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">LeetCode Progress</CardTitle>
            <p className="subtitle-text">Weekly coding practice</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Weekly Goal
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {mockData.completedThisWeek} / {mockData.weeklyGoal}
                </span>
              </div>
              <Progress value={(mockData.completedThisWeek / mockData.weeklyGoal) * 100} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockData.totalProblemsCompleted}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Solved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockData.averageTime}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Avg Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockData.streak}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Day Streak</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Strongest: {mockData.strongestTopic}
                  </span>
                  <Link to="/leetcode">
                    <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Practice
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="gradient-text">GitHub Activity</CardTitle>
            <p className="subtitle-text">Your development journey</p>
          </CardHeader>
          <CardContent>
            {githubData ? (
              <div className="space-y-4">
                {githubData.user && (
                  <div className="flex items-center gap-3">
                    <img
                      src={githubData.user.avatar}
                      alt={githubData.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {githubData.user.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        @{githubData.user.username}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {githubData.user?.publicRepos || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Repositories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {githubData.contributions?.currentStreak || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {githubData.contributions?.totalCommits || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Commits</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Link to="/integrations">
                    <Button size="sm" variant="outline" className="w-full border-slate-300 dark:border-slate-600">
                      <Github className="w-4 h-4 mr-2" />
                      View Full Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Github className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Connect GitHub
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Track your coding activity and contributions
                </p>
                <Link to="/integrations">
                  <Button className="modern-button">
                    <Github className="w-4 h-4 mr-2" />
                    Connect GitHub
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 