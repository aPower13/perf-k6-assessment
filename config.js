export default {
  "baseURL": "https://api.polanji.com",
  "credentials": {
    "username": "performancetest09@gmail.com",
    "password": "user123456"
  },
  "courseId": 19,
  "userId": 13,
  
  // Test type to run: 'load' or 'stress'
  "testType": "load",
  
  // Execution group to use (see src/endpoints.config.js)
  "executionGroup": "courseWorkflow",
  
  // Think time between requests in seconds (simulates user reading/thinking)
  // Can be overridden with THINK_TIME environment variable
  // Set to 0 for no delay, or use decimals (e.g., 0.5 for 500ms)
  "thinkTime": 1,
  
  // Additional variables for endpoint interpolation
  "variables": {},
  
  // Load Test Configuration: Gradual ramp-up to test normal load
  "loadTest": {
    "stages": [
      { "duration": "30s", "target": 10 },   // Ramp up to 10 users
      { "duration": "1m", "target": 20 },    // Ramp up to 20 users
      { "duration": "2m", "target": 20 },    // Stay at 20 users
      { "duration": "30s", "target": 0 }     // Ramp down to 0
    ]
  },
  
  // Stress Test Configuration: Aggressive ramp-up to find breaking point
  "stressTest": {
    "stages": [
      { "duration": "1m", "target": 20 },    // Ramp up to 20 users
      { "duration": "2m", "target": 50 },    // Ramp up to 50 users
      { "duration": "3m", "target": 100 },   // Ramp up to 100 users
      { "duration": "2m", "target": 150 },   // Push to 150 users
      { "duration": "1m", "target": 0 }      // Ramp down to 0
    ]
  }
};