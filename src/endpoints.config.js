/**
 * Endpoints Configuration
 * 
 * Define all endpoints in declarative format. Each endpoint can specify:
 * - method: HTTP method (GET, POST, PUT, DELETE, etc.)
 * - path: API endpoint path
 * - requiresAuth: Whether authentication is needed
 * - body: Request body (for POST/PUT)
 * - params: Additional parameters (query params, custom headers, etc.)
 * - tags: Custom tags for metrics
 */

export const endpoints = [
    // Course Management Endpoints
    {
        name: "getCourse",
        method: "GET",
        path: "/courses/${courseId}",
        requiresAuth: true,
        tags: { endpoint: "getCourse" }
    },
    {
        name: "listAllCourses",
        method: "GET",
        path: "/courses",
        requiresAuth: true,
        tags: { endpoint: "listAllCourses" }
    },
    {
        name: "enrollCourse",
        method: "POST",
        path: "/enroll",
        requiresAuth: true,
        body: {
            course_id: "${courseId}",
            user_id: "${userId}"
        },
        tags: { endpoint: "enrollCourse" }
    },
    
    // DISABLED: The following endpoints return errors and are commented out
    // Uncomment and fix paths/methods when API endpoints are available
    
    /*
    {
        name: "getUserProfile",
        method: "POST",  // API returns 405 for both GET and POST
        path: "/users/${userId}",
        requiresAuth: true,
        tags: { endpoint: "getUserProfile" }
    },
    {
        name: "updateUserProfile",
        method: "PUT",
        path: "/users/${userId}",
        requiresAuth: true,
        body: {
            user_id: "${userId}"
        },
        tags: { endpoint: "updateUserProfile" }
    },
    {
        name: "getCourseProgress",
        method: "GET",  // API returns 404 - endpoint doesn't exist
        path: "/progress/${userId}/${courseId}",
        requiresAuth: true,
        tags: { endpoint: "getCourseProgress" }
    }
    */
];

/**
 * Execution Groups
 * 
 * Define how endpoints should be executed:
 * - sequential: Execute endpoints one after another
 * - parallel: Execute endpoints concurrently
 * - mixed: Combine sequential and parallel execution
 */
export const executionGroups = {
    // Execute course operations sequentially (order matters)
    courseWorkflow: {
        strategy: "sequential",
        endpoints: ["listAllCourses", "getCourse", "enrollCourse"]
    },
    
    // Execute course queries in parallel (fast read operations)
    userOperations: {
        strategy: "parallel",
        endpoints: ["listAllCourses", "getCourse"]
    },
    
    // Mixed strategy: demonstrates sequential followed by parallel execution
    fullWorkflow: {
        strategy: "mixed",
        groups: [
            {
                strategy: "sequential",
                endpoints: ["listAllCourses", "getCourse", "enrollCourse"]
            },
            {
                strategy: "parallel",
                endpoints: ["getCourse", "listAllCourses"]  // Parallel queries after enrollment
            }
        ]
    }
};
