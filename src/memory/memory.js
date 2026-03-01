const { QdrantClient } = require('@qdrant/js-client-rest');

class HyperMemory {
    /**
     * Initialize the memory system with a Qdrant client connection.
     * @param {Object} options
     * @param {Object} [options.config] - Qdrant client configuration options
     * @param {Object} [options.client] - Pre-instantiated QdrantClient (for testing)
     */
    constructor({ config = { host: 'localhost', port: 6333 }, client = null } = {}) {
        this.client = client || new QdrantClient(config);
        this.defaultVectorSize = 1536; // e.g. OpenAI ada-002 dimensionality
    }

    /**
     * Verify collections exist, and create them if not.
     * @param {string[]} collections - List of collection names
     */
    async initialize(collections = ['conversations', 'facts', 'preferences']) {
        const existingCollections = await this.client.getCollections();
        const existingNames = existingCollections.collections.map(c => c.name);

        for (const collection of collections) {
            if (!existingNames.includes(collection)) {
                await this.client.createCollection(collection, {
                    vectors: {
                        size: this.defaultVectorSize,
                        distance: 'Cosine'
                    }
                });
            }
        }
    }

    /**
     * Save a vector memory to Qdrant.
     * @param {string} collection - The collection to save to.
     * @param {string|number} id - Unique identifier.
     * @param {number[]} vector - The embedding vector.
     * @param {Object} payload - Metadata payload.
     */
    async saveMemory(collection, id, vector, payload = {}) {
        if (!vector || !Array.isArray(vector) || vector.length === 0) {
            throw new Error("Invalid memory vector provided.");
        }

        try {
            await this.client.upsert(collection, {
                wait: true,
                points: [
                    {
                        id: id,
                        vector: vector,
                        payload: payload
                    }
                ]
            });
            return true;
        } catch (error) {
            console.error(`Error saving memory to ${collection}:`, error);
            return false;
        }
    }

    /**
     * Search for similar memories based on an input vector.
     * @param {string} collection - The collection to search in.
     * @param {number[]} queryVector - The vector to search against.
     * @param {number} limit - Number of results to return.
     */
    async searchMemory(collection, queryVector, limit = 5) {
        if (!queryVector || !Array.isArray(queryVector) || queryVector.length === 0) {
            throw new Error("Invalid query vector provided.");
        }

        try {
            const results = await this.client.search(collection, {
                vector: queryVector,
                limit: limit,
                with_payload: true
            });
            return results;
        } catch (error) {
            console.error(`Error searching memory in ${collection}:`, error);
            return [];
        }
    }
}

module.exports = { HyperMemory };
