export interface LeetCodeProblem {
  _id: string;
  problemName: string;
  problemNumber: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent: number;
  topic: string[];
  dateCompleted: string;
  attempts: number;
  successRate: number;
  notes?: string;
  url?: string;
  personalRating?: number;
  needsReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeetCodeFormData {
  problemName: string;
  problemNumber: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeSpent: number;
  topic: string[];
  dateCompleted: string;
  attempts: number;
  successRate: number;
  notes?: string;
  url?: string;
  personalRating?: number;
  needsReview: boolean;
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
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  averageTime: number;
  successRate: number;
  monthlyProgress?: {
    month: string;
    problems: number;
  }[];
} 