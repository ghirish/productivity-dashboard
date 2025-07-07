import mongoose from 'mongoose'
import jobScraper from '../services/jobScraper'

async function testScrapersDetailed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_dashboard')
    console.log('📊 Connected to MongoDB')

    console.log('🚀 Testing individual job scrapers...\n')

    // Test each scraper individually to see extracted jobs
    const scraperInstance = (jobScraper as any)

    // Test Summer 2026
    console.log('🔍 Testing Summer 2026 Internships...')
    try {
      const summer2026Jobs = await scraperInstance.scrapeSummer2026()
      console.log(`Found ${summer2026Jobs.length} jobs:`)
      summer2026Jobs.slice(0, 3).forEach((job: any, index: number) => {
        console.log(`  ${index + 1}. ${job.company} - ${job.title}`)
        console.log(`     Location: ${job.location}`)
        console.log(`     Age: ${job.ageText}`)
        console.log(`     URL: ${job.applicationUrl.substring(0, 60)}...`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Summer2026 failed: ${error.message}`)
    }

    // Test SWE 2025
    console.log('🔍 Testing 2025 SWE College Jobs...')
    try {
      const swe2025Jobs = await scraperInstance.scrapeSWE2025()
      console.log(`Found ${swe2025Jobs.length} jobs:`)
      swe2025Jobs.slice(0, 3).forEach((job: any, index: number) => {
        console.log(`  ${index + 1}. ${job.company} - ${job.title}`)
        console.log(`     Location: ${job.location}`)
        console.log(`     Age: ${job.ageText}`)
        console.log(`     URL: ${job.applicationUrl.substring(0, 60)}...`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ SWE2025 failed: ${error.message}`)
    }

    // Test AI 2026
    console.log('🔍 Testing 2026 AI College Jobs...')
    try {
      const ai2026Jobs = await scraperInstance.scrapeAI2026()
      console.log(`Found ${ai2026Jobs.length} jobs:`)
      ai2026Jobs.slice(0, 3).forEach((job: any, index: number) => {
        console.log(`  ${index + 1}. ${job.company} - ${job.title}`)
        console.log(`     Location: ${job.location}`)
        console.log(`     Age: ${job.ageText}`)
        console.log(`     URL: ${job.applicationUrl.substring(0, 60)}...`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ AI2026 failed: ${error.message}`)
    }

    // Test Data Analysis 2025
    console.log('🔍 Testing 2025 Data Analysis Internship...')
    try {
      const data2025Jobs = await scraperInstance.scrapeJobrightAI('https://raw.githubusercontent.com/jobright-ai/2025-Data-Analysis-Internship/main/README.md')
      console.log(`Found ${data2025Jobs.length} jobs:`)
      data2025Jobs.slice(0, 3).forEach((job: any, index: number) => {
        console.log(`  ${index + 1}. ${job.company} - ${job.title}`)
        console.log(`     Location: ${job.location}`)
        console.log(`     Age: ${job.ageText}`)
        console.log(`     URL: ${job.applicationUrl.substring(0, 60)}...`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Data2025 failed: ${error.message}`)
    }

    // Test Product Management 2025
    console.log('🔍 Testing 2025 Product Management Internship...')
    try {
      const product2025Jobs = await scraperInstance.scrapeJobrightAI('https://raw.githubusercontent.com/jobright-ai/2025-Product-Management-Internship/main/README.md')
      console.log(`Found ${product2025Jobs.length} jobs:`)
      product2025Jobs.slice(0, 3).forEach((job: any, index: number) => {
        console.log(`  ${index + 1}. ${job.company} - ${job.title}`)
        console.log(`     Location: ${job.location}`)
        console.log(`     Age: ${job.ageText}`)
        console.log(`     URL: ${job.applicationUrl.substring(0, 60)}...`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Product2025 failed: ${error.message}`)
    }

    console.log('🔍 Testing complete scraping workflow...')
    const results = await jobScraper.scrapeAllJobs()
    
    console.log('\n📈 Overall Results:')
    console.log(`✅ Total jobs found: ${results.totalJobs}`)
    console.log(`🆕 New jobs added: ${results.newJobs}`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      results.errors.forEach(error => console.log(`  - ${error}`))
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n📪 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the detailed test
testScrapersDetailed() 