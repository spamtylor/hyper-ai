const fs = require('fs').promises;
const path = require('path');

class HyperKnowledge {
    /**
     * Instantiates the knowledge base system.
     * @param {Object} memorySystem - An injected HyperMemory instance for storing document data.
     */
    constructor(memorySystem) {
        if (!memorySystem) {
            throw new Error("HyperKnowledge requires a HyperMemory instance to be injected.");
        }
        this.memory = memorySystem;
    }

    /**
     * Recursively reads a directory to find relevant documents (.md, .txt).
     * @param {string} directoryPath - The absolute or relative path to scan.
     * @returns {Promise<Array<string>>} An array of absolute file paths.
     */
    async discoverDocuments(directoryPath) {
        if (!directoryPath || typeof directoryPath !== 'string') {
            throw new Error("A valid directory path string is required.");
        }

        const validExtensions = ['.md', '.txt'];
        const foundFiles = [];

        try {
            const entries = await fs.readdir(directoryPath, { withFileTypes: true });

            for (let entry of entries) {
                const fullPath = path.join(directoryPath, entry.name);

                if (entry.isDirectory()) {
                    // Recursively discover files but don't blow the stack
                    if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                        const deepFiles = await this.discoverDocuments(fullPath);
                        foundFiles.push(...deepFiles);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (validExtensions.includes(ext)) {
                        foundFiles.push(fullPath);
                    }
                }
            }

            return foundFiles;
        } catch (error) {
            console.error(`[HyperKnowledge] Error reading directory ${directoryPath}:`, error.message);
            return []; // Fail gracefully on bad paths
        }
    }

    /**
     * Reads discovered documents and saves their contents into the knowledge_base collection.
     * @param {Array<string>} filePaths - Array of absolute file paths.
     * @returns {Promise<Object>} Statistics on the synchronization process.
     */
    async syncToMemory(filePaths) {
        if (!Array.isArray(filePaths)) {
            throw new Error("syncToMemory requires an array of file paths.");
        }

        if (filePaths.length === 0) {
            return {
                filesProcessed: 0,
                memorySaved: 0,
                success: true
            };
        }

        let savedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];

            try {
                const content = await fs.readFile(filePath, 'utf-8');

                // Extremely basic chunking/truncation if file is too large
                // Real systems would chunk the document into embeddings logically
                const documentSlice = content.length > 5000 ? content.substring(0, 5000) : content;

                // Dummy deterministic pseudo-vector for testing
                const dummyVector = new Array(1536).fill(0).map(() => Math.random() - 0.5);

                // Create a unique ID or use hash
                const docId = `doc-${path.basename(filePath)}-${i}`;

                const saved = await this.memory.saveMemory('knowledge_base', docId, dummyVector, {
                    fullPath: filePath,
                    fileName: path.basename(filePath),
                    text: documentSlice,
                    indexedAt: new Date().toISOString()
                });

                if (saved) {
                    savedCount++;
                } else {
                    failedCount++;
                }
            } catch (error) {
                console.error(`[HyperKnowledge] Failed to sync document "${filePath}":`, error.message);
                failedCount++;
            }
        }

        return {
            filesProcessed: filePaths.length,
            memorySaved: savedCount,
            memoryFailed: failedCount,
            success: failedCount === 0
        };
    }
}

module.exports = { HyperKnowledge };
