# K6 Performance Test Framework

A scalable, configuration-driven k6 performance testing framework supporting 100+ endpoints with configurable parallel and sequential execution strategies, zero code duplication, and configurable load and stress testing.

## Key Features

- **Zero Code Duplication** - One executor for all endpoints
- **Token Caching** - 99% fewer login calls
- **Load & Stress Tests** - Separate configurations
- **Dynamic Configuration** - Switch via config file or environment variables
- **Parallel/Sequential/Mixed** - Flexible execution strategies
- **Easy to Scale** - Add 100+ endpoints without coding

## Requirements

- Support 100+ endpoints
- Configurable parallel and sequential execution
- Reduce code duplication
- Simplify adding new endpoints
- Support for Load Test and Stress Test with stages

## Quick Start

### Run Load Test (Normal Load)
```bash
k6 run -e TEST_TYPE=load ./src/endpointTest.js
```
- **Purpose**: Test system under normal expected load
- **Stages**: 30s → 1m → 2m → 30s (max 20 users)
- **Thresholds**: Strict (95% < 1000ms, <10% errors)

### Run Stress Test (Find Breaking Point)
```bash
k6 run -e TEST_TYPE=stress ./src/endpointTest.js
```
- **Purpose**: Find the breaking point
- **Stages**: 1m → 2m → 3m → 2m → 1m (max 150 users)
- **Thresholds**: More lenient (95% < 2000ms, <20% errors)

### Use Config File (No Environment Variables)
```bash
k6 run ./src/endpointTest.js
```
- **Configure**: Set `testType: 'load'` or `'stress'` in config.js
- **Priority**: Environment variable → config.js → default ('load')

### Advanced Usage
```bash
# Load test with custom execution group
k6 run -e TEST_TYPE=load -e EXECUTION_GROUP=userOperations ./src/endpointTest.js

# Custom duration and VUs
k6 run -e TEST_TYPE=stress ./src/endpointTest.js --duration 30s --vus 10

# Combined options with output
k6 run -e TEST_TYPE=stress -e EXECUTION_GROUP=fullWorkflow --out csv=stress-results.csv ./src/endpointTest.js

# Run with more lenient thresholds (stress mode has 20% error threshold instead of 10%)
k6 run -e TEST_TYPE=stress -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js

# Export summary for detailed analysis
k6 run -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js --summary-export=summary.json
```

## Architecture

```
perf-k6-assessment/
├── config.js                      # Main configuration file
├── auth.js                        # Authentication logic
├── readme.md                      # This documentation
└── src/
    ├── endpointTest.js           # Main test file (supports load & stress)
    ├── authManager.js            # Authentication with token caching
    ├── executor.js               # HTTP request execution engine
    ├── endpoints.config.js       # Endpoint definitions
    └── endpoints.config.example.js # Example with 120+ endpoints
```

## Test Types and Configuration

### Load Test
- **Purpose**: Verify system performance under normal expected load
- **Stages**: Gradual ramp-up (10 → 20 users)
- **Thresholds**: Strict (95% < 1000ms, <10% errors)
- **Run**: `k6 run -e TEST_TYPE=load ./src/endpointTest.js`

### Stress Test
- **Purpose**: Find the breaking point of the system
- **Stages**: Aggressive ramp-up (20 → 150 users)
- **Thresholds**: More lenient (95% < 2000ms, <20% errors)
- **Run**: `k6 run -e TEST_TYPE=stress ./src/endpointTest.js`

### Configuration Options
- **Environment Variables**: 
  - `TEST_TYPE`: Set to 'load' or 'stress'
  - `EXECUTION_GROUP`: Override execution group (e.g., 'courseWorkflow', 'userOperations')
- **Priority**: ENV variable → config.js → default ('load')
- **Example**: `k6 run -e TEST_TYPE=stress -e EXECUTION_GROUP=userOperations ./src/endpointTest.js`

## Configuration

### Switching Test Types

In config.js:
```javascript
"testType": "load"  // Change to "stress" for stress testing
```

Via environment variable (overrides config.js):
```bash
k6 run -e TEST_TYPE=stress ./src/endpointTest.js
```

### Switching Execution Groups

In config.js:
```javascript
"executionGroup": "courseWorkflow"  // or "userOperations", "fullWorkflow"
```

Via environment variable:
```bash
k6 run -e EXECUTION_GROUP=userOperations ./src/endpointTest.js
```

### Available Execution Groups

The framework includes these pre-configured groups in [src/endpoints.config.example.js](src/endpoints.config.example.js):

| Group Name | Strategy | Endpoints | Use Case |
|------------|----------|-----------|----------|
| `fullPlatformTest` | Mixed | 10 endpoints (3 sequential groups + 1 parallel) | Complex workflow testing |
| `allCourseEndpoints` | Parallel | 10 course-related endpoints | Fast course API testing |
| `userWorkflow` | Sequential | 5 user-related endpoints | User journey testing |
| `loadTest` | Parallel | 9 independent endpoints | High-throughput load testing |

**Run specific group:**
```bash
# Mixed strategy (sequential + parallel)
k6 run -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js

# All parallel
k6 run -e EXECUTION_GROUP=allCourseEndpoints ./src/endpointTest.js

# All sequential
k6 run -e EXECUTION_GROUP=userWorkflow ./src/endpointTest.js
```

### Customizing Load Test Stages

In config.js:
```javascript
"loadTest": {
  "stages": [
    { "duration": "1m", "target": 50 },    // Ramp up to 50 users
    { "duration": "3m", "target": 50 },    // Stay at 50 users
    { "duration": "1m", "target": 0 }      // Ramp down to 0
  ]
}
```

Default stages:
```javascript
"loadTest": {
  "stages": [
    { "duration": "30s", "target": 10 },   // Ramp up to 10 users
    { "duration": "1m", "target": 20 },    // Ramp up to 20 users
    { "duration": "2m", "target": 20 },    // Stay at 20 users
    { "duration": "30s", "target": 0 }     // Ramp down to 0
  ]
}
```

### Customizing Stress Test Stages

In config.js:
```javascript
"stressTest": {
  "stages": [
    { "duration": "2m", "target": 100 },   // Ramp up to 100 users
    { "duration": "5m", "target": 200 },   // Push to 200 users
    { "duration": "2m", "target": 0 }      // Ramp down to 0
  ]
}
```

Default stages:
```javascript
"stressTest": {
  "stages": [
    { "duration": "1m", "target": 20 },    // Ramp up to 20 users
    { "duration": "2m", "target": 50 },    // Ramp up to 50 users
    { "duration": "3m", "target": 100 },   // Ramp up to 100 users
    { "duration": "2m", "target": 150 },   // Push to 150 users
    { "duration": "1m", "target": 0 }      // Ramp down to 0
  ]
}
```

## Output Options

### JSON Output
```bash
k6 run --out json=results.json ./src/endpointTest.js
```

### CSV Output
```bash
k6 run --out csv=results.csv ./src/endpointTest.js
```

### Multiple Outputs
```bash
k6 run --out json=results.json --out csv=results.csv -e TEST_TYPE=load ./src/endpointTest.js
```

### Cloud Output
```bash
k6 run --out cloud ./src/endpointTest.js
```

### InfluxDB Output
```bash
k6 run --out influxdb=http://localhost:8086/k6 ./src/endpointTest.js
```

## Command Line Options

```bash
# Custom duration and VUs
k6 run -e TEST_TYPE=load ./src/endpointTest.js --duration 30s --vus 10

# Override execution group (use mixed strategy)
k6 run -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js

# Override execution group (use sequential strategy)
k6 run -e EXECUTION_GROUP=userWorkflow ./src/endpointTest.js

# Override execution group (use parallel strategy)
k6 run -e EXECUTION_GROUP=loadTest ./src/endpointTest.js

# Export results to CSV
k6 run --out csv=results.csv ./src/endpointTest.js

# Export results to JSON
k6 run --out json=results.json ./src/endpointTest.js

# Run with custom log level
k6 run --log-output=stdout --log-format=json ./src/endpointTest.js

# Short duration test
k6 run -e TEST_TYPE=load ./src/endpointTest.js --duration 30s --vus 5
```

## How to Add New Endpoints

### Step 1: Define the endpoint in src/endpoints.config.js

```javascript
export const endpoints = [
    // ... existing endpoints
    {
        name: "myNewEndpoint",
        method: "GET",
        path: "/api/my-endpoint/${userId}",
        requiresAuth: true,
        tags: { endpoint: "myNewEndpoint" }
    },
    {
        name: "createResource",
        method: "POST",
        path: "/api/resources",
        requiresAuth: true,
        body: {
            title: "New Resource",
            user_id: "${userId}"
        },
        tags: { endpoint: "createResource" }
    }
];
```

### Step 2: (Optional) Add to an execution group

```javascript
export const executionGroups = {
    // ... existing groups
    myWorkflow: {
        strategy: "sequential",
        endpoints: ["myNewEndpoint", "createResource"]
    }
};
```

### Step 3: Done!

No code changes needed. The framework automatically handles the new endpoints.

## Execution Strategies

The framework supports three execution strategies to fit different testing scenarios:

### Sequential (Order Matters)
Endpoints are executed one after another. Use when order matters or endpoints have dependencies.

```javascript
courseWorkflow: {
    strategy: "sequential",
    endpoints: ["listAllCourses", "getCourse", "enrollCourse"]
}
```

**Use Case**: Login flows, multi-step workflows, dependent API calls

### Parallel (Maximum Speed)
All endpoints are executed concurrently using k6's batch functionality. Faster but no ordering guarantees.

```javascript
userOperations: {
    strategy: "parallel",
    endpoints: ["getUserProfile", "getCourseProgress", "updateUserProfile"]
}
```

**Use Case**: Independent operations, read-only endpoints, maximum throughput testing

### Mixed (Best of Both)
Combine sequential and parallel strategies. Groups are executed in parallel, but endpoints within each group follow their strategy.

```javascript
fullWorkflow: {
    strategy: "mixed",
    groups: [
        { strategy: "sequential", endpoints: ["listAllCourses", "getCourse"] },
        { strategy: "parallel", endpoints: ["enrollCourse", "getUserProfile"] }
    ]
}
```

**Use Case**: Complex workflows with both sequential dependencies and parallel operations

## Validating Endpoint Execution

### Check Which Endpoints Ran

After running a test, k6 displays detailed check results showing which endpoints were executed:

```bash
k6 run -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js
```

The output shows each endpoint with its pass/fail status:

```
✓ listAllCourses: status is 2xx or 3xx
✓ getCourse: status is 2xx or 3xx
✓ enrollCourse: status is 2xx or 3xx
✗ getUserProfile: status is 2xx or 3xx
  ↳  0% — ✓ 0 / ✗ 234
```

### Understanding the Output

- **✓** = Endpoint executed successfully (2xx/3xx status)
- **✗** = Endpoint failed (4xx/5xx status or network error)
- **Number of checks** = Total iterations × endpoints in group
- **checks_total** = Total check count across all endpoints
- **checks_succeeded** = Percentage of successful checks

### Verify All Endpoints in a Group

To see which endpoints are configured in a group, check [src/endpoints.config.example.js](src/endpoints.config.example.js):

```javascript
fullPlatformTest: {
    strategy: "mixed",
    groups: [
        { strategy: "sequential", endpoints: ["listAllCourses", "getCourse", "enrollCourse"] },
        { strategy: "parallel", endpoints: ["getUserProfile", "getCourseProgress", "getAssignments"] },
        { strategy: "sequential", endpoints: ["getQuiz", "startQuiz", "completeQuiz", "getQuizResults"] }
    ]
}
```

### Using Summary to Track Execution

Add this to see detailed execution metrics:

```bash
k6 run -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js --summary-export=summary.json
```

This creates a `summary.json` file with detailed metrics for each endpoint.

## Example Test Output

```
All checks passed (24/24)
0% error rate
http_reqs: 4.5 requests/sec
Sequential execution working
Token caching reducing overhead
```

## Troubleshooting

### Environment Variables Not Working
Ensure you're using the `-e` flag correctly:
```bash
k6 run -e TEST_TYPE=load ./src/endpointTest.js
```

### Authentication Errors
Check your credentials in config.js and verify the auth endpoint is correct.

### High Error Rates (Threshold Crossed)

If you see `ERRO[0062] thresholds on metrics 'http_req_failed' have been crossed`:

**Causes:**
- API endpoints returning 4xx/5xx errors
- Invalid authentication tokens
- Incorrect endpoint paths or parameters
- Server under too much load
- Rate limiting by the API

**Solutions:**
1. **Check failed endpoints** - Look at the test output to see which endpoints failed
2. **Verify endpoints exist** - Test endpoints manually with curl or Postman
3. **Adjust thresholds temporarily** - Edit thresholds in config or use stress test mode:
   ```bash
   k6 run -e TEST_TYPE=stress ./src/endpointTest.js  # More lenient: 20% error threshold
   ```
4. **Reduce load** - Lower VUs or duration:
   ```bash
   k6 run -e EXECUTION_GROUP=fullPlatformTest ./src/endpointTest.js --vus 2 --duration 30s
   ```
5. **Fix endpoint configs** - Update paths in [src/endpoints.config.example.js](src/endpoints.config.example.js)
6. **Use existing working endpoints** - Switch to a group with verified endpoints:
   ```bash
   k6 run -e EXECUTION_GROUP=courseWorkflow ./src/endpointTest.js
   ```

### Token Caching Issues
Token is cached per VU. If seeing auth errors, check token expiration settings.

## Best Practices

1. **Start Small**: Begin with low VUs and short duration, then gradually increase
2. **Monitor Thresholds**: Adjust thresholds based on your application's SLAs
3. **Use Appropriate Strategy**: Sequential for workflows, parallel for independent calls
4. **Keep Groups Focused**: Don't mix unrelated endpoints in execution groups
5. **Clean Outputs**: Use output options to save results for analysis
6. **Regular Testing**: Run load tests regularly to catch performance regressions early



