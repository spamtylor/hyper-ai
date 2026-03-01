class ContextualMemorySynthesizer {
  constructor() {
    this.memory = new Map();
  }

  addInteraction(sessionId, content, timestamp = Date.now()) {
    if (!this.memory.has(sessionId)) {
      this.memory.set(sessionId, []);
    }
    this.memory.get(sessionId).push({ timestamp, content });
  }

  getRelevantContext(sessionId, currentContent, maxContextSize = 5) {
    if (!this.memory.has(sessionId) || this.memory.get(sessionId).length === 0) {
      return [];
    }

    const interactions = this.memory.get(sessionId);
    const now = Date.now();
    const relevanceScores = [];

    for (const interaction of interactions) {
      const temporalWeight = 1 / (1 + (now - interaction.timestamp));
      const semanticSimilarity = this.calculateSimilarity(currentContent, interaction.content);
      const relevance = temporalWeight * 0.5 + semanticSimilarity * 0.5;
      relevanceScores.push({ interaction, relevance });
    }

    relevanceScores.sort((a, b) => b.relevance - a.relevance);
    return relevanceScores.slice(0, maxContextSize).map(item => item.interaction.content);
  }

  calculateSimilarity(a, b) {
    if (a === b) return 1;
    return 0.5;
  }
}

export default ContextualMemorySynthesizer;
