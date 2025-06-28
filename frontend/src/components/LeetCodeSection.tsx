import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { 
  Plus, 
  Table as TableIcon, 
  BarChart3, 
  Trash2,
  AlertCircle
} from 'lucide-react'
import { LeetCodeForm } from './LeetCodeForm'
import { LeetCodeTable } from './LeetCodeTable'
import { LeetCodeAnalytics } from './LeetCodeAnalytics'
import { leetcodeApi } from '../services/leetcodeApi'
import { 
  LeetCodeProblem, 
  LeetCodeFormData, 
  LeetCodeFilters, 
  AnalyticsData, 
  LeetCodeResponse 
} from '../types/leetcode'

export function LeetCodeSection() {
  // State management
  const [problems, setProblems] = useState<LeetCodeProblem[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [filters, setFilters] = useState<LeetCodeFilters>({
    page: 1,
    limit: 20,
    sortBy: 'dateCompleted',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalProblems: 0
  })
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingProblem, setEditingProblem] = useState<LeetCodeProblem | null>(null)
  const [deletingProblemId, setDeletingProblemId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('problems')

  // Load problems when component mounts or filters change
  const loadProblems = useCallback(async () => {
    try {
      setIsLoading(true)
      const response: LeetCodeResponse = await leetcodeApi.getProblems(filters)
      setProblems(response.problems)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Failed to load problems:', error)
      // Initialize with empty data if API fails
      setProblems([])
      setPagination({
        current: 1,
        total: 1,
        count: 0,
        totalProblems: 0
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Load analytics when tab changes to analytics
  const calculateAnalytics = useCallback(() => {
    if (problems.length > 0) {
      const newAnalytics: AnalyticsData = {
        easy: problems.filter(p => p.difficulty === 'Easy').length,
        medium: problems.filter(p => p.difficulty === 'Medium').length,
        hard: problems.filter(p => p.difficulty === 'Hard').length,
        totalSolved: problems.length,
        averageTime: problems.reduce((sum, p) => sum + p.timeSpent, 0) / problems.length,
        successRate: problems.reduce((sum, p) => sum + p.successRate, 0) / problems.length,
      }
      setAnalytics(newAnalytics)
    }
  }, [problems])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  useEffect(() => {
    calculateAnalytics()
  }, [calculateAnalytics])

  const handleCreateProblem = async (formData: LeetCodeFormData) => {
    try {
      setIsLoading(true)
      
      // If API is not available, add to local state for demo purposes
      try {
        await leetcodeApi.createProblem(formData)
        await loadProblems()
      } catch (apiError) {
        console.warn('API not available, using local state:', apiError)
        
        // Create a new problem locally
        const newProblem: LeetCodeProblem = {
          _id: `local-${Date.now()}`,
          problemNumber: formData.problemNumber,
          problemName: formData.problemName,
          difficulty: formData.difficulty,
          topic: formData.topic,
          timeSpent: formData.timeSpent,
          dateCompleted: formData.dateCompleted,
          attempts: formData.attempts,
          successRate: formData.successRate,
          notes: formData.notes,
          url: formData.url,
          personalRating: formData.personalRating,
          needsReview: formData.needsReview,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setProblems(prev => [newProblem, ...prev])
        setPagination(prev => ({
          ...prev,
          totalProblems: prev.totalProblems + 1,
          count: prev.count + 1
        }))
      }
      
      setIsFormDialogOpen(false)
      
      // Refresh analytics if it's loaded
      if (analytics) {
        calculateAnalytics()
      }
    } catch (error: any) {
      console.error('Failed to create problem:', error)
      alert('Failed to create problem. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProblem = async (formData: LeetCodeFormData) => {
    if (!editingProblem) return
    
    try {
      setIsLoading(true)
      
      try {
        await leetcodeApi.updateProblem(editingProblem._id, formData)
        await loadProblems()
      } catch (apiError) {
        console.warn('API not available, using local state:', apiError)
        
        // Update locally
        setProblems(prev => prev.map(p => 
          p._id === editingProblem._id 
            ? { ...p, ...formData }
            : p
        ))
      }
      
      setEditingProblem(null)
      setIsFormDialogOpen(false)
      
      // Refresh analytics if it's loaded
      if (analytics) {
        calculateAnalytics()
      }
    } catch (error) {
      console.error('Failed to update problem:', error)
      alert('Failed to update problem. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormSubmit = async (formData: LeetCodeFormData) => {
    if (editingProblem) {
      await handleUpdateProblem(formData)
    } else {
      await handleCreateProblem(formData)
    }
  }

  const handleEditProblem = (problem: LeetCodeProblem) => {
    setEditingProblem(problem)
    setIsFormDialogOpen(true)
  }

  const handleDeleteClick = (problemId: string) => {
    setDeletingProblemId(problemId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProblemId) return
    
    try {
      setIsLoading(true)
      
      try {
        await leetcodeApi.deleteProblem(deletingProblemId)
        await loadProblems()
      } catch (apiError) {
        console.warn('API not available, using local state:', apiError)
        
        // Delete locally
        setProblems(prev => prev.filter(p => p._id !== deletingProblemId))
        setPagination(prev => ({
          ...prev,
          totalProblems: Math.max(0, prev.totalProblems - 1),
          count: Math.max(0, prev.count - 1)
        }))
      }
      
      setIsDeleteDialogOpen(false)
      setDeletingProblemId(null)
      
      // Refresh analytics if it's loaded
      if (analytics) {
        calculateAnalytics()
      }
    } catch (error) {
      console.error('Failed to delete problem:', error)
      alert('Failed to delete problem. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: LeetCodeFilters) => {
    setFilters(newFilters)
  }

  const openAddDialog = () => {
    setEditingProblem(null)
    setIsFormDialogOpen(true)
  }

  const closeFormDialog = () => {
    setIsFormDialogOpen(false)
    setEditingProblem(null)
  }

  const problemToDelete = deletingProblemId ? 
    problems.find(p => p._id === deletingProblemId) : null

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="leetcode-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">LeetCode Tracking</h1>
            <p className="subtitle-text mt-2">
              Track your problem-solving progress and analyze your performance
            </p>
          </div>
          <Button onClick={openAddDialog} className="modern-button w-fit">
            <Plus className="mr-2 h-4 w-4" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="leetcode-stat-card">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Total Problems</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{pagination.totalProblems}</p>
        </div>
        <div className="leetcode-stat-card">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">This Week</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {problems.filter(p => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(p.dateCompleted) > weekAgo
            }).length}
          </p>
        </div>
        <div className="leetcode-stat-card">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Average Time</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {problems.length > 0 ? 
              Math.round(problems.reduce((sum, p) => sum + p.timeSpent, 0) / problems.length) + 'm' : 
              '0m'
            }
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="leetcode-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="problems" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Problems
              {pagination.totalProblems > 0 && (
                <Badge variant="secondary" className="ml-2">{pagination.totalProblems}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-4">
            <LeetCodeTable
              problems={problems}
              pagination={pagination}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onEdit={handleEditProblem}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics ? (
              <LeetCodeAnalytics 
                data={analytics} 
                isLoading={isAnalyticsLoading}
              />
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No Analytics Available
                </h3>
                <p className="subtitle-text mb-4">
                  Add some problems to see your analytics
                </p>
                <Button onClick={openAddDialog} className="modern-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Problem
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Problem Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={closeFormDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold gradient-text">
              {editingProblem ? 'Edit Problem' : 'Add New Problem'}
            </DialogTitle>
          </DialogHeader>
          <LeetCodeForm
            onSubmit={handleFormSubmit}
            initialData={editingProblem || undefined}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-700 dark:text-slate-200">
              Are you sure you want to delete the problem{' '}
              <strong>"{problemToDelete?.problemName}"</strong>?
            </p>
            <p className="text-sm subtitle-text">
              This action cannot be undone. All data associated with this problem will be permanently removed.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-slate-300 dark:border-slate-600"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 