import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Area, 
  AreaChart,
  ResponsiveContainer 
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import { AnalyticsData } from '../types/leetcode'

interface LeetCodeAnalyticsProps {
  analytics: AnalyticsData
  isLoading?: boolean
}

const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#f59e0b', 
  Hard: '#ef4444'
}

const CUSTOM_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
]

export function LeetCodeAnalytics({ analytics, isLoading = false }: LeetCodeAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatMonth = (monthData: any) => {
    const date = new Date(monthData._id.year, monthData._id.month - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Prepare data for charts
  const difficultyData = analytics.difficultyStats.map(stat => ({
    difficulty: stat._id,
    count: stat.count,
    avgTime: Math.round(stat.avgTime)
  }))

  const topicData = analytics.topicStats.map(stat => ({
    topic: stat._id,
    count: stat.count,
    avgTime: Math.round(stat.avgTime)
  }))

  const monthlyData = analytics.monthlyProgress
    .sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year
      return a._id.month - b._id.month
    })
    .map(month => ({
      month: formatMonth(month),
      problems: month.count,
      totalTime: month.totalTime,
      avgSuccessRate: Math.round(month.avgSuccessRate)
    }))

  const recentActivityData = analytics.recentActivity.map(day => ({
    date: new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    problems: day.count,
    time: day.totalTime
  }))

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProblems}</div>
            <p className="text-xs text-muted-foreground">
              Problems solved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(analytics.overallStats.totalTime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Time invested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time/Problem</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(Math.round(analytics.overallStats.avgTime || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Average solving time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.overallStats.avgSuccessRate || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Difficulty Distribution
            </CardTitle>
            <CardDescription>
              Problems solved by difficulty level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ difficulty, count, percent }) => 
                    `${difficulty}: ${((percent || 0) * 100).toFixed(1)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={DIFFICULTY_COLORS[entry.difficulty as keyof typeof DIFFICULTY_COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Topics
            </CardTitle>
            <CardDescription>
              Most practiced problem topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="topic" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monthly Progress
            </CardTitle>
            <CardDescription>
              Problems solved over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="problems" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity (7 days)
            </CardTitle>
            <CardDescription>
              Daily problem solving activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="problems" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Time Analysis by Difficulty</CardTitle>
          <CardDescription>
            Average time spent solving problems by difficulty level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} minutes`, 'Avg Time']}
              />
              <Bar dataKey="avgTime" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Topic Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Summary</CardTitle>
          <CardDescription>
            Quick overview of your topic expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.topicStats.slice(0, 6).map((topic, index) => (
              <div key={topic._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{topic._id}</h4>
                  <p className="text-sm text-gray-600">{topic.count} problems</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {formatTime(Math.round(topic.avgTime))}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">avg time</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 