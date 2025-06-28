import mongoose, { Document, Schema } from 'mongoose'

export interface ILeetCodeProblem extends Document {
  problemName: string
  problemNumber: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  topic: string[]
  timeSpent: number // in minutes
  dateCompleted: Date
  attempts: number
  successRate: number // percentage 0-100
  notes?: string
  url?: string
  personalRating?: number // 1-5 difficulty rating
  needsReview: boolean
  createdAt: Date
  updatedAt: Date
}

const LeetCodeProblemSchema = new Schema<ILeetCodeProblem>({
  problemName: {
    type: String,
    required: true,
    trim: true
  },
  problemNumber: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  topic: [{
    type: String,
    required: true,
    trim: true
  }],
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  dateCompleted: {
    type: Date,
    required: true,
    default: Date.now
  },
  attempts: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  successRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  notes: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  personalRating: {
    type: Number,
    min: 1,
    max: 5
  },
  needsReview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret._id = ret._id.toString()
      delete ret.__v
      return ret
    }
  }
})

// Indexes for better query performance
LeetCodeProblemSchema.index({ difficulty: 1 })
LeetCodeProblemSchema.index({ topic: 1 })
LeetCodeProblemSchema.index({ problemNumber: 1 }, { unique: true })
LeetCodeProblemSchema.index({ dateCompleted: -1 })
LeetCodeProblemSchema.index({ needsReview: 1 })

// Virtual for calculating average time per attempt
LeetCodeProblemSchema.virtual('timePerAttempt').get(function() {
  return this.timeSpent / this.attempts
})

export default mongoose.model<ILeetCodeProblem>('LeetCodeProblem', LeetCodeProblemSchema) 