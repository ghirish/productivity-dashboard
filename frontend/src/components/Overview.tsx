import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { PomodoroTimer } from './PomodoroTimer'
import { SpotifyPlayer } from './SpotifyPlayer'
import { 
  Clock, 
  MapPin, 
  Building, 
  Briefcase, 
  RefreshCw, 
  ChevronRight, 
  ExternalLink,
  Play,
  Pause,
  Plus,
  CheckCircle,
  Code,
  Zap,
  Target,
  Github,
  X,
  Calendar,
  BarChart3,
  Circle,
  Edit,
  Trash2,
  GripVertical,
  Flag
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Textarea } from './ui/textarea'

// Add ResizeObserver error suppression
if (typeof window !== 'undefined') {
  const resizeObserverErrorHandler = (e: ErrorEvent) => {
    if (e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }
  window.addEventListener('error', resizeObserverErrorHandler)
}

// GitHub Contribution Chart Component
interface GitHubContributionChartProps {
  contributionData: any
}

const GitHubContributionChart: React.FC<GitHubContributionChartProps> = ({ contributionData }) => {
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

  if (!contributionData?.contributions?.contributionData) {
    return (
      <div className="text-center py-8">
        <Github className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          No contribution data available
        </p>
      </div>
    )
  }

  const contributions = contributionData.contributions

  return (
    <div className="space-y-4">
      {/* Contribution grid */}
      <div className="overflow-x-auto">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 53 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dataIndex = weekIndex * 7 + dayIndex
                const dayData = contributions.contributionData[dataIndex]
                return dayData ? (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getContributionColor(dayData.level)}`}
                    title={`${dayData.count} contributions on ${formatDate(dayData.date)}`}
                  />
                ) : (
                  <div
                    key={dayIndex}
                    className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-600 dark:text-slate-300">
            {contributions.totalCommits || 0} contributions in the last year
          </span>
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
  )
}

// Types for the integrated planner
type TaskPriority = 'low' | 'medium' | 'high'
type TaskCategory = 'work' | 'personal' | 'learning' | 'health' | 'other'

interface TodoTask {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  category: TaskCategory
  estimatedTime?: number // in minutes
  createdAt: Date
  completedAt?: Date
}

interface DayTasks {
  [key: string]: TodoTask[]
}

const daysOfWeek = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const priorityColors = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
}

const categoryColors = {
  work: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  personal: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  learning: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
  health: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200'
}

const priorityIcons = {
  low: '🟢',
  medium: '🟡', 
  high: '🔴'
}

// Integrated Weekly Tasks Component
interface IntegratedWeeklyPlannerProps {
  refreshTrigger: number
  onRefreshTrigger: () => void
}

const IntegratedWeeklyPlanner: React.FC<IntegratedWeeklyPlannerProps> = ({ 
  refreshTrigger, 
  onRefreshTrigger 
}) => {
  const [tasks, setTasks] = useState<DayTasks>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  })
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  )
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<{ task: TodoTask; day: string } | null>(null)
  const [draggedTask, setDraggedTask] = useState<{ task: TodoTask; sourceDay: string } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'work' as TaskCategory,
    estimatedTime: ''
  })

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('weeklyTodos')
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks)
        const tasksWithDates: DayTasks = {}
        Object.keys(parsed).forEach(day => {
          tasksWithDates[day] = parsed[day].map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined
          }))
        })
        setTasks(tasksWithDates)
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error)
      }
    }
    setIsInitialized(true)
  }, [refreshTrigger])

  // Save tasks to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('weeklyTodos', JSON.stringify(tasks))
      onRefreshTrigger()
    }
  }, [tasks, isInitialized]) // Remove onRefreshTrigger from dependencies

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

    const newTask: TodoTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      completed: false,
      priority: formData.priority,
      category: formData.category,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      createdAt: new Date()
    }

    setTasks(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newTask]
    }))

    resetForm()
    setShowAddDialog(false)
  }

  const handleEditTask = () => {
    if (!editingTask || !formData.title.trim()) return

    const updatedTask: TodoTask = {
      ...editingTask.task,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined
    }

    setTasks(prev => ({
      ...prev,
      [editingTask.day]: prev[editingTask.day].map(task =>
        task.id === editingTask.task.id ? updatedTask : task
      )
    }))

    resetForm()
    setEditingTask(null)
  }

  const handleDeleteTask = (day: string, taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [day]: prev[day].filter(task => task.id !== taskId)
    }))
  }

  const handleToggleComplete = (day: string, taskId: string) => {
    setTasks(prev => ({
      ...prev,
      [day]: prev[day].map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined
            }
          : task
      )
    }))
  }

  const openAddDialog = (day?: string) => {
    if (day) setSelectedDay(day)
    resetForm()
    setShowAddDialog(true)
  }

  const openEditDialog = (task: TodoTask, day: string) => {
    setEditingTask({ task, day })
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      estimatedTime: task.estimatedTime?.toString() || ''
    })
  }

  const closeDialogs = () => {
    setShowAddDialog(false)
    setEditingTask(null)
    resetForm()
  }

  // Drag and drop handlers
  const handleDragStart = (task: TodoTask, sourceDay: string) => {
    setDraggedTask({ task, sourceDay })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetDay: string) => {
    if (!draggedTask) return

    if (draggedTask.sourceDay === targetDay) {
      setDraggedTask(null)
      return
    }

    setTasks(prev => ({
      ...prev,
      [draggedTask.sourceDay]: prev[draggedTask.sourceDay].filter(
        task => task.id !== draggedTask.task.id
      ),
      [targetDay]: [...prev[targetDay], draggedTask.task]
    }))

    setDraggedTask(null)
  }

  const getTasksForDay = (day: string) => {
    return tasks[day] || []
  }

  const getTotalTasks = () => {
    return Object.values(tasks).reduce((total, dayTasks) => total + dayTasks.length, 0)
  }

  const getCompletedTasks = () => {
    return Object.values(tasks).reduce(
      (total, dayTasks) => total + dayTasks.filter(task => task.completed).length,
      0
    )
  }

  const selectedDayTasks = getTasksForDay(selectedDay)
  const isToday = (day: string) => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold gradient-text">Weekly Planning & Focus</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click on a day to manage tasks, drag to move between days
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {getCompletedTasks()}/{getTotalTasks()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tasks Completed
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-6">
        <div
          className="bg-slate-900 dark:bg-white h-2 rounded-full transition-all duration-300"
          style={{
            width: `${getTotalTasks() > 0 ? (getCompletedTasks() / getTotalTasks()) * 100 : 0}%`
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Overview - Left Side */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => {
              const dayTasks = getTasksForDay(day)
              const completedCount = dayTasks.filter(task => task.completed).length
              const isSelected = selectedDay === day
              const isTodayDay = isToday(day)

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(day)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md min-h-[120px] ${
                    isSelected 
                      ? 'border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800 ring-2 ring-slate-300 dark:ring-slate-600' 
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  } ${isTodayDay ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
                >
                  <div className="text-center mb-3">
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {day.slice(0, 3)}
                      {isTodayDay && <div className="text-xs text-blue-600 dark:text-blue-400">Today</div>}
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {dayTasks.length}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {completedCount} done
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                      <div
                        className="bg-slate-900 dark:bg-white h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${dayTasks.length > 0 ? (completedCount / dayTasks.length) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Mini task preview for non-selected days */}
                  {!isSelected && (
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded border text-center ${
                            task.completed 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                              : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {task.title.length > 12 ? `${task.title.slice(0, 12)}...` : task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-center text-slate-400 dark:text-slate-500">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Day Tasks Detail - Right Side */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                {selectedDay} Tasks
                {isToday(selectedDay) && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Today
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedDayTasks.filter(t => !t.completed).length} remaining
              </p>
            </div>
            <Button
              onClick={() => openAddDialog()}
              size="sm"
              className="h-8 w-8 p-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks for {selectedDay}</p>
                <p className="text-sm">Click the + button to add one</p>
              </div>
            ) : (
              selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, selectedDay)}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-move group ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => handleToggleComplete(selectedDay, task.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm ${
                        task.completed 
                          ? 'line-through text-slate-500 dark:text-slate-400' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </div>
                      
                      {task.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {task.description}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                          {priorityIcons[task.priority]} {task.priority}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${categoryColors[task.category]}`}>
                          {task.category}
                        </Badge>
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3" />
                            {task.estimatedTime}m
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditDialog(task, selectedDay)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        <Edit className="w-3 h-3 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(selectedDay, task.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                      <GripVertical className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Dialog */}
      <Dialog open={showAddDialog || editingTask !== null} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">
              {editingTask ? 'Edit Task' : `Add Task for ${selectedDay}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Task Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                           rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                           rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="learning">Learning</option>
                  <option value="health">Health</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Estimated Time (minutes)
              </label>
              <Input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                placeholder="e.g., 30"
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeDialogs}
                className="border-slate-300 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={editingTask ? handleEditTask : handleAddTask}
                className="modern-button"
                disabled={!formData.title.trim()}
              >
                {editingTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Overview: React.FC = () => {
  // State management
  const [leetCodeStreak, setLeetCodeStreak] = useState(7)
  const [problemsSolved, setProblemsSolved] = useState(142)
  const [pomodoroSessionsToday, setPomodoroSessionsToday] = useState(0)
  const [githubData, setGithubData] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Jobs Dashboard Component
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
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
    location: '',
    source: 'all'
  })

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

  const handleStartFocusSession = () => {
    window.location.href = '/productivity'
  }

  const handleRefreshTrigger = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002'

  const fetchJobs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '5') // Limit to 5 results per page
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
      if (filters.source && filters.source !== 'all') {
        queryParams.append('source', filters.source)
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
        setCurrentPage(jobsData.pagination?.currentPage || 1)
        setTotalJobs(jobsData.pagination?.totalJobs || 0)
        setHasNextPage(jobsData.pagination?.hasNext || false)
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
  }, [API_BASE, filters.days, filters.status, filters.company, filters.location, filters.source])

  const triggerScrape = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs/scrape`, { method: 'POST' })
      if (response.ok) {
        setCurrentPage(1) // Reset to first page after scraping
        await fetchJobs(1)
      }
    } catch (err: any) {
      console.error('Scrape failed:', err)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to page 1 when filters change
  }

  const loadNextPage = () => {
    if (hasNextPage) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchJobs(nextPage)
    }
  }

  // Optimized effect to prevent ResizeObserver errors
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(1) // Always fetch page 1 when filters change
    }, 300) // Reduced debounce but properly memoized function

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Display all fetched jobs (limited to 5 by API query)
  const filteredJobs = jobs

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Floating Background Particles */}
      <div className="particle-bg">
        <div className="particle" style={{ width: '4px', height: '4px' }}></div>
        <div className="particle" style={{ width: '6px', height: '6px' }}></div>
        <div className="particle" style={{ width: '3px', height: '3px' }}></div>
        <div className="particle" style={{ width: '5px', height: '5px' }}></div>
        <div className="particle" style={{ width: '4px', height: '4px' }}></div>
        <div className="particle" style={{ width: '7px', height: '7px' }}></div>
        <div className="particle" style={{ width: '3px', height: '3px' }}></div>
        <div className="particle" style={{ width: '5px', height: '5px' }}></div>
        <div className="particle" style={{ width: '4px', height: '4px' }}></div>
      </div>

      {/* Welcome Section */}
      <div className="glass-card p-8 stagger-1 float-gentle">
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
        <div className="lg:col-span-2 stagger-2 float-drift-left">
          <PomodoroTimer />
        </div>

        {/* Large Square Spotify Player */}
        <div className="lg:col-span-1 stagger-3 float-drift-right">
          <div className="mb-4">
            <h3 className="text-lg font-semibold gradient-text">Now Playing</h3>
          </div>
          <SpotifyPlayer />
        </div>
      </div>

      {/* GitHub Contribution Chart - Long Rectangle */}
      <Card className="glass-card stagger-4 float-subtle">
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
      <Card className="glass-card stagger-5 float-drift-left">
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
          <IntegratedWeeklyPlanner 
            refreshTrigger={refreshTrigger}
            onRefreshTrigger={handleRefreshTrigger}
          />
        </CardContent>
      </Card>

      {/* Jobs Dashboard */}
      <div className="stagger-6 float-drift-right">
        <JobsDashboard />
      </div>

      {/* Quick Actions */}
      <Card className="glass-card stagger-4 float-gentle">
          <CardHeader>
          <CardTitle className="gradient-text">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/leetcode">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600 hover:scale-105 transition-all duration-300">
                <Code className="w-6 h-6" />
                <span className="text-sm">LeetCode</span>
              </Button>
            </Link>
            <Link to="/productivity">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600 hover:scale-105 transition-all duration-300">
                <Target className="w-6 h-6" />
                <span className="text-sm">Productivity</span>
              </Button>
            </Link>
            <Link to="/integrations">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600 hover:scale-105 transition-all duration-300">
                <Zap className="w-6 h-6" />
                <span className="text-sm">Integrations</span>
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="w-full h-20 flex-col gap-2 border-slate-300 dark:border-slate-600 hover:scale-105 transition-all duration-300">
                <Briefcase className="w-6 h-6" />
                <span className="text-sm">Jobs</span>
              </Button>
            </Link>
            </div>
          </CardContent>
        </Card>


    </div>
  )
}

// Jobs Dashboard Component
const JobsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
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
    location: '',
    source: 'all'
  })

  const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002'

  const fetchJobs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      queryParams.append('page', page.toString())
      queryParams.append('limit', '5') // Limit to 5 results per page
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
      if (filters.source && filters.source !== 'all') {
        queryParams.append('source', filters.source)
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
        setCurrentPage(jobsData.pagination?.currentPage || 1)
        setTotalJobs(jobsData.pagination?.totalJobs || 0)
        setHasNextPage(jobsData.pagination?.hasNext || false)
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
  }, [API_BASE, filters.days, filters.status, filters.company, filters.location, filters.source])

  const triggerScrape = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/jobs/scrape`, { method: 'POST' })
      if (response.ok) {
        setCurrentPage(1) // Reset to first page after scraping
        await fetchJobs(1)
      }
    } catch (err: any) {
      console.error('Scrape failed:', err)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to page 1 when filters change
  }

  const loadNextPage = () => {
    if (hasNextPage) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchJobs(nextPage)
    }
  }

  // Optimized effect to prevent ResizeObserver errors
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(1) // Always fetch page 1 when filters change
    }, 300) // Reduced debounce but properly memoized function

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Display all fetched jobs (limited to 5 by API query)
  const filteredJobs = jobs

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />
      case 'interested': return <RefreshCw className="h-4 w-4" />
      case 'applied': return <CheckCircle className="h-4 w-4" />
      case 'interview': return <RefreshCw className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      case 'offer': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'interested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'applied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'interview': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'offer': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getSourceBadge = (source: string) => {
    switch(source) {
      case 'summer2026-internships': return 'Summer 2026'
      case '2025-swe-college-jobs': return '2025 SWE'
      case '2026-ai-college-jobs': return '2026 AI'
      case '2025-data-analysis-internship': return '2025 Data'
      case '2025-product-management-internship': return '2025 PM'
      default: return source
    }
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="gradient-text">Jobs Dashboard</CardTitle>
          <CardDescription>
            Recent job opportunities ({totalJobs} total)
          </CardDescription>
        </div>
        <Button onClick={triggerScrape} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card bg-slate-50 dark:bg-slate-800 stagger-1">
            <div className="metric-value text-slate-900 dark:text-white">{jobStats.totalJobs}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Jobs</p>
          </div>
          <div className="stat-card bg-blue-50 dark:bg-blue-950/30 stagger-2">
            <div className="metric-value text-blue-600">{jobStats.newJobs}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">New Today</p>
          </div>
          <div className="stat-card bg-green-50 dark:bg-green-950/30 stagger-3">
            <div className="metric-value text-green-600">{jobStats.appliedJobs}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Applied</p>
          </div>
          <div className="stat-card bg-amber-50 dark:bg-amber-950/30 stagger-4">
            <div className="metric-value text-amber-600">{jobStats.remainingJobs}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Remaining</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Select value={filters.days} onValueChange={(value) => handleFilterChange({ ...filters, days: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1 day</SelectItem>
              <SelectItem value="3">Last 3 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange({ ...filters, status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.source} onValueChange={(value) => handleFilterChange({ ...filters, source: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="summer2026-internships">Summer 2026 Internships</SelectItem>
              <SelectItem value="2025-swe-college-jobs">2025 SWE College Jobs</SelectItem>
              <SelectItem value="2026-ai-college-jobs">2026 AI College Jobs</SelectItem>
              <SelectItem value="2025-data-analysis-internship">2025 Data Analysis Internship</SelectItem>
              <SelectItem value="2025-product-management-internship">2025 Product Management Internship</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Company..."
            value={filters.company}
            onChange={(e) => handleFilterChange({ ...filters, company: e.target.value })}
          />

          <Input
            placeholder="Location..."
            value={filters.location}
            onChange={(e) => handleFilterChange({ ...filters, location: e.target.value })}
          />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-500" />
            <span className="ml-2 text-slate-500">Loading jobs...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No jobs found matching your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id || job.id} className="job-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{job.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getSourceBadge(job.source)}
                      </Badge>
                      {job.status && (
                        <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </div>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
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
                        {job.ageText || 'Recently posted'}
                      </div>
                    </div>
                    {job.salary && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {job.salary}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {job.applicationUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(job.applicationUrl, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalJobs > 5 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing page {currentPage} ({jobs.length} of {totalJobs} jobs)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchJobs(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadNextPage}
                disabled={!hasNextPage || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 