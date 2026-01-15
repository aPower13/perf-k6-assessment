# Architecture Overview

## System Design

This k6 performance testing framework follows a **modular, configuration-driven architecture** designed to eliminate code duplication and enable easy scaling to 100+ endpoints without writing additional code.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     endpointTest.js                         │
│                  (Test Orchestrator)                        │
│                                                             │
│  • Reads environment variables & config                     │
│  • Selects test type (load/stress)                          │
│  • Configures stages & thresholds                           │
│  • Invokes executor per iteration                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ uses
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    executor.js                              │
│               (EndpointExecutor Class)                      │
│                                                             │
│  • Builds endpoint map from config                          │
│  • Interpolates variables (${userId}, etc.)                 │
│  • Constructs URLs & headers                                │
│  • Executes HTTP requests (sequential/parallel/mixed)       │
│  • Performs response validation                             │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ uses
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  authManager.js                             │
│                (AuthManager Class)                          │
│                                                             │
│  • Handles authentication                                   │
│  • Caches tokens per VU (99% fewer login calls)             │
│  • Provides tokens to executor                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ calls
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      auth.js                                │
│                  (Login Function)                           │
│                                                             │
│  • Performs actual HTTP login request                       │
│  • Returns authentication token                             │
└─────────────────────────────────────────────────────────────┘

                Configuration Files
┌─────────────────────────────────────────────────────────────┐
│  config.js          │ endpoints.config.js                   │
│  ───────────────────┼─────────────────────────────────      │
│  • Base URL         │ • Endpoint definitions                │
│  • Credentials      │ • Execution groups                    │
│  • Test stages      │ • Strategies (seq/par/mixed)          │
│  • Thresholds       │                                       │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Test Orchestrator (`endpointTest.js`)

**Responsibility**: Entry point and test configuration

**Key Functions**:
- Reads `TEST_TYPE` and `EXECUTION_GROUP` environment variables
- Selects appropriate test configuration (load vs stress)
- Sets up k6 options (stages, thresholds)
- Initializes AuthManager and EndpointExecutor per VU
- Executes selected endpoint group on each iteration

**Design Pattern**: Factory Pattern for test configuration selection

```javascript
const testType = __ENV.TEST_TYPE || config.testType || 'load';
const testConfig = testType === 'stress' ? config.stressTest : config.loadTest;
```

### 2. Endpoint Executor (`executor.js`)

**Responsibility**: Core execution engine for HTTP requests

**Key Functions**:
- `_buildEndpointMap()`: Creates O(1) lookup map of endpoints
- `_interpolate()`: Replaces `${variable}` placeholders with actual values
- `_interpolateObject()`: Deep interpolation for request bodies
- `_buildUrl()`: Constructs complete URLs with interpolated paths
- `_buildHeaders()`: Adds authentication and content-type headers
- `execute()`: Executes single endpoint with validation
- `executeSequential()`: Runs endpoints one after another
- `executeParallel()`: Runs endpoints concurrently using k6's batch
- `executeGroup()`: Routes to appropriate execution strategy

**Design Patterns**:
- **Builder Pattern**: Incrementally constructs HTTP requests
- **Strategy Pattern**: Different execution strategies (sequential/parallel/mixed)
- **Template Method Pattern**: Consistent execution flow with customizable steps

### 3. Authentication Manager (`authManager.js`)

**Responsibility**: Token lifecycle management

**Key Functions**:
- `getToken()`: Returns cached token or fetches new one
- Token caching per VU to minimize auth overhead

**Design Pattern**: Lazy Initialization

**Performance Impact**: Reduces login API calls by ~99%

```javascript
// Without caching: 1000 iterations × 10 VUs = 10,000 login calls
// With caching: 10 VUs = 10 login calls (99.9% reduction)
```

### 4. Configuration Files

#### `config.js` - Runtime Configuration
- API base URL
- Authentication credentials
- Test data (userId, courseId)
- Load test stages and thresholds
- Stress test stages and thresholds
- Custom variables for interpolation

#### `endpoints.config.js` - Endpoint Definitions
```javascript
{
    name: "getCourse",              // Unique identifier
    method: "GET",                  // HTTP method
    path: "/courses/${courseId}",   // URL path with placeholders
    requiresAuth: true,             // Auth requirement flag
    body: { /* ... */ },           // Request body (optional)
    tags: { endpoint: "getCourse" } // Metrics tags
}
```

#### Execution Groups
Defines how endpoints are executed together:

```javascript
{
    strategy: "sequential",  // or "parallel" or "mixed"
    endpoints: ["ep1", "ep2", "ep3"]
}
```

## Data Flow

### 1. Initialization Phase (Per VU)

```
VU Starts
  ↓
Read config.js
  ↓
Create AuthManager instance
  ↓
Create EndpointExecutor instance
  ↓
Build endpoint map from endpoints.config.js
  ↓
Ready for iterations
```

### 2. Iteration Phase (Per Test Iteration)

```
default() function called
  ↓
Determine execution group (ENV var or config)
  ↓
executor.executeGroup(group)
  ↓
Check strategy:
  ├─ sequential → Execute endpoints one by one
  ├─ parallel   → Batch all endpoints, execute concurrently
  └─ mixed      → Process each sub-group recursively
  ↓
For each endpoint:
  ├─ Get endpoint config from map
  ├─ Build URL (interpolate variables)
  ├─ Build headers (add auth token if needed)
  ├─ Interpolate request body
  ├─ Execute HTTP request
  └─ Validate response (check status 2xx/3xx)
  ↓
Iteration complete
```

### 3. Variable Interpolation Flow

```
Endpoint definition: "/users/${userId}/courses/${courseId}"
  ↓
Context object: { userId: 13, courseId: 19 }
  ↓
_interpolate() replaces placeholders
  ↓
Result: "/users/13/courses/19"
  ↓
Append to baseURL: "https://api.example.com/users/13/courses/19"
```

## Execution Strategies

### Sequential Strategy

```
Request 1 → Wait → Response 1
                      ↓
            Request 2 → Wait → Response 2
                                  ↓
                        Request 3 → Wait → Response 3
```

**Use Cases**:
- Login → Get data → Process data
- Multi-step workflows with dependencies
- Order-sensitive operations

**Implementation**: Simple loop with synchronous execution

### Parallel Strategy

```
Request 1 ──┐
Request 2 ──┼→ k6.batch() → Wait → All Responses
Request 3 ──┘
```

**Use Cases**:
- Independent read operations
- Maximum throughput testing
- Concurrent user simulation

**Implementation**: k6's `http.batch()` for true parallelism

### Mixed Strategy

```
Group 1 (Sequential):
  Request A → Request B
        ↓
Group 2 (Parallel):
  Request C ──┐
  Request D ──┼→ Concurrent
  Request E ──┘
```

**Use Cases**:
- Complex workflows with both sequential and parallel operations
- Real-world user journeys (login sequential, then parallel reads)

**Implementation**: Recursive group processing

## Design Decisions

### 1. Configuration-Driven Architecture

**Decision**: Separate endpoint definitions from execution logic

**Rationale**:
- Adding 100+ endpoints requires only JSON-like config entries
- No code duplication
- Easy maintenance and updates
- Clear separation of concerns

**Trade-off**: Slightly more complex initial setup, but massive scalability gains

### 2. String Interpolation Pattern

**Decision**: Use `${variable}` pattern instead of JavaScript template literals

**Rationale**:
- Template literals would evaluate at file load time (causing errors)
- Custom interpolation evaluates at runtime with actual values
- More flexible - can interpolate in strings, objects, arrays
- Avoids scope and timing issues

### 3. Token Caching Strategy

**Decision**: Cache authentication tokens per VU

**Rationale**:
- Reduces load on auth endpoints by 99%
- More realistic user behavior (users don't re-authenticate every request)
- Improves test performance and accuracy

**Trade-off**: Doesn't test auth endpoint under load (acceptable for most scenarios)

### 4. Threshold Configuration by Test Type

**Decision**: Different thresholds for load vs stress tests

**Rationale**:
- Load tests should have strict thresholds (validate normal operation)
- Stress tests need lenient thresholds (expected to push beyond limits)
- Prevents false failures during intentional overload scenarios

```javascript
Load:   10% error rate threshold  (normal operation)
Stress: 20% error rate threshold  (finding breaking points)
```

### 5. Endpoint Map for O(1) Lookup

**Decision**: Build hashmap of endpoints at initialization

**Rationale**:
- O(1) lookup time regardless of endpoint count
- Scales efficiently to 100+ endpoints
- Minimal memory overhead

**Alternative Rejected**: Linear array search O(n) - poor performance at scale

## Extension Points

### Adding New Endpoints

1. Add to `endpoints` array in `endpoints.config.js`
2. Optionally add to execution group
3. No code changes required

### Adding New Execution Groups

1. Define group in `executionGroups` object
2. Specify strategy and endpoint list
3. Use via `EXECUTION_GROUP` environment variable

### Custom Variables

1. Add to `config.variables` object
2. Use in endpoint paths/bodies as `${variableName}`
3. Automatic interpolation at runtime

### New Test Types

1. Add stage configuration to `config.js`
2. Add threshold configuration
3. Update test type selection logic in `endpointTest.js`

## Performance Characteristics

### Memory Usage
- **Per VU**: ~1MB (AuthManager + EndpointExecutor instances)
- **Endpoint Map**: O(n) where n = number of endpoints (~10KB for 100 endpoints)
- **Scalability**: Linear with VU count, constant per endpoint count

### CPU Usage
- **Interpolation**: O(m) where m = number of placeholders in string
- **Sequential Execution**: Single-threaded per VU
- **Parallel Execution**: Leverages k6's Go runtime for concurrency

### Network Efficiency
- **Token Caching**: 99% reduction in auth traffic
- **Parallel Strategy**: Maximum network utilization
- **Connection Reuse**: k6 handles HTTP keep-alive automatically

## Testing Strategies Supported

### Load Testing
- Gradual ramp-up to normal load
- Sustained load period
- Gradual ramp-down
- Strict thresholds for SLA validation

### Stress Testing
- Aggressive ramp-up
- Push beyond normal capacity
- Find breaking points
- Lenient thresholds to capture failure modes

### Spike Testing
- Rapid load increase (configure custom stages)
- Observe system recovery

### Soak Testing
- Extended duration at steady load (configure longer stages)
- Detect memory leaks and degradation

## Scalability

### Horizontal Scaling
- **100+ Endpoints**: Achieved through configuration, not code
- **Endpoint Map**: O(1) lookup scales indefinitely
- **Memory**: Linear with VU count, not endpoint count

### Vertical Scaling (VUs)
- Each VU is independent
- No shared state between VUs (except config)
- k6 can handle thousands of VUs on commodity hardware

### Test Duration
- Configurable stages allow tests from seconds to hours
- Token caching prevents auth exhaustion on long tests

## Best Practices Implementation

1. **DRY Principle**: Single executor for all endpoints
2. **Separation of Concerns**: Config, execution, and auth are independent
3. **Strategy Pattern**: Multiple execution strategies without code duplication
4. **Lazy Initialization**: Tokens fetched only when needed
5. **Fail Fast**: Early validation of endpoint configuration
6. **Clear Metrics**: Tagged checks for per-endpoint visibility
7. **Environment Override**: CLI flags override config for flexibility

## Conclusion

This architecture achieves the primary goals:

✅ **Zero Code Duplication**: One executor handles all endpoints  
✅ **100+ Endpoint Support**: Through configuration only  
✅ **Multiple Strategies**: Sequential, parallel, mixed execution  
✅ **Easy to Extend**: Add endpoints and groups via config  
✅ **Performance Optimized**: Token caching, O(1) lookups  
✅ **Flexible Testing**: Load and stress test support  
✅ **Clear Separation**: Config, execution, auth are independent modules  

The framework balances simplicity, scalability, and maintainability through careful architectural choices and proven design patterns.
