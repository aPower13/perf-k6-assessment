import http from 'k6/http';
import { check, sleep } from 'k6';
import { endpoints } from './endpoints.config.js';

/**
 * EndpointExecutor
 * 
 * Central utility for executing HTTP requests to endpoints.
 * Eliminates code duplication by providing a single, reusable
 * method for all endpoint calls.
 */
export class EndpointExecutor {
    constructor(config, authManager) {
        this.config = config;
        this.authManager = authManager;
        this.endpointMap = this._buildEndpointMap();
    }

    /**
     * Build a map of endpoint names to endpoint configurations
     */
    _buildEndpointMap() {
        const map = {};
        endpoints.forEach(endpoint => {
            map[endpoint.name] = endpoint;
        });
        return map;
    }

    /**
     * Interpolate variables in strings (e.g., ${courseId} -> actual value)
     */
    _interpolate(str, context) {
        if (typeof str !== 'string') return str;
        
        return str.replace(/\$\{(\w+)\}/g, (match, key) => {
            return context[key] !== undefined ? context[key] : match;
        });
    }

    /**
     * Deep interpolate object values
     */
    _interpolateObject(obj, context) {
        if (typeof obj !== 'object' || obj === null) {
            return this._interpolate(obj, context);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this._interpolateObject(item, context));
        }

        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = this._interpolateObject(value, context);
        }
        return result;
    }

    /**
     * Build headers for the request
     */
    _buildHeaders(endpoint) {
        const headers = {
            'Content-Type': 'application/json',
            ...(endpoint.headers || {})
        };

        if (endpoint.requiresAuth) {
            const token = this.authManager.getToken();
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Build the full URL for the endpoint
     */
    _buildUrl(endpoint) {
        const context = {
            courseId: this.config.courseId,
            userId: this.config.userId,
            ...this.config.variables
        };

        const interpolatedPath = this._interpolate(endpoint.path, context);
        return `${this.config.baseURL}${interpolatedPath}`;
    }

    /**
     * Execute a single endpoint by name
     */
    execute(endpointName) {
        const endpoint = this.endpointMap[endpointName];
        
        if (!endpoint) {
            console.error(`Endpoint '${endpointName}' not found in configuration`);
            return null;
        }

        const url = this._buildUrl(endpoint);
        const headers = this._buildHeaders(endpoint);

        // Prepare request body if needed
        let body = null;
        if (endpoint.body) {
            const context = {
                courseId: this.config.courseId,
                userId: this.config.userId,
                ...this.config.variables
            };
            body = JSON.stringify(this._interpolateObject(endpoint.body, context));
        }

        // Prepare request parameters
        const params = {
            headers: headers,
            tags: {
                name: endpointName,
                ...(endpoint.tags || {})
            },
            ...(endpoint.params || {})
        };

        // Execute the request
        const response = http.request(endpoint.method, url, body, params);

        // Optional: Add basic checks
        check(response, {
            [`${endpointName}: status is 2xx or 3xx`]: (r) => r.status >= 200 && r.status < 400,
        });

        return response;
    }

    /**
     * Execute multiple endpoints sequentially
     */
    executeSequential(endpointNames) {
        const results = [];
        const thinkTime = parseFloat(__ENV.THINK_TIME || this.config.thinkTime || 0);
        
        for (let i = 0; i < endpointNames.length; i++) {
            const name = endpointNames[i];
            const result = this.execute(name);
            results.push({ name, result });
            
            // Add think time after each request except the last one
            if (thinkTime > 0 && i < endpointNames.length - 1) {
                sleep(thinkTime);
            }
        }
        return results;
    }

    /**
     * Execute multiple endpoints in parallel using k6's batch
     */
    executeParallel(endpointNames) {
        const requests = {};
        
        for (const name of endpointNames) {
            const endpoint = this.endpointMap[name];
            if (!endpoint) {
                console.error(`Endpoint '${name}' not found in configuration`);
                continue;
            }

            const url = this._buildUrl(endpoint);
            const headers = this._buildHeaders(endpoint);

            let body = null;
            if (endpoint.body) {
                const context = {
                    courseId: this.config.courseId,
                    userId: this.config.userId,
                    ...this.config.variables
                };
                body = JSON.stringify(this._interpolateObject(endpoint.body, context));
            }

            requests[name] = {
                method: endpoint.method,
                url: url,
                body: body,
                params: {
                    headers: headers,
                    tags: {
                        name: name,
                        ...(endpoint.tags || {})
                    },
                    ...(endpoint.params || {})
                }
            };
        }

        // Execute all requests in parallel
        const responses = http.batch(requests);
        
        // Add think time after parallel batch (simulates user reviewing results)
        const thinkTime = parseFloat(__ENV.THINK_TIME || this.config.thinkTime || 0);
        if (thinkTime > 0) {
            sleep(thinkTime);
        }

        // Add checks for each response
        const results = [];
        for (const [name, response] of Object.entries(responses)) {
            check(response, {
                [`${name}: status is 2xx or 3xx`]: (r) => r.status >= 200 && r.status < 400,
            });
            results.push({ name, result: response });
        }

        return results;
    }

    /**
     * Execute endpoints based on a group configuration
     */
    executeGroup(group) {
        if (group.strategy === 'sequential') {
            return this.executeSequential(group.endpoints);
        } else if (group.strategy === 'parallel') {
            return this.executeParallel(group.endpoints);
        } else if (group.strategy === 'mixed' && group.groups) {
            // Execute each group, then combine results
            const allResults = [];
            for (const subGroup of group.groups) {
                const results = this.executeGroup(subGroup);
                allResults.push(...results);
            }
            return allResults;
        }
        
        console.error(`Unknown execution strategy: ${group.strategy}`);
        return [];
    }
}
