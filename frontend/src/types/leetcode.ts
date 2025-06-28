export interface LeetCodeProblem {
  _id: string
  problemName: string
  problemNumber: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string[]
  timeSpent: number
  dateCompleted: string
  attempts: number
  successRate: number
  notes?: string
  url?: string
  personalRating?: number
  needsReview: boolean
  createdAt: string
  updatedAt: string
  timePerAttempt?: number
}

export interface LeetCodeFormData {
  problemName: string
  problemNumber: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string[]
  timeSpent: number
  dateCompleted: string
  attempts: number
  successRate: number
  notes?: string
  url?: string
  personalRating?: number
  needsReview: boolean
}

export interface LeetCodeFilters {
  difficulty?: string
  topic?: string[]
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationInfo {
  current: number
  total: number
  count: number
  totalProblems: number
}

export interface LeetCodeResponse {
  problems: LeetCodeProblem[]
  pagination: PaginationInfo
}

export interface AnalyticsData {
  totalProblems: number
  difficultyStats: {
    _id: string
    count: number
    avgTime: number
  }[]
  topicStats: {
    _id: string
    count: number
    avgTime: number
  }[]
  monthlyProgress: {
    _id: { year: number; month: number }
    count: number
    totalTime: number
    avgSuccessRate: number
  }[]
  recentActivity: {
    _id: string
    count: number
    totalTime: number
  }[]
  overallStats: {
    totalTime: number
    avgTime: number
    avgSuccessRate: number
    totalAttempts: number
  }
} 