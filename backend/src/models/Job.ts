import mongoose, { Document, Schema } from 'mongoose'

export interface IJob extends Document {
  title: string
  company: string
  location: string
  salary?: string
  applicationUrl: string
  source: 'summer2026-internships' | '2025-swe-college-jobs'
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
    enum: ['summer2026-internships', '2025-swe-college-jobs'],
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
  timestamps: true
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