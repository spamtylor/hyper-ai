class HyperResearch {
    /**
     * Initialize the research system.
     * @param {Object} options
     * @param {string} [options.baseUrl] - Base URL for the Perplexica API.
     */
    constructor({ baseUrl = 'http://localhost:3001/api' } = {}) {
        this.baseUrl = baseUrl;
    }

    /**
     * Search the web for a specific query using Perplexica.
     * @param {string} query - The search query.
     * @param {string} [focusMode] - Focus mode (e.g., 'webSearch', 'academicSearch', 'youtubeSearch', 'redditSearch').
     * @returns {Promise<Object>} The structured search response including sources and the AI answer.
     */
    async search(query, focusMode = 'webSearch') {
        if (!query || typeof query !== 'string' || query.trim() === '') {
            throw new Error('A valid search query string is required.');
        }

        try {
            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatModel: {
                        provider: 'custom_openai',
                        model: 'qwen'
                    },
                    embeddingModel: {
                        provider: 'custom_openai',
                        model: 'text-embedding-3-small'
                    },
                    optimizationMode: 'speed',
                    focusMode: focusMode,
                    query: query,
                    history: []
                })
            });

            if (!response.ok) {
                throw new Error(`Perplexica API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            return {
                answer: data.message || '',
                sources: data.sources || [],
                success: true
            };
        } catch (error) {
            console.error(`Research search failed for query "${query}":`, error);
            return {
                answer: '',
                sources: [],
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Discover API mode: Compiles a broader brief based on internet sources.
     * @param {string} topic - The discovery topic.
     * @returns {Promise<Object>} The discovery response data.
     */
    async discover(topic) {
        if (!topic || typeof topic !== 'string' || topic.trim() === '') {
            throw new Error('A valid discovery topic string is required.');
        }

        try {
            const response = await fetch(`${this.baseUrl}/discover`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: topic
                })
            });

            if (!response.ok) {
                throw new Error(`Perplexica API discover failed with status: ${response.status}`);
            }

            const data = await response.json();
            return {
                blogs: data.blogs || [],
                success: true
            };
        } catch (error) {
            console.error(`Research discover failed for topic "${topic}":`, error);
            return {
                blogs: [],
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = { HyperResearch };
