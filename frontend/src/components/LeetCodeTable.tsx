import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  Search, 
  Filter, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { LeetCodeProblem, LeetCodeFilters, PaginationInfo } from '../types/leetcode'

interface LeetCodeTableProps {
  problems: LeetCodeProblem[]
  pagination: PaginationInfo
  filters: LeetCodeFilters
  onFiltersChange: (filters: LeetCodeFilters) => void
  onEdit: (problem: LeetCodeProblem) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const difficultyColors = {
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  Hard: 'bg-red-100 text-red-800'
}

export function LeetCodeTable({ 
  problems, 
  pagination, 
  filters, 
  onFiltersChange, 
  onEdit, 
  onDelete,
  isLoading = false
}: LeetCodeTableProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  const handleSearch = () => {
    onFiltersChange({ ...filters, search: searchTerm, page: 1 })
  }

  const handleFilterChange = (key: keyof LeetCodeFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 })
  }

  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc'
    onFiltersChange({ ...filters, sortBy: field, sortOrder: newOrder })
  }

  const handlePageChange = (newPage: number) => {
    onFiltersChange({ ...filters, page: newPage })
  }

  const getSortIcon = (field: string) => {
    if (filters.sortBy === field) {
      return filters.sortOrder === 'desc' ? '↓' : '↑'
    }
    return <ArrowUpDown className="h-4 w-4" />
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LeetCode Problems</CardTitle>
        <CardDescription>
          Track and analyze your problem-solving progress
        </CardDescription>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search problems or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select 
              value={filters.difficulty || 'all'} 
              onValueChange={(value) => handleFilterChange('difficulty', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.limit?.toString() || '20'} 
              onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Show" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Loading problems...</div>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">No problems found</div>
            <div className="text-sm text-gray-400">
              {filters.search || filters.difficulty ? 'Try adjusting your filters' : 'Add your first problem to get started'}
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('problemNumber')}
                    >
                      <div className="flex items-center gap-2">
                        # {getSortIcon('problemNumber')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('problemName')}
                    >
                      <div className="flex items-center gap-2">
                        Problem {getSortIcon('problemName')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('difficulty')}
                    >
                      <div className="flex items-center gap-2">
                        Difficulty {getSortIcon('difficulty')}
                      </div>
                    </TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('timeSpent')}
                    >
                      <div className="flex items-center gap-2">
                        Time {getSortIcon('timeSpent')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('attempts')}
                    >
                      <div className="flex items-center gap-2">
                        Attempts {getSortIcon('attempts')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('successRate')}
                    >
                      <div className="flex items-center gap-2">
                        Success {getSortIcon('successRate')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50" 
                      onClick={() => handleSort('dateCompleted')}
                    >
                      <div className="flex items-center gap-2">
                        Date {getSortIcon('dateCompleted')}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow key={problem._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {problem.problemNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{problem.problemName}</span>
                          {problem.needsReview && (
                            <Badge variant="outline" className="text-xs">
                              Review
                            </Badge>
                          )}
                          {problem.url && (
                            <a
                              href={problem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={difficultyColors[problem.difficulty]}>
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {problem.topic.slice(0, 2).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {problem.topic.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{problem.topic.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(problem.timeSpent)}</TableCell>
                      <TableCell>{problem.attempts}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{problem.successRate}%</span>
                          {problem.personalRating && (
                            <span className="text-yellow-500">
                              {'★'.repeat(problem.personalRating)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(problem.dateCompleted), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(problem)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(problem._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-600">
                Showing {problems.length} of {pagination.totalProblems} problems
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {pagination.current} of {pagination.total}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current >= pagination.total}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 