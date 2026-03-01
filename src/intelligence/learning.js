class HyperLearning {
    /**
     * Instantiates the learning system.
     * @param {Object} memorySystem - An injected HyperMemory instance for storing facts.
     */
    constructor(memorySystem) {
        if (!memorySystem) {
            throw new Error("HyperLearning requires a HyperMemory instance to be injected.");
        }
        this.memory = memorySystem;
    }

    /**
     * Extracts core facts from a conversation string.
     * Simulated LLM extraction.
     * @param {string} text - The input text to analyze.
     * @returns {Array<string>} An array of extracted facts.
     */
    analyzeInteraction(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }

        const facts = [];
        const lowerText = text.toLowerCase();

        // Basic NLP simulation: extract sentences containing key action words
        const keywords = ['likes', 'prefers', 'hates', 'is', 'wants', 'needs'];

        // Split by simple punctuation
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        for (const sentence of sentences) {
            const cleanSentence = sentence.trim();
            const lowerSentence = cleanSentence.toLowerCase();

            for (const keyword of keywords) {
                // Check if keyword is in sentence (padded by spaces to avoid substrings)
                if (lowerSentence.includes(` ${keyword} `) || lowerSentence.startsWith(`${keyword} `)) {
                    facts.push(cleanSentence);
                    break; // Only add a sentence once even if multiple keywords match
                }
            }
        }

        return facts;
    }

    /**
     * Takes an interaction, extracts facts, and saves them to long-term memory.
     * @param {string|number} interactionId - The ID of the interaction.
     * @param {string} text - The conversation text.
     * @returns {Promise<Object>} Statistics on the consolidation process.
     */
    async consolidateMemory(interactionId, text) {
        if (!interactionId) {
            throw new Error("An interactionId is required to consolidate memory.");
        }

        const facts = this.analyzeInteraction(text);

        if (facts.length === 0) {
            return {
                interactionId,
                factsExtracted: 0,
                factsSaved: 0,
                success: true
            };
        }

        let savedCount = 0;
        let failedCount = 0;

        for (let i = 0; i < facts.length; i++) {
            const fact = facts[i];

            // Generate a simple deterministic pseudo-vector for the fake fact structure
            // In a real system, we'd use an embedding model here
            const dummyVector = new Array(1536).fill(0).map(() => Math.random() - 0.5);

            // Create a unique ID for the specific fact
            const factId = `${interactionId}-${i}`;

            try {
                // Save to the 'facts' collection
                const saved = await this.memory.saveMemory('facts', factId, dummyVector, {
                    sourceInteraction: interactionId,
                    text: fact,
                    extractedAt: new Date().toISOString()
                });

                if (saved) {
                    savedCount++;
                } else {
                    failedCount++;
                }
            } catch (error) {
                console.error(`[HyperLearning] Failed to save fact "${fact}":`, error);
                failedCount++;
            }
        }

        return {
            interactionId,
            factsExtracted: facts.length,
            factsSaved: savedCount,
            factsFailed: failedCount,
            success: failedCount === 0
        };
    }
}

module.exports = { HyperLearning };
