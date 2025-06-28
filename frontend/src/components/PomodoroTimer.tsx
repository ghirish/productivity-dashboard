import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Clock,
  Coffee,
  Brain,
  History,
  Bell
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

type SessionType = 'work' | 'shortBreak' | 'longBreak'

interface PomodoroSession {
  id: string
  type: SessionType
  duration: number
  completed: boolean
  startTime: Date
  endTime?: Date
}

interface PomodoroSettings {
  workDuration: number // in minutes
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number // after how many work sessions
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
}

export const PomodoroTimer: React.FC = () => {
  // Settings
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true
  })

  // Timer state
  const [currentSession, setCurrentSession] = useState<SessionType>('work')
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60) // in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0)

  // Session history
  const [sessionHistory, setSessionHistory] = useState<PomodoroSession[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Refs for interval and audio
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Session type configurations
  const sessionConfigs = {
    work: {
      label: 'Focus Time',
      icon: Brain,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      duration: settings.workDuration
    },
    shortBreak: {
      label: 'Short Break',
      icon: Coffee,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      duration: settings.shortBreakDuration
    },
    longBreak: {
      label: 'Long Break',
      icon: Coffee,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      duration: settings.longBreakDuration
    }
  }

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiR1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBg==')
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
      handleSessionComplete()
    }
  }, [timeLeft, isRunning])

  // Update timer when session type changes
  useEffect(() => {
    const config = sessionConfigs[currentSession]
    setTimeLeft(config.duration * 60)
  }, [currentSession, settings])

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false)

    // Play notification sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const config = sessionConfigs[currentSession]
      new Notification('Pomodoro Timer', {
        body: `${config.label} completed! ${currentSession === 'work' ? 'Time for a break!' : 'Ready to focus?'}`,
        icon: '/favicon.ico'
      })
    }

    // Record completed session
    const completedSession: PomodoroSession = {
      id: `session-${Date.now()}`,
      type: currentSession,
      duration: sessionConfigs[currentSession].duration,
      completed: true,
      startTime: new Date(Date.now() - sessionConfigs[currentSession].duration * 60 * 1000),
      endTime: new Date()
    }

    setSessionHistory(prev => [completedSession, ...prev].slice(0, 50)) // Keep last 50 sessions
    setCompletedSessions(prev => prev + 1)

    if (currentSession === 'work') {
      setWorkSessionsCompleted(prev => prev + 1)
      
      // Auto-transition to break
      const shouldLongBreak = (workSessionsCompleted + 1) % settings.longBreakInterval === 0
      const nextSession = shouldLongBreak ? 'longBreak' : 'shortBreak'
      setCurrentSession(nextSession)
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000)
      }
    } else {
      // Auto-transition to work
      setCurrentSession('work')
      
      if (settings.autoStartWork) {
        setTimeout(() => setIsRunning(true), 1000)
      }
    }
  }, [currentSession, settings, workSessionsCompleted])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsRunning(true)
    requestNotificationPermission()
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    const config = sessionConfigs[currentSession]
    setTimeLeft(config.duration * 60)
  }

  const switchSession = (type: SessionType) => {
    setIsRunning(false)
    setCurrentSession(type)
  }

  const config = sessionConfigs[currentSession]
  const Icon = config.icon
  const progress = ((config.duration * 60 - timeLeft) / (config.duration * 60)) * 100

  return (
    <div className="space-y-6">
      {/* Main Timer Card */}
      <Card className={`glass-card ${config.bgColor} border-2`}>
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon className={`w-6 h-6 ${config.color}`} />
            <CardTitle className={`text-2xl font-bold ${config.color}`}>
              {config.label}
            </CardTitle>
          </div>
          <div className="flex justify-center gap-2">
            {Object.entries(sessionConfigs).map(([type, conf]) => (
              <button
                key={type}
                onClick={() => switchSession(type as SessionType)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  currentSession === type
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {conf.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          {/* Circular Progress */}
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className={config.color}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900 dark:text-white mb-1">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {isRunning ? 'Running' : 'Paused'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="modern-button"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="outline"
                size="lg"
                className="border-slate-300 dark:border-slate-600"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="border-slate-300 dark:border-slate-600"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedSessions}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Sessions Today
              </div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {workSessionsCompleted}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Focus Sessions
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setShowHistory(true)}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              size="sm"
              className="border-slate-300 dark:border-slate-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

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
              sessionHistory.map((session) => {
                const sessionConfig = sessionConfigs[session.type]
                const SessionIcon = sessionConfig.icon
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <SessionIcon className={`w-5 h-5 ${sessionConfig.color}`} />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {sessionConfig.label}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {session.duration} minutes
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {session.startTime.toLocaleTimeString([], { 
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

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Timer Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Duration Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                Session Durations (minutes)
              </h3>
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    Focus Time
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workDuration: parseInt(e.target.value) || 25
                    }))}
                    className="w-16 px-2 py-1 text-center border border-slate-300 dark:border-slate-600 
                             rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    Short Break
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      shortBreakDuration: parseInt(e.target.value) || 5
                    }))}
                    className="w-16 px-2 py-1 text-center border border-slate-300 dark:border-slate-600 
                             rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    Long Break
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      longBreakDuration: parseInt(e.target.value) || 15
                    }))}
                    className="w-16 px-2 py-1 text-center border border-slate-300 dark:border-slate-600 
                             rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Auto-start Settings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                Auto-start
              </h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    autoStartBreaks: e.target.checked
                  }))}
                  className="w-4 h-4 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 rounded"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Auto-start breaks
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoStartWork}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    autoStartWork: e.target.checked
                  }))}
                  className="w-4 h-4 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 rounded"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Auto-start work sessions
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    soundEnabled: e.target.checked
                  }))}
                  className="w-4 h-4 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 rounded"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Sound notifications
                </span>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 