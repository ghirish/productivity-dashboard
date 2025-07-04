import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RefreshCw, ExternalLink, Eye, CheckCircle, Clock, XCircle, Trophy } from 'lucide-react'
import { toast } from 'sonner'

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary?: string
  applicationUrl: string
  source: 'summer2026-internships' | '2025-swe-college-jobs'
  sourceUrl: string
  postedDate: string
  ageText: string
  status: 'new' | 'interested' | 'applied' | 'interview' | 'rejected' | 'offer'
  appliedAt?: string
  notes?: string
  scrapedAt: string
}

interface JobStats {
  total: number
  new: number
  interested: number
  applied: number
  interview: number
  rejected: number
  offer: number
}

interface JobResponse {
  jobs: Job[]
  pagination: {
    currentPage: number
    totalPages: number
    totalJobs: number
    hasNext: boolean
    hasPrev: boolean
  }
  summary: JobStats
  filters: {
    days: number
    status?: string
    company?: string
    location?: string
    source?: string
  }
}

const JobsSection: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [pagination, setPagination] = useState<JobResponse['pagination']>({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNext: false,
    hasPrev: false
  })
  const [summary, setSummary] = useState<JobStats>({
    total: 0,
    new: 0,
    interested: 0,
    applied: 0,
    interview: 0,
    rejected: 0,
    offer: 0
  })

  // Filters
  const [filters, setFilters] = useState({
    days: 3,
    status: 'all',
    company: '',
    location: '',
    source: 'all'
  })

  // Status update dialog
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [newStatus, setNewStatus] = useState<Job['status']>('new')
  const [notes, setNotes] = useState('')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('days', filters.days.toString())
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.company) params.append('company', filters.company)
      if (filters.location) params.append('location', filters.location)
      if (filters.source !== 'all') params.append('source', filters.source)

      const response = await fetch(`http://127.0.0.1:3002/api/jobs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch jobs')

      const data: JobResponse = await response.json()
      setJobs(data.jobs)
      setPagination(data.pagination)
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const triggerScraping = async () => {
    setScraping(true)
    try {
      const response = await fetch('http://127.0.0.1:3002/api/jobs/scrape')
      if (!response.ok) throw new Error('Scraping failed')

      const result = await response.json()
      toast.success(`Scraping completed! Found ${result.results.newJobs} new jobs`)
      fetchJobs() // Refresh the list
    } catch (error) {
      console.error('Error triggering scraping:', error)
      toast.error('Failed to trigger scraping')
    } finally {
      setScraping(false)
    }
  }

  const updateJobStatus = async (jobId: string, status: Job['status'], jobNotes?: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:3002/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes: jobNotes
        })
      })

      if (!response.ok) throw new Error('Failed to update job status')

      const result = await response.json()
      toast.success(`Job marked as ${status}`)
      
      // Update local state
      setJobs(prev => prev.map(job => 
        job._id === jobId ? { ...job, status, notes: jobNotes } : job
      ))
      
      // Update summary counts
      fetchJobs()
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error('Failed to update job status')
    }
  }

  const openStatusDialog = (job: Job) => {
    setSelectedJob(job)
    setNewStatus(job.status)
    setNotes(job.notes || '')
    setStatusDialogOpen(true)
  }

  const handleStatusUpdate = () => {
    if (selectedJob) {
      updateJobStatus(selectedJob._id, newStatus, notes)
      setStatusDialogOpen(false)
    }
  }

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'new': return <Clock className="h-4 w-4" />
      case 'interested': return <Eye className="h-4 w-4" />
      case 'applied': return <CheckCircle className="h-4 w-4" />
      case 'interview': return <Trophy className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'offer': return <Trophy className="h-4 w-4 text-green-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'interested': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'applied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'interview': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'offer': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getSourceBadge = (source: Job['source']) => {
    return source === 'summer2026-internships' ? '2026 Internships' : '2025 SWE Jobs'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Job Opportunities</h2>
          <p className="text-muted-foreground">
            Recent job postings from GitHub repositories
          </p>
        </div>
        <Button 
          onClick={triggerScraping} 
          disabled={scraping}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${scraping ? 'animate-spin' : ''}`} />
          {scraping ? 'Scraping...' : 'Refresh Jobs'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{summary.new}</div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{summary.interested}</div>
            <p className="text-xs text-muted-foreground">Interested</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{summary.applied}</div>
            <p className="text-xs text-muted-foreground">Applied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{summary.interview}</div>
            <p className="text-xs text-muted-foreground">Interview</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{summary.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{summary.offer}</div>
            <p className="text-xs text-muted-foreground">Offers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="days">Days</Label>
              <Select 
                value={filters.days.toString()} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, days: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 1 day</SelectItem>
                  <SelectItem value="3">Last 3 days</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Select 
                value={filters.source} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="summer2026-internships">2026 Internships</SelectItem>
                  <SelectItem value="2025-swe-college-jobs">2025 SWE Jobs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Filter by company..."
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Filter by location..."
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Postings ({pagination.totalJobs})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell className="font-medium">{job.company}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          {job.salary && (
                            <div className="text-sm text-muted-foreground">{job.salary}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSourceBadge(job.source)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {job.ageText}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusDialog(job)}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(job.applicationUrl, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {jobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs found matching your filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedJob.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedJob.company}</p>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Job['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this application..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default JobsSection 