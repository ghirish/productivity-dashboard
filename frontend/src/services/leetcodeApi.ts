import axios from 'axios'
import { LeetCodeProblem, LeetCodeFormData, LeetCodeFilters, LeetCodeResponse, AnalyticsData } from '../types/leetcode'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/leetcode`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const leetcodeApi = {
  // Get all problems with optional filtering
  getProblems: async (filters: LeetCodeFilters = {}): Promise<LeetCodeResponse> => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          params.append(key, value.toString())
        }
      }
    })

    const response = await api.get(`/?${params.toString()}`)
    return response.data
  },

  // Get a specific problem by ID
  getProblem: async (id: string): Promise<LeetCodeProblem> => {
    const response = await api.get(`/${id}`)
    return response.data
  },

  // Create a new problem
  createProblem: async (data: LeetCodeFormData): Promise<LeetCodeProblem> => {
    const response = await api.post('/', data)
    return response.data
  },

  // Update an existing problem
  updateProblem: async (id: string, data: Partial<LeetCodeFormData>): Promise<LeetCodeProblem> => {
    const response = await api.put(`/${id}`, data)
    return response.data
  },

  // Delete a problem
  deleteProblem: async (id: string): Promise<void> => {
    await api.delete(`/${id}`)
  },

  // Get analytics data
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics')
    return response.data
  },

  // Get all unique topics
  getTopics: async (): Promise<string[]> => {
    const response = await api.get('/topics/list')
    return response.data
  },
}

// Common topic suggestions for form
export const COMMON_TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Two Pointers',
  'Binary Search',
  'Sliding Window',
  'Tree',
  'Binary Tree',
  'Linked List',
  'Stack',
  'Queue',
  'Heap',
  'Graph',
  'DFS',
  'BFS',
  'Greedy',
  'Backtracking',
  'Trie',
  'Union Find',
  'Sorting',
  'Math',
  'Bit Manipulation',
  'Design',
  'Recursion'
]

export default leetcodeApi 