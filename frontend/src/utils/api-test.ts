// API test function
export const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/companies')
    const data = await response.json()
    console.log('✅ API Test Success:', data)
    return data
  } catch (error) {
    console.error('❌ API Test Failed:', error)
    throw error
  }
}

// Test backend connectivity  
export const testBackend = async () => {
  try {
    const response = await fetch('http://localhost:8000/')
    const data = await response.json()
    console.log('✅ Backend Test Success:', data)
    return data
  } catch (error) {
    console.error('❌ Backend Test Failed:', error)
    throw error
  }
}

// Run tests
testBackend()
testAPI()
