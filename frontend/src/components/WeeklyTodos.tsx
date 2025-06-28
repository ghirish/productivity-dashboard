import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { 
  Plus, 
  Calendar,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  GripVertical,
  Flag,
  Clock,
  X
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

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

export const WeeklyTodos: React.FC = () => {
  const [tasks, setTasks] = useState<DayTasks>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  })

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<{ task: TodoTask; day: string } | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>('Monday')
  const [draggedTask, setDraggedTask] = useState<{ task: TodoTask; sourceDay: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    category: 'work' as TaskCategory,
    estimatedTime: ''
  })

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('weeklyTodos')
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks)
        // Convert date strings back to Date objects
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
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('weeklyTodos', JSON.stringify(tasks))
  }, [tasks])

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

  const openAddDialog = (day: string) => {
    setSelectedDay(day)
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

    // Remove task from source day
    setTasks(prev => ({
      ...prev,
      [draggedTask.sourceDay]: prev[draggedTask.sourceDay].filter(
        task => task.id !== draggedTask.task.id
      ),
      [targetDay]: [...prev[targetDay], draggedTask.task]
    }))

    setDraggedTask(null)
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

  const getTasksForDay = (day: string) => {
    return tasks[day] || []
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Weekly Todo Planner</h1>
            <p className="subtitle-text mt-1">
              Organize your tasks by day and stay productive
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {getCompletedTasks()}/{getTotalTasks()}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Tasks Completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-slate-900 dark:bg-white h-2 rounded-full transition-all duration-300"
            style={{
              width: `${getTotalTasks() > 0 ? (getCompletedTasks() / getTotalTasks()) * 100 : 0}%`
            }}
          />
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const dayTasks = getTasksForDay(day)
          const completedCount = dayTasks.filter(task => task.completed).length
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day

          return (
            <div
              key={day}
              className={`glass-card p-4 min-h-[400px] ${
                isToday ? 'ring-2 ring-slate-300 dark:ring-slate-600' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(day)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {day}
                    {isToday && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Today
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {completedCount}/{dayTasks.length} done
                  </p>
                </div>
                <Button
                  onClick={() => openAddDialog(day)}
                  size="sm"
                  className="h-8 w-8 p-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Progress Bar for Day */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mb-4">
                <div
                  className="bg-slate-900 dark:bg-white h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${dayTasks.length > 0 ? (completedCount / dayTasks.length) * 100 : 0}%`
                  }}
                />
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, day)}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-move group ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleToggleComplete(day, task.id)}
                        className="mt-1 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
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
                          onClick={() => openEditDialog(task, day)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                          <Edit className="w-3 h-3 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(day, task.id)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                        <GripVertical className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}

                {dayTasks.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      No tasks planned
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
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