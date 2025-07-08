import axios from 'axios'

async function testJobrightAI() {
  const urls = [
    'https://raw.githubusercontent.com/jobright-ai/2025-Data-Analysis-Internship/master/README.md',
    'https://raw.githubusercontent.com/jobright-ai/2025-Product-Management-Internship/master/README.md'
  ]

  for (const url of urls) {
    console.log(`\n🌐 Testing URL: ${url}`)
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProductivityDashboard/1.0; +http://localhost:3000)',
          'Accept': 'text/plain, text/html, */*'
        },
        timeout: 30000
      })
      
      console.log(`✅ Success! Status: ${response.status}`)
      console.log(`📄 Content length: ${response.data.length} characters`)
      console.log(`📄 First 200 characters:`)
      console.log(response.data.substring(0, 200))
      
      // Check for Daily Job List section
      const hasJobList = response.data.includes('Daily Job List')
      console.log(`📊 Contains "Daily Job List": ${hasJobList}`)
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ Failed with status: ${error.response?.status}`)
        console.error(`❌ Status text: ${error.response?.statusText}`)
        console.error(`❌ Request URL: ${error.config?.url}`)
        console.error(`❌ Response headers:`, error.response?.headers)
        if (error.response?.data) {
          console.error(`❌ Response data:`, error.response.data.substring(0, 500))
        }
      } else {
        console.error(`❌ Non-HTTP error:`, error)
      }
    }
  }
}

testJobrightAI() 