import axios from 'axios'
import * as cheerio from 'cheerio'
import Job, { IJob } from '../models/Job'

interface ScrapedJob {
  title: string
  company: string
  location: string
  salary?: string
  applicationUrl: string
  ageText: string
  postedDate: Date
}

export class JobScraper {
  private readonly SOURCES = {
    SUMMER2026: {
      name: 'summer2026-internships' as const,
      url: 'https://github.com/vanshb03/Summer2026-Internships/tree/dev?tab=readme-ov-file',
      rawUrl: 'https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/dev/README.md',
      offseasonRawUrl: 'https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/dev/OFFSEASON_README.md'
    },
    SWE2025: {
      name: '2025-swe-college-jobs' as const,
      url: 'https://github.com/speedyapply/2025-SWE-College-Jobs/blob/main/README.md',
      rawUrl: 'https://raw.githubusercontent.com/speedyapply/2025-SWE-College-Jobs/main/README.md'
    },
    AI2026: {
      name: '2026-ai-college-jobs' as const,
      url: 'https://github.com/speedyapply/2026-AI-College-Jobs',
      rawUrl: 'https://raw.githubusercontent.com/speedyapply/2026-AI-College-Jobs/main/README.md'
    },
    DATA2025: {
      name: '2025-data-analysis-internship' as const,
      url: 'https://github.com/jobright-ai/2025-Data-Analysis-Internship?tab=readme-ov-file',
      rawUrl: 'https://raw.githubusercontent.com/jobright-ai/2025-Data-Analysis-Internship/master/README.md'
    },
    PRODUCT2025: {
      name: '2025-product-management-internship' as const,
      url: 'https://github.com/jobright-ai/2025-Product-Management-Internship',
      rawUrl: 'https://raw.githubusercontent.com/jobright-ai/2025-Product-Management-Internship/master/README.md'
    }
  }

  /**
   * Main scraping function that orchestrates scraping from all sources
   */
  async scrapeAllJobs(): Promise<{ newJobs: number; totalJobs: number; errors: string[] }> {
    const results = {
      newJobs: 0,
      totalJobs: 0,
      errors: [] as string[]
    }

    try {
      // Scrape from Summer 2026 Internships (main README)
      const summer2026Jobs = await this.scrapeSummer2026()
      const summer2026NewJobs = await this.saveJobs(summer2026Jobs, this.SOURCES.SUMMER2026.name, this.SOURCES.SUMMER2026.url)
      results.newJobs += summer2026NewJobs
      results.totalJobs += summer2026Jobs.length

      console.log(`✅ Summer2026: Found ${summer2026Jobs.length} jobs, ${summer2026NewJobs} new`)
    } catch (error: any) {
      const errorMsg = `Summer2026 scraping failed: ${error.message}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    try {
      // Scrape from 2025 SWE College Jobs
      const swe2025Jobs = await this.scrapeSWE2025()
      const swe2025NewJobs = await this.saveJobs(swe2025Jobs, this.SOURCES.SWE2025.name, this.SOURCES.SWE2025.url)
      results.newJobs += swe2025NewJobs
      results.totalJobs += swe2025Jobs.length

      console.log(`✅ SWE2025: Found ${swe2025Jobs.length} jobs, ${swe2025NewJobs} new`)
    } catch (error: any) {
      const errorMsg = `SWE2025 scraping failed: ${error.message}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    try {
      // Scrape from 2026 AI College Jobs
      const ai2026Jobs = await this.scrapeAI2026()
      const ai2026NewJobs = await this.saveJobs(ai2026Jobs, this.SOURCES.AI2026.name, this.SOURCES.AI2026.url)
      results.newJobs += ai2026NewJobs
      results.totalJobs += ai2026Jobs.length

      console.log(`✅ AI2026: Found ${ai2026Jobs.length} jobs, ${ai2026NewJobs} new`)
    } catch (error: any) {
      const errorMsg = `AI2026 scraping failed: ${error.message}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    try {
      // Scrape from 2025 Data Analysis Internship
      const data2025Jobs = await this.scrapeJobrightAI('DATA2025')
      const data2025NewJobs = await this.saveJobs(data2025Jobs, this.SOURCES.DATA2025.name, this.SOURCES.DATA2025.url)
      results.newJobs += data2025NewJobs
      results.totalJobs += data2025Jobs.length

      console.log(`✅ Data2025: Found ${data2025Jobs.length} jobs, ${data2025NewJobs} new`)
    } catch (error: any) {
      const errorMsg = `Data2025 scraping failed: ${error.message}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    try {
      // Scrape from 2025 Product Management Internship
      const product2025Jobs = await this.scrapeJobrightAI('PRODUCT2025')
      const product2025NewJobs = await this.saveJobs(product2025Jobs, this.SOURCES.PRODUCT2025.name, this.SOURCES.PRODUCT2025.url)
      results.newJobs += product2025NewJobs
      results.totalJobs += product2025Jobs.length

      console.log(`✅ Product2025: Found ${product2025Jobs.length} jobs, ${product2025NewJobs} new`)
    } catch (error: any) {
      const errorMsg = `Product2025 scraping failed: ${error.message}`
      console.error(errorMsg)
      results.errors.push(errorMsg)
    }

    return results
  }

  /**
   * Extract URL from HTML link or markdown link
   */
  private extractUrl(text: string): string | null {
    // Try HTML link first
    const htmlMatch = text.match(/<a href="([^"]+)"/)
    if (htmlMatch) return htmlMatch[1]

    // Try markdown link
    const mdMatch = text.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (mdMatch) return mdMatch[2]

    return null
  }

  /**
   * Extract text content from HTML/markdown
   */
  private extractText(text: string): string {
    return text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract text from markdown links
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove code
      .replace(/<br\/?>/g, ' ') // Replace line breaks with space
      .replace(/&nbsp;/g, ' ') // Replace HTML spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * Scrape jobs from Summer 2026 Internships repository (both main and offseason README files)
   */
  private async scrapeSummer2026(): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = []

    try {
      // Scrape from main README.md (Summer 2026 positions)
      console.log('🔍 Scraping Summer 2026 main README...')
      const mainReadmeJobs = await this.scrapeSummer2026FromUrl(this.SOURCES.SUMMER2026.rawUrl, 'main README')
      allJobs.push(...mainReadmeJobs)
      console.log(`✅ Found ${mainReadmeJobs.length} jobs from main README`)
    } catch (error: any) {
      console.error('❌ Failed to scrape main README:', error.message)
    }

    try {
      // Scrape from OFFSEASON_README.md (Spring & Fall 2026 positions)
      console.log('🔍 Scraping Summer 2026 offseason README...')
      const offseasonJobs = await this.scrapeSummer2026FromUrl(this.SOURCES.SUMMER2026.offseasonRawUrl, 'offseason README')
      allJobs.push(...offseasonJobs)
      console.log(`✅ Found ${offseasonJobs.length} jobs from offseason README`)
    } catch (error: any) {
      console.error('❌ Failed to scrape offseason README:', error.message)
    }

    // Remove duplicates based on company + title + location
    const uniqueJobs = this.removeDuplicateJobs(allJobs)
    console.log(`🔄 Combined: ${allJobs.length} total, ${uniqueJobs.length} unique jobs`)

    return uniqueJobs
  }

  /**
   * Scrape jobs from a specific Summer 2026 README URL
   */
  private async scrapeSummer2026FromUrl(url: string, source: string): Promise<ScrapedJob[]> {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    const content = response.data
    const jobs: ScrapedJob[] = []

    // Parse markdown table - look for "Other" section or any table
    const lines = content.split('\n')
    let inTable = false
    let foundOtherSection = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for "Other" section
      if (line.includes('Other') || line.includes('## The List') || line.includes('### Legend')) {
        foundOtherSection = true
        continue
      }
      
      // Only start looking for table after finding relevant section
      if (!foundOtherSection) {
        continue
      }
      
      // Detect table header - Summer2026 format
      if (line.includes('| Company |') && line.includes('| Role |') && line.includes('| Date Posted |')) {
        inTable = true
        continue
      }
      
      // Skip separator line
      if (line.startsWith('|---') || line.startsWith('|-')) {
        continue
      }
      
      // End of table
      if (inTable && (!line.startsWith('|') || line.length < 10 || line.includes('Back to Top'))) {
        break
      }
      
      // Parse table row
      if (inTable && line.startsWith('|')) {
        try {
          const job = this.parseSummer2026Row(line)
          if (job && this.isRecentJob(job.ageText)) {
            jobs.push(job)
          }
        } catch (error) {
          console.warn(`Failed to parse Summer2026 row from ${source}:`, line, error)
        }
      }
    }

    return jobs
  }

  /**
   * Remove duplicate jobs based on company + title + location
   */
  private removeDuplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.company.toLowerCase()}-${job.title.toLowerCase()}-${job.location.toLowerCase()}`
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  /**
   * Parse a single row from Summer 2026 repository
   */
  private parseSummer2026Row(line: string): ScrapedJob | null {
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
    
    if (cells.length < 5) return null

    // Expected format: | Company | Role | Location | Application/Link | Date Posted |
    const [company, role, location, application, datePosted] = cells
    
    if (!company || !role || !location || !datePosted) return null

    // Extract company name and application URL
    const companyName = this.extractText(company)
    const positionTitle = this.extractText(role)
    const locationText = this.extractText(location)
    const applicationUrl = this.extractUrl(application)
    const ageText = this.extractText(datePosted)
    
    if (!applicationUrl || !companyName || !positionTitle) return null

    return {
      title: positionTitle,
      company: companyName,
      location: locationText,
      applicationUrl,
      ageText,
      postedDate: this.parseAgeToDate(ageText)
    }
  }

  /**
   * Scrape jobs from 2025 SWE College Jobs repository
   */
  private async scrapeSWE2025(): Promise<ScrapedJob[]> {
    const response = await axios.get(this.SOURCES.SWE2025.rawUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    const content = response.data
    const jobs: ScrapedJob[] = []

    // Parse markdown table
    const lines = content.split('\n')
    let foundOtherSection = false
    let inTable = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for "Other" section
      if (line === '### Other' || line === '## Other') {
        foundOtherSection = true
        continue
      }
      
      // Only start looking for table after finding "Other" section
      if (!foundOtherSection) {
        continue
      }
      
      // Detect table header
      if (line.startsWith('| Company') && line.includes('| Position |')) {
        inTable = true
        continue
      }
      
      // Skip separator line
      if (line.startsWith('|---') || line.startsWith('|-')) {
        continue
      }
      
      // End of table (next section or end of content)
      if (inTable && (!line.startsWith('|') || line.length < 10 || line.startsWith('#'))) {
        break
      }
      
      // Parse table row
      if (inTable && line.startsWith('|')) {
        try {
          const job = this.parseSWE2025Row(line)
          if (job && this.isRecentJob(job.ageText)) {
            jobs.push(job)
          }
        } catch (error) {
          console.warn('Failed to parse SWE2025 row:', line, error)
        }
      }
    }

    return jobs
  }

  /**
   * Parse a single row from 2025 SWE College Jobs repository
   */
  private parseSWE2025Row(line: string): ScrapedJob | null {
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
    
    if (cells.length < 5) return null

    // Expected format: | Company | Position | Location | Posting | Age |
    const [company, position, location, posting, age] = cells
    
    if (!company || !position || !location || !age) return null

    // Extract text and URLs
    const companyName = this.extractText(company)
    const positionTitle = this.extractText(position)
    const locationText = this.extractText(location)
    const applicationUrl = this.extractUrl(posting) || this.extractUrl(company) // Try company cell if posting doesn't have URL
    const ageText = this.extractText(age)
    
    if (!applicationUrl || !companyName || !positionTitle) return null

    return {
      title: positionTitle,
      company: companyName,
      location: locationText,
      applicationUrl,
      ageText,
      postedDate: this.parseAgeToDate(ageText)
    }
  }

  /**
   * Check if a job is recent (within last 7 days to be more inclusive with multiple sources)
   */
  private isRecentJob(ageText: string): boolean {
    const age = this.parseAgeText(ageText)
    return age !== null && age <= 7 // Increased from 3 to 7 days for broader coverage
  }

  /**
   * Parse age text to number of days
   */
  private parseAgeText(ageText: string): number | null {
    // Clean the text first
    const cleanText = ageText.toLowerCase().trim()

    // Handle "Xd" format (e.g., "2d", "15d")
    const dayMatch = cleanText.match(/(\d+)d/)
    if (dayMatch) {
      return parseInt(dayMatch[1])
    }

    // Handle "X days ago" format
    const daysAgoMatch = cleanText.match(/(\d+)\s*days?\s*ago/)
    if (daysAgoMatch) {
      return parseInt(daysAgoMatch[1])
    }

    // Handle "X hours ago" format (convert to days)
    const hoursAgoMatch = cleanText.match(/(\d+)\s*hours?\s*ago/)
    if (hoursAgoMatch) {
      const hours = parseInt(hoursAgoMatch[1])
      return Math.ceil(hours / 24) // Round up to next day
    }

    // Handle date format like "Jul 01", "Jul 02", "Dec 25", etc.
    const dateMatch = cleanText.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*(\d{1,2})/i)
    if (dateMatch) {
      const month = dateMatch[1]
      const day = parseInt(dateMatch[2])
      
      // Calculate days ago from current date
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const monthNumber = this.getMonthNumber(month)
      const jobDate = new Date(currentYear, monthNumber - 1, day)
      
      // If job date is in the future, it's from previous year
      if (jobDate > currentDate) {
        jobDate.setFullYear(currentYear - 1)
      }
      
      const daysDiff = Math.floor((currentDate.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 ? daysDiff : null
    }

    // Handle "today", "yesterday" text
    if (cleanText.includes('today') || cleanText.includes('just now')) {
      return 0
    }
    if (cleanText.includes('yesterday')) {
      return 1
    }

    // Handle ISO date format (YYYY-MM-DD)
    const isoDateMatch = cleanText.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (isoDateMatch) {
      const jobDate = new Date(cleanText)
      const currentDate = new Date()
      const daysDiff = Math.floor((currentDate.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 ? daysDiff : null
    }

    return null
  }

  /**
   * Convert age text to actual date
   */
  private parseAgeToDate(ageText: string): Date {
    const daysAgo = this.parseAgeText(ageText) || 0
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date
  }

  /**
   * Get month number from month name
   */
  private getMonthNumber(monthName: string): number {
    const months: { [key: string]: number } = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    return months[monthName.toLowerCase()] || 1
  }

  /**
   * Save jobs to database with deduplication
   */
  private async saveJobs(jobs: ScrapedJob[], source: 'summer2026-internships' | '2025-swe-college-jobs' | '2026-ai-college-jobs' | '2025-data-analysis-internship' | '2025-product-management-internship', sourceUrl: string): Promise<number> {
    let newJobsCount = 0

    for (const jobData of jobs) {
      try {
        const uniqueKey = `${jobData.company.toLowerCase()}-${jobData.title.toLowerCase()}-${jobData.location.toLowerCase()}`
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

        // Check if job already exists
        const existingJob = await Job.findOne({ uniqueKey })
        
        if (!existingJob) {
          const newJob = new Job({
            ...jobData,
            source,
            sourceUrl,
            uniqueKey
          })
          
          await newJob.save()
          newJobsCount++
        } else {
          // Update scraping timestamp
          existingJob.scrapedAt = new Date()
          await existingJob.save()
        }
      } catch (error: any) {
        console.error(`Failed to save job: ${jobData.company} - ${jobData.title}`, error.message)
      }
    }

    return newJobsCount
  }

  /**
   * Get jobs from last N days that haven't been marked as completed
   */
  async getRecentJobs(days: number = 3): Promise<IJob[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return await Job.find({
      postedDate: { $gte: cutoffDate },
      isActive: true,
      status: { $ne: 'rejected' }
    }).sort({ postedDate: -1, scrapedAt: -1 })
  }

  /**
   * Scrape jobs from 2026 AI College Jobs repository (Other section)
   */
  private async scrapeAI2026(): Promise<ScrapedJob[]> {
    const response = await axios.get(this.SOURCES.AI2026.rawUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    })

    const content = response.data
    const jobs: ScrapedJob[] = []

    // Parse markdown table - look for "Other" section
    const lines = content.split('\n')
    let inTable = false
    let foundOtherSection = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for "Other" section
      if (line === '### Other' || line === '## Other') {
        foundOtherSection = true
        continue
      }
      
      // Only start looking for table after finding "Other" section
      if (!foundOtherSection) {
        continue
      }
      
      // Detect table header - AI2026 format
      if (line.startsWith('| Company') && line.includes('| Position |') && line.includes('| Age |')) {
        inTable = true
        continue
      }
      
      // Skip separator line
      if (line.startsWith('|---') || line.startsWith('|-')) {
        continue
      }
      
      // End of table (next section or end of content)
      if (inTable && (!line.startsWith('|') || line.length < 10 || line.startsWith('#'))) {
        break
      }
      
      // Parse table row
      if (inTable && line.startsWith('|')) {
        try {
          const job = this.parseAI2026Row(line)
          if (job && this.isRecentJob(job.ageText)) {
            jobs.push(job)
          }
        } catch (error) {
          console.warn('Failed to parse AI2026 row:', line, error)
        }
      }
    }

    return jobs
  }

  /**
   * Parse a single row from AI2026 repository (Other section)
   */
  private parseAI2026Row(line: string): ScrapedJob | null {
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
    
    if (cells.length < 5) return null

    // Expected format: | Company | Position | Location | Posting | Age |
    const [company, position, location, posting, age] = cells
    
    if (!company || !position || !location || !age) return null

    // Extract text and URLs
    const companyName = this.extractText(company)
    const positionTitle = this.extractText(position)
    const locationText = this.extractText(location)
    const applicationUrl = this.extractUrl(posting) || this.extractUrl(company) // Try posting first, then company
    const ageText = this.extractText(age)
    
    if (!applicationUrl || !companyName || !positionTitle) return null

    return {
      title: positionTitle,
      company: companyName,
      location: locationText,
      applicationUrl,
      ageText,
      postedDate: this.parseAgeToDate(ageText)
    }
  }

  /**
   * Scrape jobs from JobrightAI repositories (Data Analysis, Product Management)
   */
  private async scrapeJobrightAI(source: 'DATA2025' | 'PRODUCT2025'): Promise<ScrapedJob[]> {
    const sourceConfig = this.SOURCES[source]
    console.log(`\n🔍 Scraping ${sourceConfig.name}...`)

    try {
      const content = await this.fetchGitHubReadme(sourceConfig.rawUrl)
      
      // Find the "Daily Job List" section
      const dailyJobListStart = content.indexOf('## Daily Job List')
      if (dailyJobListStart === -1) {
        console.log('❌ Could not find "Daily Job List" section')
        return []
      }

      // Find the table start
      const tableStart = content.indexOf('| Company |', dailyJobListStart)
      if (tableStart === -1) {
        console.log('❌ Could not find table header')
        return []
      }

      // Extract table content until next section or end
      const tableEnd = content.indexOf('\n## ', tableStart + 1)
      const tableContent = tableEnd === -1 ? 
        content.substring(tableStart) : 
        content.substring(tableStart, tableEnd)

      const lines = tableContent.split('\n')
      const jobs: ScrapedJob[] = []

      for (const line of lines) {
        if (line.includes('|') && !line.includes('Company') && !line.includes('-----')) {
          const job = this.parseJobrightAIRow(line)
          if (job) {
            jobs.push(job)
          }
        }
      }

      console.log(`✅ Found ${jobs.length} jobs`)
      return jobs

    } catch (error) {
      console.error(`❌ Error scraping ${sourceConfig.name}:`, error)
      return []
    }
  }

  /**
   * Parse a single row from JobrightAI repository (Daily Job List)
   */
  private parseJobrightAIRow(line: string): ScrapedJob | null {
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0)
    
    if (cells.length < 5) return null

    // Expected format: | Company | Job Title | Location | Work Model | Date Posted |
    const [company, jobTitle, location, workModel, datePosted] = cells
    
    if (!company || !jobTitle || !location || !datePosted) return null

    // Extract text and URLs - prioritize job title URL as it contains the application link
    const companyName = this.extractText(company)
    const positionTitle = this.extractText(jobTitle)
    const locationText = this.extractText(location)
    const applicationUrl = this.extractUrl(jobTitle) || this.extractUrl(company) // Try job title first, then company
    const ageText = this.extractText(datePosted)
    
    if (!applicationUrl || !companyName || !positionTitle) return null

    return {
      title: positionTitle,
      company: companyName,
      location: locationText,
      applicationUrl,
      ageText,
      postedDate: this.parseAgeToDate(ageText)
    }
  }

  /**
   * Fetch GitHub README content
   */
  private async fetchGitHubReadme(url: string): Promise<string> {
    try {
      console.log(`🌐 Fetching URL: ${url}`)
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProductivityDashboard/1.0; +http://localhost:3000)',
          'Accept': 'text/plain, text/html, */*'
        },
        timeout: 30000
      })
      console.log(`✅ Successfully fetched ${url} (status: ${response.status})`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ Failed to fetch ${url}:`)
        console.error(`   Status: ${error.response?.status}`)
        console.error(`   Status Text: ${error.response?.statusText}`)
        console.error(`   Headers: ${JSON.stringify(error.response?.headers)}`)
        console.error(`   URL: ${error.config?.url}`)
      } else {
        console.error(`❌ Failed to fetch ${url}:`, error)
      }
      throw error
    }
  }
}

export default new JobScraper() 