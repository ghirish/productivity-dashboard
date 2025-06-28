import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  CheckCircle, 
  Flame, 
  Briefcase, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  Zap,
  Award,
  GitBranch,
  Plus
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  trend?: string
  trendDirection?: 'up' | 'down'
  progress?: number
  delay?: number
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendDirection = 'up',
  progress = 0,
  delay = 0
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Animate the number if it's numeric
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value.split(' ')[0])))) {
        const targetValue = typeof value === 'number' ? value : Number(value.split(' ')[0])
        let start = 0
        const duration = 2000
        const increment = targetValue / (duration / 16)
        
        const animate = () => {
          start += increment
          if (start < targetValue) {
            setAnimatedValue(Math.floor(start))
            requestAnimationFrame(animate)
          } else {
            setAnimatedValue(targetValue)
          }
        }
        animate()
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  const displayValue = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value.split(' ')[0])))
    ? (typeof value === 'number' ? animatedValue : `${animatedValue}${value.substring(String(Number(value.split(' ')[0])).length)}`)
    : value

  return (
    <div className={`stat-card glow-effect transform transition-all duration-700 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
    }`}>
      {/* Progress bar at top */}
      {progress > 0 && (
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500 rounded-t-2xl"
             style={{ width: `${progress}%`, transition: 'width 2s ease-out' }} />
      )}
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </CardTitle>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${
              trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <TrendingUp className={`w-3 h-3 ${trendDirection === 'down' ? 'rotate-180' : ''}`} />
              {trend}
            </div>
          )}
        </div>
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 
                        group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="metric-value gradient-text">
            {displayValue}
          </div>
          <p className="text-xs subtitle-text">
            {subtitle}
          </p>
        </div>
      </CardContent>
    </div>
  )
}

interface TaskItemProps {
  task: string
  completed?: boolean
  priority?: 'high' | 'medium' | 'low'
  onToggle?: () => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, completed = false, priority = 'medium', onToggle }) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    medium: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    low: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
  }

  return (
    <div className={`task-item ${priorityColors[priority]} border rounded-lg`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <input
            type="checkbox"
            checked={completed}
            onChange={onToggle}
            className="w-5 h-5 rounded-md border-2 border-primary text-primary 
                       focus:ring-primary/20 focus:ring-2 transition-all duration-200
                       checked:bg-primary checked:border-primary"
          />
          {completed && (
            <CheckCircle className="absolute inset-0 w-5 h-5 text-white pointer-events-none" />
          )}
        </div>
        <span className={`flex-1 transition-all duration-200 ${
          completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'
        }`}>
          {task}
        </span>
        <div className={`w-2 h-2 rounded-full ${
          priority === 'high' ? 'bg-red-500' : 
          priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />
      </div>
    </div>
  )
}

// Circular Progress Component
interface CircularProgressProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  label: string
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  value, 
  max, 
  size = 120, 
  strokeWidth = 8,
  label 
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / max) * circumference
  const percentage = Math.round((value / max) * 100)

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <svg width={size} height={size} className="progress-ring">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="progress-ring-circle"
            style={{ 
              transition: 'stroke-dashoffset 2s ease-in-out',
              filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold gradient-text">{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">of {max}</div>
          </div>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  )
}

export const Overview: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Complete 3 LeetCode problems', completed: false, priority: 'high' as const },
    { id: 2, task: 'Apply to 2 new job postings', completed: false, priority: 'medium' as const },
    { id: 3, task: 'Review GitHub repositories', completed: true, priority: 'low' as const },
    { id: 4, task: 'Update portfolio website', completed: false, priority: 'medium' as const },
  ])

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const completedTasks = tasks.filter(task => task.completed).length

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden glass-card p-8 animate-fade-in">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-lg subtitle-text">
                Here's what's happening with your productivity today.
              </p>
            </div>
            <div className="hidden md:block animate-float">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 
                              flex items-center justify-center">
                <Zap className="w-10 h-10 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent 
                        rounded-full -translate-y-32 translate-x-32" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="LeetCode Progress"
          value="45"
          subtitle="Problems solved this month"
          icon={<CheckCircle className="w-6 h-6 text-primary" />}
          trend="+12% from last month"
          progress={45}
          delay={0}
        />
        <StatCard
          title="GitHub Streak"
          value="12 days"
          subtitle="Current contribution streak"
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          trend="+3 days this week"
          progress={60}
          delay={200}
        />
        <StatCard
          title="Job Applications"
          value="8"
          subtitle="Applications sent this week"
          icon={<Briefcase className="w-6 h-6 text-blue-500" />}
          trend="+2 from last week"
          progress={80}
          delay={400}
        />
        <StatCard
          title="Focus Time"
          value="6.5 hrs"
          subtitle="Deep work today"
          icon={<Clock className="w-6 h-6 text-green-500" />}
          trend="+1.2 hrs from yesterday"
          progress={85}
          delay={600}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 animate-slide-up">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold gradient-text">Today's Tasks</CardTitle>
                  <p className="subtitle-text mt-1">Stay focused and productive</p>
                </div>
                <button className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 
                                 transition-colors duration-200">
                  <Plus className="w-5 h-5 text-primary" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task.task}
                  completed={task.completed}
                  priority={task.priority}
                  onToggle={() => toggleTask(task.id)}
                />
              ))}
            </CardContent>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-6">
          {/* Daily Progress */}
          <div className="glass-card p-6 animate-scale-in text-center">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-bold gradient-text">Daily Progress</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <CircularProgress
                value={completedTasks}
                max={tasks.length}
                label="Tasks Completed"
              />
            </CardContent>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-bold gradient-text">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              <button className="w-full modern-button">
                <Target className="w-4 h-4 mr-2" />
                Start Pomodoro
              </button>
              <button className="w-full px-4 py-2 rounded-lg border border-primary/20 
                               text-primary hover:bg-primary/5 transition-colors duration-200">
                <GitBranch className="w-4 h-4 mr-2" />
                View Analytics
              </button>
            </CardContent>
          </div>

          {/* Achievement Badge */}
          <div className="glass-card p-6 animate-scale-in" style={{ animationDelay: '400ms' }}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br 
                              from-yellow-400 to-orange-500 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold gradient-text mb-1">Streak Master!</h3>
              <p className="text-sm subtitle-text">12-day coding streak achieved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 