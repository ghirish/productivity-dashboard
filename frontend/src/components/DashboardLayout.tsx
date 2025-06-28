import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from './ui/sidebar'
import { 
  Code2, 
  CheckSquare, 
  Timer, 
  Github, 
  Music, 
  Briefcase,
  BarChart3,
  Home
} from 'lucide-react'
import { LeetCodeSection } from './LeetCodeSection'

export function DashboardLayout() {
  const [activeSection, setActiveSection] = useState('overview')

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'leetcode', label: 'LeetCode', icon: Code2 },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    { id: 'todos', label: 'Todo Lists', icon: CheckSquare },
    { id: 'github', label: 'GitHub', icon: Github },
    { id: 'jobs', label: 'Job Search', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'spotify', label: 'Music', icon: Music },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />
      case 'leetcode':
        return <LeetCodeSection />
      case 'pomodoro':
        return <PomodoroSection />
      case 'todos':
        return <TodoSection />
      case 'github':
        return <GitHubSection />
      case 'jobs':
        return <JobsSection />
      case 'analytics':
        return <AnalyticsSection />
      case 'spotify':
        return <SpotifySection />
      default:
        return <OverviewSection />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-64">
          <SidebarContent>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">CS Productivity Hub</h2>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">Settings</Button>
              <Avatar>
                <AvatarImage src="/avatar.jpg" />
                <AvatarFallback>CS</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto bg-gray-50">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

// Placeholder sections for each dashboard area
function OverviewSection() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>LeetCode Progress</CardTitle>
          <CardDescription>Recent problem solving activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">45 / 100</p>
          <p className="text-sm text-muted-foreground">Problems completed this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub Activity</CardTitle>
          <CardDescription>Contribution streak</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">12 days</p>
          <p className="text-sm text-muted-foreground">Current streak</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Applications</CardTitle>
          <CardDescription>This week's applications</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">8</p>
          <p className="text-sm text-muted-foreground">Applications sent</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>Focus on what matters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>Complete 3 LeetCode problems</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>Apply to 2 new job postings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>Review GitHub repositories</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pomodoro Sessions</CardTitle>
          <CardDescription>Today's focus time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">6</p>
          <p className="text-sm text-muted-foreground">Sessions completed</p>
        </CardContent>
      </Card>
    </div>
  )
}



function PomodoroSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Timer</CardTitle>
        <CardDescription>Focus sessions with break reminders</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Pomodoro timer will go here...</p>
      </CardContent>
    </Card>
  )
}

function TodoSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Todo Lists</CardTitle>
        <CardDescription>Organize tasks by day of the week</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Todo lists will go here...</p>
      </CardContent>
    </Card>
  )
}

function GitHubSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Integration</CardTitle>
        <CardDescription>Contribution charts and repository activity</CardDescription>
      </CardHeader>
      <CardContent>
        <p>GitHub integration will go here...</p>
      </CardContent>
    </Card>
  )
}

function JobsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Search</CardTitle>
        <CardDescription>Track new postings and applications</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Job search interface will go here...</p>
      </CardContent>
    </Card>
  )
}

function AnalyticsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>Progress tracking and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Analytics charts will go here...</p>
      </CardContent>
    </Card>
  )
}

function SpotifySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spotify Integration</CardTitle>
        <CardDescription>Control your music while working</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Spotify player will go here...</p>
      </CardContent>
    </Card>
  )
} 