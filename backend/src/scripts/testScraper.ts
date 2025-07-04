import jobScraper from '../services/jobScraper'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testScraping() {
  try {
    // Connect to MongoDB (optional, only if you want to test saving)
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI)
      console.log('✅ Connected to MongoDB')
    }

    console.log('🔍 Testing Summer 2026 Internships scraping...')
    console.log('============================================')
    
    // Test Summer 2026 scraping
    const summer2026Jobs = await (jobScraper as any).scrapeSummer2026()
    console.log(`Found ${summer2026Jobs.length} jobs from Summer 2026:`)
    summer2026Jobs.forEach((job: any, index: number) => {
      console.log(`\nJob ${index + 1}:`)
      console.log('Title:', job.title)
      console.log('Company:', job.company)
      console.log('Location:', job.location)
      console.log('Age:', job.ageText)
      console.log('Posted Date:', job.postedDate)
      console.log('Application URL:', job.applicationUrl)
      console.log('---')
    })

    console.log('\n🔍 Testing 2025 SWE Jobs scraping...')
    console.log('===================================')
    
    // Test 2025 SWE scraping
    const swe2025Jobs = await (jobScraper as any).scrapeSWE2025()
    console.log(`Found ${swe2025Jobs.length} jobs from 2025 SWE:`)
    swe2025Jobs.forEach((job: any, index: number) => {
      console.log(`\nJob ${index + 1}:`)
      console.log('Title:', job.title)
      console.log('Company:', job.company)
      console.log('Location:', job.location)
      console.log('Salary:', job.salary || 'Not specified')
      console.log('Age:', job.ageText)
      console.log('Posted Date:', job.postedDate)
      console.log('Application URL:', job.applicationUrl)
      console.log('---')
    })

    // Test full scraping process
    console.log('\n🔍 Testing complete scraping process...')
    console.log('====================================')
    const results = await jobScraper.scrapeAllJobs()
    console.log('Scraping results:', results)

  } catch (error: any) {
    console.error('❌ Error during testing:', error.message)
  } finally {
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
      console.log('📡 Disconnected from MongoDB')
    }
    process.exit(0)
  }
}

// Run the test
console.log('🚀 Starting scraper test...')
testScraping() 