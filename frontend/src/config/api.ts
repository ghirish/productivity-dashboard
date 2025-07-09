// API configuration for different environments
export const getApiBaseUrl = (): string => {
  // In production with monorepo setup, use relative URLs
  if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_API_URL) {
    return '' // Relative URLs will use the same domain
  }
  
  // Use environment variable or fallback to localhost
  return process.env.REACT_APP_API_URL || 'http://127.0.0.1:3002'
}

export const API_BASE_URL = getApiBaseUrl() 