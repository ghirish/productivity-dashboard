import * as cron from 'node-cron'
import jobScraper from './jobScraper'

export class Scheduler {
  private cronJob: cron.ScheduledTask | null = null

  /**
   * Start the scheduled job scraping
   * Runs daily at 8:00 AM
   */
  start() {
    // Daily at 8:00 AM
    this.cronJob = cron.schedule('0 8 * * *', async () => {
      console.log('🕐 Starting scheduled job scraping...')
      try {
        const results = await jobScraper.scrapeAllJobs()
        console.log('✅ Scheduled scraping completed:', results)
        
        // Log summary
        if (results.newJobs > 0) {
          console.log(`📊 Found ${results.newJobs} new jobs out of ${results.totalJobs} total`)
        } else {
          console.log('📊 No new jobs found in this scraping cycle')
        }

        if (results.errors.length > 0) {
          console.warn('⚠️ Scraping errors:', results.errors)
        }

      } catch (error: any) {
        console.error('❌ Scheduled scraping failed:', error.message)
      }
    }, {
      timezone: 'America/New_York' // Adjust timezone as needed
    })
    console.log('⏰ Job scraping scheduler started - will run daily at 8:00 AM EST')
  }

  /**
   * Stop the scheduled scraping
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
      console.log('⏰ Job scraping scheduler stopped')
    }
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.cronJob !== null
  }

  /**
   * Get the next scheduled run time
   */
  getNextRun(): Date | null {
    if (this.cronJob) {
      // Calculate next 8:00 AM
      const now = new Date()
      const next = new Date()
      next.setHours(8, 0, 0, 0)
      
      // If 8:00 AM has passed today, schedule for tomorrow
      if (now.getHours() >= 8) {
        next.setDate(next.getDate() + 1)
      }
      
      return next
    }
    return null
  }

  /**
   * Manually trigger scraping (outside of schedule)
   */
  async triggerManualScraping() {
    console.log('🚀 Manual scraping triggered via scheduler...')
    try {
      const results = await jobScraper.scrapeAllJobs()
      console.log('✅ Manual scraping completed:', results)
      return results
    } catch (error: any) {
      console.error('❌ Manual scraping failed:', error.message)
      throw error
    }
  }
}

export default new Scheduler() 