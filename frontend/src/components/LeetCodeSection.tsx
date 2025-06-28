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
      // You could add toast notifications here
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
      await leetcodeApi.createProblem(formData)
      setIsFormDialogOpen(false)
      await loadProblems()
      // Refresh analytics if it's loaded
      if (analytics) {
        await calculateAnalytics()
      }
    } catch (error: any) {
      console.error('Failed to create problem:', error)
      // Handle specific errors like duplicate problem numbers
      if (error.response?.status === 400) {
        alert(error.response.data.error || 'Failed to create problem')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProblem = async (formData: LeetCodeFormData) => {
    if (!editingProblem) return
    
    try {
      setIsLoading(true)
      await leetcodeApi.updateProblem(editingProblem._id, formData)
      setEditingProblem(null)
      setIsFormDialogOpen(false)
      await loadProblems()
      // Refresh analytics if it's loaded
      if (analytics) {
        await calculateAnalytics()
      }
    } catch (error) {
      console.error('Failed to update problem:', error)
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
      await leetcodeApi.deleteProblem(deletingProblemId)
      setIsDeleteDialogOpen(false)
      setDeletingProblemId(null)
      await loadProblems()
      // Refresh analytics if it's loaded
      if (analytics) {
        await calculateAnalytics()
      }
    } catch (error) {
      console.error('Failed to delete problem:', error)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">LeetCode Tracking</h1>
          <p className="text-gray-600">
            Track your problem-solving progress and analyze your performance
          </p>
        </div>
        <Button onClick={openAddDialog} className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Add Problem
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Total Problems</h3>
          <p className="text-3xl font-bold">{pagination.totalProblems}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">This Week</h3>
          <p className="text-3xl font-bold">
            {problems.filter(p => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(p.dateCompleted) > weekAgo
            }).length}
          </p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Average Time</h3>
          <p className="text-3xl font-bold">
            {problems.length > 0 ? 
              Math.round(problems.reduce((sum, p) => sum + p.timeSpent, 0) / problems.length) + 'm' : 
              '0m'
            }
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="problems" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Problems
            {pagination.totalProblems > 0 && (
              <Badge variant="secondary">{pagination.totalProblems}</Badge>
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
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Analytics Available
              </h3>
              <p className="text-gray-600 mb-4">
                Add some problems to see your analytics
              </p>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Problem
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Problem Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={closeFormDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
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
            <p>
              Are you sure you want to delete the problem{' '}
              <strong>"{problemToDelete?.problemName}"</strong>?
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. All data associated with this problem will be permanently removed.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
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