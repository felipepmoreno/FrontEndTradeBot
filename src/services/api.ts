import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will use the proxy configured in vite.config.ts
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API Health Check
export const checkApiHealth = async () => {
  const response = await axios.get('/health') // Using direct endpoint
  return response.data
}

export default api
