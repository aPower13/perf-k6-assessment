import config from '../config.js';
import { AuthManager } from './authManager.js';
import { EndpointExecutor } from './executor.js';
import { executionGroups } from './endpoints.config.js';


// Dynamically select test configuration based on environment variable or config
const testType = __ENV.TEST_TYPE || config.testType || 'load';
const testConfig = testType === 'stress' ? config.stressTest : config.loadTest;

console.log(`Running ${testType.toUpperCase()} test configuration`);

// Dynamic thresholds based on test type
const thresholds = testType === 'stress' 
    ? {
        http_req_duration: ['p(95)<2000'],  // More lenient for stress test
        http_req_failed: ['rate<0.2'],      // Allow up to 20% errors in stress test
    }
    : {
        http_req_duration: ['p(95)<1000'],  // Reasonable for load test
        http_req_failed: ['rate<0.1'],      // Less than 10% errors for load test
    };

export const options = {
    stages: testConfig.stages,
    thresholds: thresholds
};

// Initialize managers (created once per VU)
const authManager = new AuthManager(config);
const executor = new EndpointExecutor(config, authManager);

/**
 * Main test function - executed for each iteration
 */
export default function () {
    const groupName = __ENV.EXECUTION_GROUP || config.executionGroup || 'courseWorkflow';
    const group = executionGroups[groupName];
    
    if (!group) {
        console.error(`Execution group '${groupName}' not found`);
        return;
    }
    
    executor.executeGroup(group);
}