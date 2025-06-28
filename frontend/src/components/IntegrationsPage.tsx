import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { GitHubSection } from './GitHubSection'
import { SpotifyPlayer } from './SpotifyPlayer'
import { Github, Music, Zap, Globe } from 'lucide-react'

export const IntegrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('github')

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 
                          flex items-center justify-center">
            <Globe className="w-8 h-8 text-slate-600 dark:text-slate-300" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">External Integrations</h1>
          <p className="text-lg subtitle-text">
            Connect your favorite services to enhance your productivity dashboard
          </p>
        </div>
      </div>

      {/* Integration Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
          activeTab === 'github' ? 'ring-2 ring-slate-300 dark:ring-slate-600' : ''
        }`} onClick={() => setActiveTab('github')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
              <Github className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">GitHub</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Track contributions, repositories, and coding activity
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">★</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Contributions</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">🔥</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Streak</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">📊</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Analytics</div>
            </div>
          </div>
        </div>

        <div className={`glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
          activeTab === 'spotify' ? 'ring-2 ring-green-300 dark:ring-green-600' : ''
        }`} onClick={() => setActiveTab('spotify')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Spotify</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Control music playback and see what you're listening to
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">🎵</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Now Playing</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">🎛️</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Controls</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">📱</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Playlists</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-card p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="github" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Integration
            </TabsTrigger>
            <TabsTrigger value="spotify" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Spotify Player
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold gradient-text mb-2">
                GitHub Dashboard
              </h2>
              <p className="subtitle-text">
                Monitor your development activity, contributions, and repository statistics
              </p>
            </div>
            <GitHubSection />
          </TabsContent>

          <TabsContent value="spotify" className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold gradient-text mb-2">
                Spotify Music Player
              </h2>
              <p className="subtitle-text">
                Control your music and stay in the flow while working
              </p>
            </div>
            <SpotifyPlayer />
          </TabsContent>
        </Tabs>
      </div>

      {/* Features Overview */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold gradient-text mb-4">Integration Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Features
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Real-time contribution graph
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Commit streak tracking
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Repository statistics and activity
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Programming language analytics
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Recent activity feed
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Spotify Features
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Currently playing track display
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Playback controls (play, pause, skip)
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Volume control
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Recently played tracks
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                Playlist access and management
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 