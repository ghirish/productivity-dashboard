import jobScraper from '../services/jobScraper'

console.log('📊 Checking SOURCES configuration:')

// Access the private SOURCES property via type assertion
const sources = (jobScraper as any).SOURCES

console.log('\n🔍 DATA2025:')
console.log('  Name:', sources.DATA2025.name)
console.log('  URL:', sources.DATA2025.url)
console.log('  Raw URL:', sources.DATA2025.rawUrl)

console.log('\n🔍 PRODUCT2025:')
console.log('  Name:', sources.PRODUCT2025.name)
console.log('  URL:', sources.PRODUCT2025.url)
console.log('  Raw URL:', sources.PRODUCT2025.rawUrl)

// Test the scrapeJobrightAI method directly
async function testScraping() {
  console.log('\n🧪 Testing scrapeJobrightAI methods:')
  
  try {
    console.log('\n📊 Testing DATA2025...')
    const data2025Jobs = await (jobScraper as any).scrapeJobrightAI('DATA2025')
    console.log(`✅ DATA2025: Found ${data2025Jobs.length} jobs`)
  } catch (error: any) {
    console.error(`❌ DATA2025 failed:`, error.message)
  }
  
  try {
    console.log('\n📊 Testing PRODUCT2025...')
    const product2025Jobs = await (jobScraper as any).scrapeJobrightAI('PRODUCT2025')
    console.log(`✅ PRODUCT2025: Found ${product2025Jobs.length} jobs`)
  } catch (error: any) {
    console.error(`❌ PRODUCT2025 failed:`, error.message)
  }
}

testScraping() 