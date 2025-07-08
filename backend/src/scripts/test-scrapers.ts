import mongoose from 'mongoose'
import jobScraper from '../services/jobScraper'

async function testEachRepository() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/productivity_dashboard')
    console.log('📊 Connected to MongoDB\n')

    // Test each repository individually
    console.log('=' .repeat(80))
    console.log('🔗 GITHUB REPOSITORY: Summer 2026 Internships')
    console.log('🌐 URL: https://github.com/vanshb03/Summer2026-Internships/tree/dev?tab=readme-ov-file')
    console.log('📄 Section: Main table')
    console.log('=' .repeat(80))
    try {
      const summer2026Jobs = await (jobScraper as any).scrapeSummer2026()
      console.log(`✅ Found ${summer2026Jobs.length} jobs:\n`)
      summer2026Jobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.company} - ${job.title}`)
        console.log(`   📍 Location: ${job.location}`)
        console.log(`   📅 Posted: ${job.ageText}`)
        console.log(`   🔗 Apply: ${job.applicationUrl}`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }

    console.log('=' .repeat(80))
    console.log('🔗 GITHUB REPOSITORY: 2025 SWE College Jobs')
    console.log('🌐 URL: https://github.com/speedyapply/2025-SWE-College-Jobs/blob/main/README.md')
    console.log('📄 Section: Other section')
    console.log('=' .repeat(80))
    try {
      const swe2025Jobs = await (jobScraper as any).scrapeSWE2025()
      console.log(`✅ Found ${swe2025Jobs.length} jobs:\n`)
      swe2025Jobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.company} - ${job.title}`)
        console.log(`   📍 Location: ${job.location}`)
        console.log(`   📅 Posted: ${job.ageText}`)
        console.log(`   🔗 Apply: ${job.applicationUrl}`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }

    console.log('=' .repeat(80))
    console.log('🔗 GITHUB REPOSITORY: 2026 AI College Jobs')
    console.log('🌐 URL: https://github.com/speedyapply/2026-AI-College-Jobs')
    console.log('📄 Section: Other section')
    console.log('=' .repeat(80))
    try {
      const ai2026Jobs = await (jobScraper as any).scrapeAI2026()
      console.log(`✅ Found ${ai2026Jobs.length} jobs:\n`)
      ai2026Jobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.company} - ${job.title}`)
        console.log(`   📍 Location: ${job.location}`)
        console.log(`   📅 Posted: ${job.ageText}`)
        console.log(`   🔗 Apply: ${job.applicationUrl}`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }

    console.log('=' .repeat(80))
    console.log('🔗 GITHUB REPOSITORY: 2025 Data Analysis Internship')
    console.log('🌐 URL: https://github.com/jobright-ai/2025-Data-Analysis-Internship?tab=readme-ov-file')
    console.log('📄 Section: Daily Job List')
    console.log('=' .repeat(80))
    try {
      const data2025Jobs = await (jobScraper as any).scrapeJobrightAI('DATA2025')
      console.log(`✅ Found ${data2025Jobs.length} jobs:\n`)
      data2025Jobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.company} - ${job.title}`)
        console.log(`   📍 Location: ${job.location}`)
        console.log(`   📅 Posted: ${job.ageText}`)
        console.log(`   🔗 Apply: ${job.applicationUrl}`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }

    console.log('=' .repeat(80))
    console.log('🔗 GITHUB REPOSITORY: 2025 Product Management Internship')
    console.log('🌐 URL: https://github.com/jobright-ai/2025-Product-Management-Internship')
    console.log('📄 Section: Daily Job List')
    console.log('=' .repeat(80))
    try {
      const product2025Jobs = await (jobScraper as any).scrapeJobrightAI('PRODUCT2025')
      console.log(`✅ Found ${product2025Jobs.length} jobs:\n`)
      product2025Jobs.forEach((job: any, index: number) => {
        console.log(`${index + 1}. ${job.company} - ${job.title}`)
        console.log(`   📍 Location: ${job.location}`)
        console.log(`   📅 Posted: ${job.ageText}`)
        console.log(`   🔗 Apply: ${job.applicationUrl}`)
        console.log('')
      })
    } catch (error: any) {
      console.log(`❌ Failed: ${error.message}\n`)
    }

    console.log('=' .repeat(80))
    console.log('📊 OVERALL TEST - All repositories combined')
    console.log('=' .repeat(80))
    try {
      const results = await jobScraper.scrapeAllJobs()
      console.log(`✅ Total jobs found: ${results.totalJobs}`)
      console.log(`🆕 New jobs added: ${results.newJobs}`)
      if (results.errors.length > 0) {
        console.log('\n❌ Errors encountered:')
        results.errors.forEach(error => console.log(`  - ${error}`))
      }
    } catch (error: any) {
      console.log(`❌ Overall test failed: ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\n📪 Disconnected from MongoDB')
    process.exit(0)
  }
}

// Run the test
testEachRepository() 