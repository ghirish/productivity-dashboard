import React, { useState, useEffect } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from './ui/sidebar'
import { 
  BarChart3, 
  BookOpen, 
  BriefcaseIcon, 
  Home, 
  Moon, 
  Sun, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Target,
  Globe
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

// Enhanced Dark mode toggle with smooth transitions
function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first, fallback to system preference
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        return savedTheme === 'dark'
      }
      // Check system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Apply theme on initial load and when dark state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }, [dark])
  
  const toggle = () => {
    setDark(prev => !prev)
  }

  return (
    <button
      aria-label="Toggle dark mode"
      className="relative p-2 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 
                 dark:from-slate-800 dark:to-slate-700 hover:scale-105 
                 transition-all duration-300 ease-out group overflow-hidden"
      onClick={toggle}
    >
      <div className="relative z-10">
        {dark ? (
          <Sun className="w-4 h-4 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  )
}

// Modern Avatar Component
function UserAvatar() {
  return (
    <div className="relative group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 
                      p-0.5 group-hover:scale-105 transition-transform duration-300">
        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 
                      border-white dark:border-slate-900 animate-pulse" />
    </div>
  )
}

// Navigation Item Component
interface NavItemProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  collapsed: boolean
  isActive: boolean
}

function NavItem({ to, icon: Icon, label, collapsed, isActive }: NavItemProps) {
  return (
    <Link to={to} className="block">
      <div className={`modern-nav-item ${isActive ? 'active' : ''}`}>
        <Icon className="w-5 h-5 animated-icon" />
        <span className={`transition-all duration-300 ${
          collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
        }`}>
          {label}
        </span>
        {isActive && !collapsed && (
          <div className="ml-auto">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        )}
      </div>
    </Link>
  )
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const location = useLocation()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const sidebarWidth = collapsed ? 80 : 280
  
  const navItems = [
    { to: '/', icon: Home, label: 'Overview' },
    { to: '/leetcode', icon: BookOpen, label: 'LeetCode' },
    { to: '/productivity', icon: Target, label: 'Productivity' },
    { to: '/integrations', icon: Globe, label: 'Integrations' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/jobs', icon: BriefcaseIcon, label: 'Jobs' },
  ]

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full modern-background relative overflow-hidden">
        {/* Floating background pattern */}
        <div className="fixed inset-0 floating-pattern pointer-events-none" />
        
        <div className="relative min-h-screen">
          {/* Enhanced sidebar with glassmorphism */}
          <Sidebar 
            className={`fixed top-0 left-0 h-full z-30 sidebar-glass transition-all duration-500 ease-out ${
              collapsed ? 'w-20' : 'w-70'
            }`}
            style={{ width: sidebarWidth }}
          > 
            <SidebarHeader className="flex items-center gap-3 px-6 py-6 border-b border-white/10 dark:border-slate-700/30">
              <UserAvatar />
              <div className={`transition-all duration-300 overflow-hidden ${
                collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
              }`}>
                <h1 className="text-xl font-bold gradient-text leading-none">
                  Productivity Hub
                </h1>
                <p className="text-sm subtitle-text">CS Dashboard</p>
              </div>
              <div className="ml-auto">
              <DarkModeToggle />
              </div>
            </SidebarHeader>
            
            <SidebarContent className="px-4 py-6">
              <SidebarMenu className="space-y-2">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <NavItem
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      collapsed={collapsed}
                      isActive={location.pathname === item.to}
                    />
                </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            
            {/* Enhanced collapse button */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button
                aria-label="Toggle sidebar"
                className="p-3 rounded-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm
                           hover:bg-white/30 dark:hover:bg-slate-700/30 
                           border border-white/20 dark:border-slate-600/20
                           transition-all duration-300 hover:scale-110 group"
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                ) : (
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                )}
              </button>
            </div>
          </Sidebar>
          
          {/* Enhanced main content area */}
          <main 
            className="flex-1 p-8 transition-all duration-500 ease-out animate-fade-in"
            style={{ marginLeft: sidebarWidth }}
          >
            <div className="max-w-7xl mx-auto space-y-8"> 
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
} 