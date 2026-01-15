/**
 * Demonstrating 100+ endpoints configuration, simply add entries to the endpoints array.
 * To use this configuration, import it in endpointTest.js instead of endpoints.config.js
 */

export const endpoints = [
    // Course Management (1-20)
    { name: "listAllCourses", method: "GET", path: "/courses", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourse", method: "GET", path: "/courses/${courseId}", requiresAuth: true, tags: { category: "courses" } },
    { name: "createCourse", method: "POST", path: "/courses", requiresAuth: true, body: { title: "New Course" }, tags: { category: "courses" } },
    { name: "updateCourse", method: "PUT", path: "/courses/${courseId}", requiresAuth: true, body: { title: "Updated" }, tags: { category: "courses" } },
    { name: "deleteCourse", method: "DELETE", path: "/courses/${courseId}", requiresAuth: true, tags: { category: "courses" } },
    { name: "enrollCourse", method: "POST", path: "/enroll", requiresAuth: true, body: { course_id: "${courseId}", user_id: "${userId}" }, tags: { category: "courses" } },
    { name: "unenrollCourse", method: "POST", path: "/unenroll", requiresAuth: true, body: { course_id: "${courseId}", user_id: "${userId}" }, tags: { category: "courses" } },
    { name: "getCourseModules", method: "GET", path: "/courses/${courseId}/modules", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourseInstructors", method: "GET", path: "/courses/${courseId}/instructors", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourseLessons", method: "GET", path: "/courses/${courseId}/lessons", requiresAuth: true, tags: { category: "courses" } },
    { name: "searchCourses", method: "GET", path: "/courses/search?q=test", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourseCategories", method: "GET", path: "/course-categories", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCoursesByCategory", method: "GET", path: "/courses/category/1", requiresAuth: true, tags: { category: "courses" } },
    { name: "getFeaturedCourses", method: "GET", path: "/courses/featured", requiresAuth: true, tags: { category: "courses" } },
    { name: "getPopularCourses", method: "GET", path: "/courses/popular", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourseReviews", method: "GET", path: "/courses/${courseId}/reviews", requiresAuth: true, tags: { category: "courses" } },
    { name: "addCourseReview", method: "POST", path: "/courses/${courseId}/reviews", requiresAuth: true, body: { rating: 5, comment: "Great!" }, tags: { category: "courses" } },
    { name: "getCourseRating", method: "GET", path: "/courses/${courseId}/rating", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourseCertificate", method: "GET", path: "/courses/${courseId}/certificate", requiresAuth: true, tags: { category: "courses" } },
    { name: "getCourseStatistics", method: "GET", path: "/courses/${courseId}/statistics", requiresAuth: true, tags: { category: "courses" } },

    // User Management (21-40)
    { name: "getUserProfile", method: "GET", path: "/users/${userId}", requiresAuth: true, tags: { category: "users" } },
    { name: "updateUserProfile", method: "PUT", path: "/users/${userId}", requiresAuth: true, body: { user_id: "${userId}" }, tags: { category: "users" } },
    { name: "listUsers", method: "GET", path: "/users", requiresAuth: true, tags: { category: "users" } },
    { name: "deleteUser", method: "DELETE", path: "/users/${userId}", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserCourses", method: "GET", path: "/users/${userId}/courses", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserEnrollments", method: "GET", path: "/users/${userId}/enrollments", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserCertificates", method: "GET", path: "/users/${userId}/certificates", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserAchievements", method: "GET", path: "/users/${userId}/achievements", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserNotifications", method: "GET", path: "/users/${userId}/notifications", requiresAuth: true, tags: { category: "users" } },
    { name: "markNotificationRead", method: "PUT", path: "/notifications/1/read", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserPreferences", method: "GET", path: "/users/${userId}/preferences", requiresAuth: true, tags: { category: "users" } },
    { name: "updateUserPreferences", method: "PUT", path: "/users/${userId}/preferences", requiresAuth: true, body: { theme: "dark" }, tags: { category: "users" } },
    { name: "getUserActivity", method: "GET", path: "/users/${userId}/activity", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserBadges", method: "GET", path: "/users/${userId}/badges", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserProgress", method: "GET", path: "/users/${userId}/progress", requiresAuth: true, tags: { category: "users" } },
    { name: "getUserStats", method: "GET", path: "/users/${userId}/stats", requiresAuth: true, tags: { category: "users" } },
    { name: "uploadUserAvatar", method: "POST", path: "/users/${userId}/avatar", requiresAuth: true, body: { url: "avatar.jpg" }, tags: { category: "users" } },
    { name: "getUserSettings", method: "GET", path: "/users/${userId}/settings", requiresAuth: true, tags: { category: "users" } },
    { name: "updateUserSettings", method: "PUT", path: "/users/${userId}/settings", requiresAuth: true, body: { email_notifications: true }, tags: { category: "users" } },
    { name: "getUserWatchlist", method: "GET", path: "/users/${userId}/watchlist", requiresAuth: true, tags: { category: "users" } },

    // Assignment Management (41-60)
    { name: "getAssignments", method: "GET", path: "/courses/${courseId}/assignments", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getAssignment", method: "GET", path: "/assignments/1", requiresAuth: true, tags: { category: "assignments" } },
    { name: "submitAssignment", method: "POST", path: "/assignments/submit", requiresAuth: true, body: { course_id: "${courseId}", user_id: "${userId}" }, tags: { category: "assignments" } },
    { name: "updateAssignmentSubmission", method: "PUT", path: "/assignments/submissions/1", requiresAuth: true, body: { content: "Updated" }, tags: { category: "assignments" } },
    { name: "deleteAssignmentSubmission", method: "DELETE", path: "/assignments/submissions/1", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getAssignmentSubmissions", method: "GET", path: "/assignments/1/submissions", requiresAuth: true, tags: { category: "assignments" } },
    { name: "gradeAssignment", method: "POST", path: "/assignments/submissions/1/grade", requiresAuth: true, body: { grade: 95 }, tags: { category: "assignments" } },
    { name: "getAssignmentGrades", method: "GET", path: "/assignments/1/grades", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getUserAssignments", method: "GET", path: "/users/${userId}/assignments", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getPendingAssignments", method: "GET", path: "/users/${userId}/assignments/pending", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getCompletedAssignments", method: "GET", path: "/users/${userId}/assignments/completed", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getAssignmentFeedback", method: "GET", path: "/assignments/submissions/1/feedback", requiresAuth: true, tags: { category: "assignments" } },
    { name: "addAssignmentFeedback", method: "POST", path: "/assignments/submissions/1/feedback", requiresAuth: true, body: { comment: "Good job!" }, tags: { category: "assignments" } },
    { name: "getAssignmentRubric", method: "GET", path: "/assignments/1/rubric", requiresAuth: true, tags: { category: "assignments" } },
    { name: "createAssignment", method: "POST", path: "/courses/${courseId}/assignments", requiresAuth: true, body: { title: "New Assignment" }, tags: { category: "assignments" } },
    { name: "updateAssignment", method: "PUT", path: "/assignments/1", requiresAuth: true, body: { title: "Updated Assignment" }, tags: { category: "assignments" } },
    { name: "deleteAssignment", method: "DELETE", path: "/assignments/1", requiresAuth: true, tags: { category: "assignments" } },
    { name: "getAssignmentAttachments", method: "GET", path: "/assignments/1/attachments", requiresAuth: true, tags: { category: "assignments" } },
    { name: "uploadAssignmentAttachment", method: "POST", path: "/assignments/1/attachments", requiresAuth: true, body: { file: "file.pdf" }, tags: { category: "assignments" } },
    { name: "getAssignmentDeadline", method: "GET", path: "/assignments/1/deadline", requiresAuth: true, tags: { category: "assignments" } },

    // Progress Tracking (61-80)
    { name: "getCourseProgress", method: "GET", path: "/progress/${userId}/${courseId}", requiresAuth: true, tags: { category: "progress" } },
    { name: "updateProgress", method: "POST", path: "/progress", requiresAuth: true, body: { course_id: "${courseId}", user_id: "${userId}", progress: 50 }, tags: { category: "progress" } },
    { name: "getLessonProgress", method: "GET", path: "/progress/lesson/1", requiresAuth: true, tags: { category: "progress" } },
    { name: "markLessonComplete", method: "POST", path: "/progress/lesson/1/complete", requiresAuth: true, tags: { category: "progress" } },
    { name: "getModuleProgress", method: "GET", path: "/progress/module/1", requiresAuth: true, tags: { category: "progress" } },
    { name: "markModuleComplete", method: "POST", path: "/progress/module/1/complete", requiresAuth: true, tags: { category: "progress" } },
    { name: "getOverallProgress", method: "GET", path: "/users/${userId}/overall-progress", requiresAuth: true, tags: { category: "progress" } },
    { name: "getProgressReport", method: "GET", path: "/users/${userId}/progress-report", requiresAuth: true, tags: { category: "progress" } },
    { name: "getCompletionRate", method: "GET", path: "/courses/${courseId}/completion-rate", requiresAuth: true, tags: { category: "progress" } },
    { name: "getTimeSpent", method: "GET", path: "/users/${userId}/time-spent", requiresAuth: true, tags: { category: "progress" } },
    { name: "updateTimeSpent", method: "POST", path: "/progress/time-spent", requiresAuth: true, body: { minutes: 30 }, tags: { category: "progress" } },
    { name: "getProgressMilestones", method: "GET", path: "/users/${userId}/milestones", requiresAuth: true, tags: { category: "progress" } },
    { name: "unlockMilestone", method: "POST", path: "/progress/milestone/1/unlock", requiresAuth: true, tags: { category: "progress" } },
    { name: "getProgressStreak", method: "GET", path: "/users/${userId}/streak", requiresAuth: true, tags: { category: "progress" } },
    { name: "updateProgressStreak", method: "POST", path: "/progress/streak", requiresAuth: true, tags: { category: "progress" } },
    { name: "getProgressGoals", method: "GET", path: "/users/${userId}/goals", requiresAuth: true, tags: { category: "progress" } },
    { name: "setProgressGoal", method: "POST", path: "/progress/goals", requiresAuth: true, body: { target: 100 }, tags: { category: "progress" } },
    { name: "getProgressAnalytics", method: "GET", path: "/users/${userId}/analytics", requiresAuth: true, tags: { category: "progress" } },
    { name: "getProgressTimeline", method: "GET", path: "/users/${userId}/timeline", requiresAuth: true, tags: { category: "progress" } },
    { name: "exportProgress", method: "GET", path: "/users/${userId}/progress/export", requiresAuth: true, tags: { category: "progress" } },

    // Quiz and Assessment (81-100)
    { name: "getCourseQuizzes", method: "GET", path: "/courses/${courseId}/quizzes", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuiz", method: "GET", path: "/quizzes/1", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "startQuiz", method: "POST", path: "/quizzes/1/start", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "submitQuizAnswer", method: "POST", path: "/quizzes/1/answer", requiresAuth: true, body: { answer: "A" }, tags: { category: "quizzes" } },
    { name: "completeQuiz", method: "POST", path: "/quizzes/1/complete", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizResults", method: "GET", path: "/quizzes/1/results", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizAttempts", method: "GET", path: "/quizzes/1/attempts", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "retakeQuiz", method: "POST", path: "/quizzes/1/retake", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizQuestions", method: "GET", path: "/quizzes/1/questions", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizLeaderboard", method: "GET", path: "/quizzes/1/leaderboard", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "createQuiz", method: "POST", path: "/courses/${courseId}/quizzes", requiresAuth: true, body: { title: "New Quiz" }, tags: { category: "quizzes" } },
    { name: "updateQuiz", method: "PUT", path: "/quizzes/1", requiresAuth: true, body: { title: "Updated Quiz" }, tags: { category: "quizzes" } },
    { name: "deleteQuiz", method: "DELETE", path: "/quizzes/1", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizStatistics", method: "GET", path: "/quizzes/1/statistics", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizAnalytics", method: "GET", path: "/quizzes/1/analytics", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getUserQuizHistory", method: "GET", path: "/users/${userId}/quiz-history", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizFeedback", method: "GET", path: "/quizzes/1/attempts/1/feedback", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizTimelimit", method: "GET", path: "/quizzes/1/timelimit", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizPassingScore", method: "GET", path: "/quizzes/1/passing-score", requiresAuth: true, tags: { category: "quizzes" } },
    { name: "getQuizCertificate", method: "GET", path: "/quizzes/1/certificate", requiresAuth: true, tags: { category: "quizzes" } },

    // Discussion and Forums (101-120)
    { name: "getCourseDiscussions", method: "GET", path: "/courses/${courseId}/discussions", requiresAuth: true, tags: { category: "discussions" } },
    { name: "createDiscussion", method: "POST", path: "/courses/${courseId}/discussions", requiresAuth: true, body: { title: "Question" }, tags: { category: "discussions" } },
    { name: "getDiscussion", method: "GET", path: "/discussions/1", requiresAuth: true, tags: { category: "discussions" } },
    { name: "updateDiscussion", method: "PUT", path: "/discussions/1", requiresAuth: true, body: { title: "Updated" }, tags: { category: "discussions" } },
    { name: "deleteDiscussion", method: "DELETE", path: "/discussions/1", requiresAuth: true, tags: { category: "discussions" } },
    { name: "getDiscussionReplies", method: "GET", path: "/discussions/1/replies", requiresAuth: true, tags: { category: "discussions" } },
    { name: "addDiscussionReply", method: "POST", path: "/discussions/1/replies", requiresAuth: true, body: { content: "Reply" }, tags: { category: "discussions" } },
    { name: "likeDiscussion", method: "POST", path: "/discussions/1/like", requiresAuth: true, tags: { category: "discussions" } },
    { name: "pinDiscussion", method: "POST", path: "/discussions/1/pin", requiresAuth: true, tags: { category: "discussions" } },
    { name: "markDiscussionResolved", method: "POST", path: "/discussions/1/resolve", requiresAuth: true, tags: { category: "discussions" } },
    { name: "reportDiscussion", method: "POST", path: "/discussions/1/report", requiresAuth: true, body: { reason: "spam" }, tags: { category: "discussions" } },
    { name: "getPopularDiscussions", method: "GET", path: "/discussions/popular", requiresAuth: true, tags: { category: "discussions" } },
    { name: "getRecentDiscussions", method: "GET", path: "/discussions/recent", requiresAuth: true, tags: { category: "discussions" } },
    { name: "getUserDiscussions", method: "GET", path: "/users/${userId}/discussions", requiresAuth: true, tags: { category: "discussions" } },
    { name: "searchDiscussions", method: "GET", path: "/discussions/search?q=help", requiresAuth: true, tags: { category: "discussions" } },
    { name: "subscribeToDiscussion", method: "POST", path: "/discussions/1/subscribe", requiresAuth: true, tags: { category: "discussions" } },
    { name: "unsubscribeFromDiscussion", method: "DELETE", path: "/discussions/1/subscribe", requiresAuth: true, tags: { category: "discussions" } },
    { name: "getDiscussionSubscribers", method: "GET", path: "/discussions/1/subscribers", requiresAuth: true, tags: { category: "discussions" } },
    { name: "getDiscussionTags", method: "GET", path: "/discussions/tags", requiresAuth: true, tags: { category: "discussions" } },
    { name: "getDiscussionsByTag", method: "GET", path: "/discussions/tag/help", requiresAuth: true, tags: { category: "discussions" } },
];

/**
 * Example Execution Groups
 */
export const executionGroups = {
    // Test all course endpoints (parallel for speed)
    allCourseEndpoints: {
        strategy: "parallel",
        endpoints: [
            "listAllCourses", "getCourse", "getCourseModules", "getCourseInstructors",
            "getCourseLessons", "getCourseCategories", "getFeaturedCourses",
            "getPopularCourses", "getCourseReviews", "getCourseRating"
        ]
    },

    // Test user workflow (sequential - depends on previous actions)
    userWorkflow: {
        strategy: "sequential",
        endpoints: [
            "getUserProfile", "getUserCourses", "getUserProgress",
            "getUserNotifications", "getUserActivity"
        ]
    },

    // Load test - hit many endpoints in parallel
    loadTest: {
        strategy: "parallel",
        endpoints: [
            "listAllCourses", "getUserProfile", "getCourseProgress",
            "getUserNotifications", "getPopularCourses", "getFeaturedCourses",
            "getUserActivity", "getUserStats", "getRecentDiscussions"
        ]
    },

    // Full workflow - mixed strategy
    fullPlatformTest: {
        strategy: "mixed",
        groups: [
            {
                strategy: "sequential",
                endpoints: ["listAllCourses", "getCourse", "enrollCourse"]
            },
            {
                strategy: "parallel",
                endpoints: ["getUserProfile", "getCourseProgress", "getAssignments"]
            },
            {
                strategy: "sequential",
                endpoints: ["getQuiz", "startQuiz", "completeQuiz", "getQuizResults"]
            }
        ]
    }
};
