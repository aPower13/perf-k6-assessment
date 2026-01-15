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
    
    // Example: Adding more endpoints
    {
        name: "getUserProfile",
        method: "POST",
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
        method: "GET",
        path: "/progress/${userId}/${courseId}",
        requiresAuth: true,
        tags: { endpoint: "getCourseProgress" }
    }
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
    
    // Execute user operations in parallel (no dependencies)
    userOperations: {
        strategy: "parallel",
        endpoints: ["listAllCourses", "getCourse"]
    },
    
    // Mixed strategy: sequential groups executed in parallel
    fullWorkflow: {
        strategy: "mixed",
        groups: [
            {
                strategy: "sequential",
                endpoints: ["listAllCourses", "getCourse", "enrollCourse"]
            },
            {
                strategy: "parallel",
                endpoints: ["listAllCourses", "getCourse"]
            }
        ]
    }
};
