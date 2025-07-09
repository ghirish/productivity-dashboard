import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
  title: string
  company: string
  location: string
  salary?: string
  applicationUrl: string
  source: 'summer2026-internships' | '2025-swe-college-jobs' | '2026-ai-college-jobs' | '2025-data-analysis-internship' | '2025-product-management-internship'
  sourceUrl: string
  postedDate: Date
  ageText: string // Original age text from source (e.g., "2d", "Jul 01")
  scrapedAt: Date
  
  // Application tracking
  status: 'new' | 'interested' | 'applied' | 'interview' | 'rejected' | 'offer'
  appliedAt?: Date
  notes?: string
  
  // Deduplication
  uniqueKey: string // Combination of company + title + location for dedup
  
  // Metadata
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const jobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: String,
    trim: true
  },
  applicationUrl: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['summer2026-internships', '2025-swe-college-jobs', '2026-ai-college-jobs', '2025-data-analysis-internship', '2025-product-management-internship'],
    required: true
  },
  sourceUrl: {
    type: String,
    required: true
  },
  postedDate: {
    type: Date,
    required: true
  },
  ageText: {
    type: String,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  
  // Application tracking
  status: {
    type: String,
    enum: ['new', 'interested', 'applied', 'interview', 'rejected', 'offer'],
    default: 'new'
  },
  appliedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  
  // Deduplication
  uniqueKey: {
    type: String,
    required: true,
    unique: true
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Ensure all dates are in ISO format
      if (ret.postedDate && typeof ret.postedDate !== 'string') ret.postedDate = ret.postedDate.toISOString()
      if (ret.scrapedAt && typeof ret.scrapedAt !== 'string') ret.scrapedAt = ret.scrapedAt.toISOString()
      if (ret.appliedAt && typeof ret.appliedAt !== 'string') ret.appliedAt = ret.appliedAt.toISOString()
      if (ret.createdAt && typeof ret.createdAt !== 'string') ret.createdAt = ret.createdAt.toISOString()
      if (ret.updatedAt && typeof ret.updatedAt !== 'string') ret.updatedAt = ret.updatedAt.toISOString()
      return ret
    }
  }
})

// Index for efficient querying
jobSchema.index({ source: 1, postedDate: -1 })
jobSchema.index({ status: 1 })
jobSchema.index({ uniqueKey: 1 })
jobSchema.index({ scrapedAt: -1 })

// Pre-save middleware to generate unique key
jobSchema.pre('save', function(next) {
  if (this.isModified('company') || this.isModified('title') || this.isModified('location')) {
    this.uniqueKey = `${this.company.toLowerCase()}-${this.title.toLowerCase()}-${this.location.toLowerCase()}`
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  next()
})

export default mongoose.model<IJob>('Job', jobSchema) 