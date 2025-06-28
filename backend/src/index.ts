import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// Import routes
import leetcodeRoutes from './routes/leetcode'
import githubRoutes from './routes/github'
import spotifyRoutes from './routes/spotify'
import jobsRoutes from './routes/jobs'
import pomodoroRoutes from './routes/pomodoro'
import todosRoutes from './routes/todos'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/productivity_dashboard'
    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB')
  } catch (error: any) {
    console.warn('⚠️  MongoDB connection failed - running without database:', error.message)
    console.log('💡 You can add MongoDB Atlas URI to .env file later')
  }
}

// API Routes
app.use('/api/leetcode', leetcodeRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/jobs', jobsRoutes)
app.use('/api/pomodoro', pomodoroRoutes)
app.use('/api/todos', todosRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CS Productivity Dashboard API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Start server
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/health`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
}) 