import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { PomodoroTimer } from './PomodoroTimer'
import { WeeklyTodos } from './WeeklyTodos'
import { Clock, Calendar, Target, CheckSquare } from 'lucide-react'

export const ProductivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pomodoro')

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 
                          flex items-center justify-center">
            <Target className="w-8 h-8 text-slate-600 dark:text-slate-300" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Productivity Hub</h1>
          <p className="text-lg subtitle-text">
            Focus your time and organize your tasks for maximum productivity
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pomodoro Timer
            </TabsTrigger>
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Todos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pomodoro" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold gradient-text mb-2">
                Focus Timer
              </h2>
              <p className="subtitle-text">
                Use the Pomodoro Technique to boost your productivity with focused work sessions
              </p>
            </div>
            <PomodoroTimer />
          </TabsContent>

          <TabsContent value="todos" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold gradient-text mb-2">
                Weekly Planning
              </h2>
              <p className="subtitle-text">
                Organize your tasks across the week with drag-and-drop planning
              </p>
            </div>
            <WeeklyTodos />
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 text-center">
          <Clock className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Focus Sessions
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
          <p className="text-sm subtitle-text">Today</p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <CheckSquare className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Tasks Completed
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
          <p className="text-sm subtitle-text">This Week</p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <Target className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Productivity Score
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">--</p>
          <p className="text-sm subtitle-text">Weekly Average</p>
        </div>
        
        <div className="glass-card p-6 text-center">
          <Calendar className="w-8 h-8 text-slate-600 dark:text-slate-300 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Streak
          </h3>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
          <p className="text-sm subtitle-text">Days</p>
        </div>
      </div>
    </div>
  )
} 