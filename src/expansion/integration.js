class HyperIntegration {
    /**
     * Instantiates the External Integrations wrapper.
     * @param {Object} config - Configuration object containing options like { apiKey, baseUrl }.
     */
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || '';
        this.apiKey = config.apiKey || null;
        this.defaultHeaders = config.headers || {
            'Content-Type': 'application/json'
        };

        if (this.apiKey) {
            this.defaultHeaders['Authorization'] = `Bearer ${this.apiKey}`;
        }
    }

    /**
     * A robust wrapper around fetch to automatically handle endpoints, headers, and parsing.
     * @param {string} endpoint - The API endpoint or full URL.
     * @param {Object} options - Fetch options (method, body, custom headers).
     * @returns {Promise<Object>} The parsed JSON response.
     */
    async request(endpoint, options = {}) {
        if (!endpoint || typeof endpoint !== 'string') {
            throw new Error("A valid endpoint string is required.");
        }

        const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

        const mergedHeaders = { ...this.defaultHeaders, ...options.headers };

        const fetchOptions = {
            ...options,
            headers: mergedHeaders
        };

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            let errorMsg = `API request failed with status ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message || errorData.error) {
                    errorMsg += `: ${errorData.message || errorData.error}`;
                }
            } catch (e) {
                // Ignore parsing errors for failed text responses
            }
            const error = new Error(errorMsg);
            error.status = response.status;
            throw error;
        }

        // Return empty object for 204 No Content
        if (response.status === 204) {
            return {};
        }

        return await response.json();
    }

    /**
     * A resilience wrapper that executes an async function and retries it on failure with exponential backoff.
     * @param {Function} apiFn - The async function to execute.
     * @param {number} maxRetries - Maximum number of retries (default 3).
     * @param {number} baseDelayMs - Starting delay for exponential backoff (default 500ms).
     * @returns {Promise<any>} The result of the fn.
     */
    async executeWithRetry(apiFn, maxRetries = 3, baseDelayMs = 500) {
        if (typeof apiFn !== 'function') {
            throw new Error("executeWithRetry requires a function to execute.");
        }

        let attempts = 0;

        while (attempts <= maxRetries) {
            try {
                return await apiFn();
            } catch (error) {
                attempts++;

                // If we've hit max retries, propagate the final error
                if (attempts > maxRetries) {
                    error.retriesExhausted = true;
                    throw error;
                }

                // If error is a 4xx (Client Error) other than 429 (Rate Limit), don't bother retrying
                if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
                    throw error;
                }

                // Calculate exponential backoff (baseDelay * 2^attempts) with a small jitter
                const backoff = (baseDelayMs * Math.pow(2, attempts - 1)) + Math.floor(Math.random() * 50);

                console.warn(`[HyperIntegration] Execution failed. Retrying in ${backoff}ms (Attempt ${attempts}/${maxRetries}). Error: ${error.message}`);

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, backoff));
            }
        }
    }
}

module.exports = { HyperIntegration };
