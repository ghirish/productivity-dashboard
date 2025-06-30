import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Music,
  ExternalLink,
  Volume2
} from 'lucide-react'
import { Link } from 'react-router-dom'

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
  device: { name: string } | null
}

export const SpotifyMiniPlayer: React.FC = () => {
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
      const interval = setInterval(fetchCurrentTrack, 15000) // Every 15 seconds
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchCurrentTrack])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="text-center">
            <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Connect Spotify to see what you're listening to
            </p>
            <Link to="/integrations">
              <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-600">
                <Music className="w-4 h-4 mr-2" />
                Connect Spotify
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentTrack?.track) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="text-center">
            <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
              No music playing
            </p>
            <Link to="/integrations">
              <Button size="sm" variant="ghost">
                Open Spotify Player
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const track = currentTrack.track
  const progress = (track.progress / track.duration) * 100

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Track Info */}
          <div className="flex items-center gap-3">
            {track.image && (
              <img
                src={track.image}
                alt={track.album}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-900 dark:text-white truncate">
                {track.name}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
                {track.artists.join(', ')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={currentTrack.isPlaying ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>
                  {currentTrack.isPlaying ? 'Playing' : 'Paused'}
                </Badge>
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{formatTime(track.progress)}</span>
              <span>{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleSkip('previous')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                onClick={handlePlayPause}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                {currentTrack.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => handleSkip('next')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {currentTrack.device && (
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Volume2 className="w-3 h-3" />
                  {currentTrack.device.name}
                </div>
              )}
              <Link to="/integrations">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Player
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 