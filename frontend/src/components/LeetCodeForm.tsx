import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { X, Plus } from 'lucide-react'
import { LeetCodeFormData } from '../types/leetcode'
import { COMMON_TOPICS } from '../services/leetcodeApi'

const formSchema = z.object({
  problemName: z.string().min(1, 'Problem name is required'),
  problemNumber: z.number().min(1, 'Problem number must be positive'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  topic: z.array(z.string()).min(1, 'At least one topic is required'),
  timeSpent: z.number().min(1, 'Time spent must be positive'),
  dateCompleted: z.string().min(1, 'Date is required'),
  attempts: z.number().min(1, 'At least one attempt required'),
  successRate: z.number().min(0).max(100, 'Success rate must be between 0-100'),
  notes: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  personalRating: z.number().min(1).max(5).optional(),
  needsReview: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface LeetCodeFormProps {
  onSubmit: (data: LeetCodeFormData) => Promise<void>
  initialData?: Partial<LeetCodeFormData>
  isLoading?: boolean
}

export function LeetCodeForm({ onSubmit, initialData, isLoading = false }: LeetCodeFormProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialData?.topic || [])
  const [customTopic, setCustomTopic] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      problemName: initialData?.problemName || '',
      problemNumber: initialData?.problemNumber || 1,
      difficulty: initialData?.difficulty || 'Easy',
      topic: initialData?.topic || [],
      timeSpent: initialData?.timeSpent || 30,
      dateCompleted: initialData?.dateCompleted ? 
        new Date(initialData.dateCompleted).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      attempts: initialData?.attempts || 1,
      successRate: initialData?.successRate || 100,
      notes: initialData?.notes || '',
      url: initialData?.url || '',
      personalRating: initialData?.personalRating || undefined,
      needsReview: initialData?.needsReview || false,
    },
  })

  const handleSubmit = async (values: FormData) => {
    const formData: LeetCodeFormData = {
      ...values,
      topic: selectedTopics,
    }
    await onSubmit(formData)
    if (!initialData) {
      form.reset()
      setSelectedTopics([])
    }
  }

  const addTopic = (topic: string) => {
    if (topic && !selectedTopics.includes(topic)) {
      const newTopics = [...selectedTopics, topic]
      setSelectedTopics(newTopics)
      form.setValue('topic', newTopics)
    }
  }

  const removeTopic = (topicToRemove: string) => {
    const newTopics = selectedTopics.filter(topic => topic !== topicToRemove)
    setSelectedTopics(newTopics)
    form.setValue('topic', newTopics)
  }

  const addCustomTopic = () => {
    if (customTopic.trim()) {
      addTopic(customTopic.trim())
      setCustomTopic('')
      setIsDialogOpen(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Problem' : 'Add New LeetCode Problem'}</CardTitle>
        <CardDescription>
          Track your LeetCode problem-solving progress with detailed analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="problemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Two Sum" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="problemNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Difficulty and URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LeetCode URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://leetcode.com/problems/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Topics */}
            <div>
              <Label>Topics</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {selectedTopics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="flex items-center gap-1">
                    {topic}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTopic(topic)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {COMMON_TOPICS.filter(topic => !selectedTopics.includes(topic)).slice(0, 12).map((topic) => (
                  <Button
                    key={topic}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTopic(topic)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {topic}
                  </Button>
                ))}
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Custom Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Topic</DialogTitle>
                    <DialogDescription>
                      Enter a custom topic not in the common list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter topic name"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
                    />
                    <Button onClick={addCustomTopic}>Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Time and Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="timeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Spent (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Attempts</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="successRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Success Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="100" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateCompleted"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Completed</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personalRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Difficulty Rating (1-5)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Easy</SelectItem>
                        <SelectItem value="2">2 - Easy</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - Hard</SelectItem>
                        <SelectItem value="5">5 - Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Key insights, approaches used, areas for improvement..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Record your thoughts, solution approach, or areas to review
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Needs Review Checkbox */}
            <FormField
              control={form.control}
              name="needsReview"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input 
                      type="checkbox" 
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark for review
                    </FormLabel>
                    <FormDescription>
                      Flag this problem if you want to revisit it later
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || selectedTopics.length === 0}
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Problem' : 'Add Problem')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 