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