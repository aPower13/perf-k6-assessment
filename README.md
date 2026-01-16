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
k6 run -e TEST_TYPE=stress -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js

# Export summary for detailed analysis
k6 run -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js --summary-export=summary.json
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

### Configuring Think Time

Think time simulates realistic user behavior by adding delays between requests (e.g., users reading content before clicking next action).

In config.js:
```javascript
"thinkTime": 1  // 1 second delay between requests (default)
```

Via environment variable (overrides config.js):
```bash
# 2 second think time
k6 run -e THINK_TIME=2 ./src/endpointTest.js

# 500ms think time
k6 run -e THINK_TIME=0.5 ./src/endpointTest.js

# No think time (fire requests immediately)
k6 run -e THINK_TIME=0 ./src/endpointTest.js
```

**Think Time Behavior:**
- **Sequential strategy**: Delay added between each request in the sequence
- **Parallel strategy**: Delay added after the entire batch completes
- **Default value**: 1 second (balances realism and test duration)
- **Recommended for load tests**: 1-3 seconds
- **Recommended for stress tests**: 0-0.5 seconds (maximize throughput)

**Example with combined options:**
```bash
# Load test with 2 second think time
k6 run -e TEST_TYPE=load -e THINK_TIME=2 -e EXECUTION_GROUP=courseWorkflow ./src/endpointTest.js
```

### Available Execution Groups

The framework includes these pre-configured groups in [src/endpoints.config.js](src/endpoints.config.js):

| Group Name | Strategy | Endpoints | Use Case |
|------------|----------|-----------|----------|
| `courseWorkflow` | Sequential | 3 course endpoints | Course enrollment workflow |
| `userOperations` | Parallel | 2 course endpoints | Fast parallel course queries |
| `fullWorkflow` | Mixed | 5 endpoints (sequential + parallel) | Complex mixed-strategy workflow |

**Run specific group:**
```bash
# Sequential strategy
k6 run -e EXECUTION_GROUP=courseWorkflow ./src/endpointTest.js

# Parallel strategy
k6 run -e EXECUTION_GROUP=userOperations ./src/endpointTest.js

# Mixed strategy (sequential + parallel)
k6 run -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js
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

### Customizing Thresholds

Thresholds are defined in [src/endpointTest.js](src/endpointTest.js) and determine when a test passes or fails.

**Current thresholds for load test:**
```javascript
http_req_duration: ['p(95)<1000'],  // 95% of requests < 1 second
http_req_failed: ['rate<0.1'],      // Less than 10% failures
```

**Current thresholds for stress test:**
```javascript
http_req_duration: ['p(95)<2000'],  // 95% of requests < 2 seconds
http_req_failed: ['rate<0.2'],      // Less than 20% failures
```

**To customize thresholds:**

Edit lines 14-22 in [src/endpointTest.js](src/endpointTest.js):

```javascript
const thresholds = testType === 'stress' 
    ? {
        http_req_duration: ['p(95)<2000'],  // Adjust this value (milliseconds)
        http_req_failed: ['rate<0.2'],      // Adjust this value (0.2 = 20%)
    }
    : {
        http_req_duration: ['p(95)<1000'],  // Adjust this value (milliseconds)
        http_req_failed: ['rate<0.1'],      // Adjust this value (0.1 = 10%)
    };
```

**Example customizations:**
- Stricter load test: `p(95)<500` and `rate<0.05` (5% errors)
- More lenient stress test: `p(95)<3000` and `rate<0.3` (30% errors)
- Different percentiles: `p(99)<2000` (99th percentile instead of 95th)

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

# Override execution group (use sequential strategy)
k6 run -e EXECUTION_GROUP=courseWorkflow ./src/endpointTest.js

# Override execution group (use parallel strategy)
k6 run -e EXECUTION_GROUP=userOperations ./src/endpointTest.js

# Override execution group (use mixed strategy)
k6 run -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js

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

#### Basic Endpoint Definition

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

#### Advanced Endpoint Definition

Endpoints can include additional fields for more control over execution, validation, and behavior:

```javascript
{
  name: 'enrollCourse',
  method: 'POST',
  path: '/enroll',
  requiresAuth: true,
  execution: 'sequential',
  group: 'enrollment',
  order: 1, // Execution order in sequential group
  weight: 20, // Execution probability weight (higher = more frequent)
  params: {
    body: {
      course_id: '${courseId}',
      user_id: '${userId}'
    }
  },
  validation: {
    status: 200, // Expected HTTP status code
    responseTime: 1000, // Maximum acceptable response time (ms)
    assertions: [
      { path: 'enrolled', type: 'equals', value: true },
      { path: 'status', type: 'equals', value: 'active' }
    ]
  }
}
```

**Available Fields:**
- `name` (required): Unique endpoint identifier
- `method` (required): HTTP method (GET, POST, PUT, DELETE, etc.)
- `path` (required): API endpoint path with variable interpolation support
- `requiresAuth`: Whether authentication token is needed (default: true)
- `body`: Request body for POST/PUT requests
- `tags`: Custom tags for k6 metrics grouping
- `execution`: Execution strategy hint ('sequential', 'parallel', 'mixed')
- `group`: Logical grouping for related endpoints
- `order`: Execution order within sequential groups (lower runs first)
- `weight`: Execution frequency weight for load distribution
- `validation`: Response validation rules
  - `status`: Expected HTTP status code
  - `responseTime`: Maximum acceptable response time in milliseconds
  - `assertions`: Array of validation rules for response body
    - `path`: JSONPath to the field to validate
    - `type`: Validation type ('equals', 'contains', 'greaterThan', etc.)
    - `value`: Expected value for comparison
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
k6 run -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js
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

To see which endpoints are configured in a group, check [src/endpoints.config.js](src/endpoints.config.js):

```javascript
fullWorkflow: {
    strategy: "mixed",
    groups: [
        { strategy: "sequential", endpoints: ["listAllCourses", "getCourse", "enrollCourse"] },
        { strategy: "parallel", endpoints: ["listAllCourses", "getCourse"] }
    ]
}
```

**Note**: See [src/endpoints.config.example.js](src/endpoints.config.example.js) for additional examples with 120+ endpoints.

### Using Summary to Track Execution

Add this to see detailed execution metrics:

```bash
k6 run -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js --summary-export=summary.json
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
   k6 run -e EXECUTION_GROUP=fullWorkflow ./src/endpointTest.js --vus 2 --duration 30s
   ```
5. **Fix endpoint configs** - Update paths in [src/endpoints.config.js](src/endpoints.config.js)
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

## Future Enhancements

### Data-Driven Testing

Enhance the framework with external data sources to test with realistic, varied data sets instead of hardcoded values.

**Implementation Example:**

Create a data file `testdata/users.csv`:
```csv
userId,courseId,topicId
13,19,1
14,20,2
15,21,3
16,22,1
```

Update `src/endpointTest.js` to use SharedArray for efficient data sharing:

```javascript
import { SharedArray } from 'k6/data';

// Load test data (shared across all VUs for memory efficiency)
const testData = new SharedArray('testData', function() {
  return JSON.parse(open('./testdata/users.csv'));
});

export default function() {
  // Get unique data per VU/iteration
  const data = testData[__VU % testData.length];
  
  // Override config with data from CSV
  config.userId = data.userId;
  config.courseId = data.courseId;
  config.variables.topicId = data.topicId;
  
  // Execute with dynamic data
  executor.executeGroup(selectedGroup);
}
```

**Benefits:**
- Test with realistic production-like data
- Uncover edge cases and data-dependent bugs
- Validate pagination, filtering, and search with varied inputs
- Simulate different user types and behaviors
- Easy to update test data without code changes

**Advanced Data-Driven Patterns:**

```javascript
// 1. Random data selection
const randomData = testData[Math.floor(Math.random() * testData.length)];

// 2. Sequential data access
const sequentialData = testData[__ITER % testData.length];

// 3. Weighted data distribution (80% type A, 20% type B)
const dataIndex = Math.random() < 0.8 ? 0 : 1;

// 4. JSON data from external API
const testData = new SharedArray('users', function() {
  const response = http.get('https://api.example.com/test-users');
  return JSON.parse(response.body);
});

// 5. CSV parsing with papaparse
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
const csvData = new SharedArray('csvData', function() {
  return papaparse.parse(open('./testdata/users.csv'), { header: true }).data;
});
```

### Distributed Load Testing with k6 Operator

For large-scale load testing that exceeds single-machine capacity, deploy k6 in Kubernetes using the k6 Operator.

**Why k6 Operator:**
- **Scale Beyond Single Machine**: Distribute load across multiple pods
- **High Load Generation**: Simulate thousands of concurrent users
- **Cloud Native**: Run tests in the same environment as your application
- **Cost Efficient**: Use cluster resources, auto-scale test runners
- **CI/CD Integration**: Automated performance testing in pipelines

**Installation:**

```bash
# Install k6 operator in your Kubernetes cluster
kubectl create namespace k6-operator-system
kubectl apply -f https://github.com/grafana/k6-operator/releases/latest/download/bundle.yaml
```

**Create k6 Test Resource:**

Save as `k6-test.yaml`:

```yaml
apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: perf-k6-assessment-distributed
  namespace: default
spec:
  parallelism: 5  # Run 5 k6 pods in parallel
  script:
    configMap:
      name: k6-test-script
      file: endpointTest.js
  arguments: -e TEST_TYPE=stress -e EXECUTION_GROUP=fullWorkflow
  separate: false
  runner:
    image: grafana/k6:latest
    resources:
      limits:
        cpu: 1000m
        memory: 512Mi
      requests:
        cpu: 500m
        memory: 256Mi
    env:
      - name: THINK_TIME
        value: "1"
      - name: TEST_TYPE
        value: "stress"
```

**Create ConfigMap with your test scripts:**

```bash
# Create configmap from your test directory
kubectl create configmap k6-test-script \
  --from-file=src/ \
  --from-file=config.js \
  --from-file=auth.js \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Run Distributed Test:**

```bash
# Apply the test
kubectl apply -f k6-test.yaml

# Watch test progress
kubectl get testrun -w

# View test logs from all pods
kubectl logs -l k6_cr=perf-k6-assessment-distributed -f

# Get test results
kubectl describe testrun perf-k6-assessment-distributed
```

**Advanced k6 Operator Configuration:**

```yaml
apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: high-scale-test
spec:
  parallelism: 10  # 10 distributed pods
  script:
    configMap:
      name: k6-test-script
      file: endpointTest.js
  arguments: --vus 100 --duration 30m -e TEST_TYPE=stress
  
  # Starter and initializer for setup/teardown
  starter:
    image: curlimages/curl:latest
    command: ["sh", "-c"]
    args: ["echo 'Starting distributed test'"]
  
  # Clean up after test
  cleanup: "post"
  
  runner:
    image: grafana/k6:latest
    metadata:
      labels:
        test-type: performance
    affinity:
      # Spread pods across nodes for better distribution
      podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
              - key: k6_cr
                operator: In
                values:
                - high-scale-test
            topologyKey: kubernetes.io/hostname
```

**Benefits of Distributed Testing:**
- **10x-100x Load Capacity**: Single machine ~1K VUs → Distributed 10K-100K VUs
- **Geographical Distribution**: Deploy to multiple regions for geo-testing
- **Isolation**: Tests don't impact production infrastructure
- **Parallel Execution**: Multiple test scenarios simultaneously
- **Resource Management**: Kubernetes handles scaling, scheduling, recovery

**Monitoring Integration:**

```yaml
# Add Prometheus annotations for metrics scraping
spec:
  runner:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "6565"
```

**Example: 50K VUs Distributed Test:**

```yaml
spec:
  parallelism: 50  # 50 pods × 1K VUs each = 50K VUs
  arguments: --vus 1000 --duration 1h
```

This architecture enables enterprise-scale load testing while maintaining the same simple, configuration-driven approach.



