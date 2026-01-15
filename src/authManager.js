import { logIn } from '../auth.js';

/**
 * AuthManager
 * 
 * Manages authentication tokens with caching to avoid
 * unnecessary login calls. Reduces code duplication and
 * improves performance.
 */
export class AuthManager {
    constructor(config) {
        this.config = config;
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Get a valid authentication token
     * Uses cached token if still valid, otherwise logs in again
     */
    getToken() {
        // Check if we have a valid cached token
        if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.token;
        }

        // Token expired or doesn't exist, login again
        this.token = logIn(this.config);
        
        // Assume token is valid for 1 hour (adjust based on your API)
        this.tokenExpiry = Date.now() + (60 * 60 * 1000);
        
        return this.token;
    }

    /**
     * Clear the cached token (useful for testing token refresh)
     */
    clearToken() {
        this.token = null;
        this.tokenExpiry = null;
    }

    /**
     * Force a new login and get a fresh token
     */
    refreshToken() {
        this.clearToken();
        return this.getToken();
    }
}
