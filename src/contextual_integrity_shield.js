class ContextualIntegrityShield {
  constructor(knowledgeGraph) {
    this.knowledgeGraph = knowledgeGraph;
  }

  mitigate(output, context) {
    if (!output || !context) return output;
    
    const driftDetected = this._detectSemanticDrift(output, context);
    if (driftDetected) {
      return this._mitigateDrift(output, context);
    }
    return output;
  }

  _detectSemanticDrift(output, context) {
    const contextKeywords = context.metadata?.keywords || [];
    const outputKeywords = output.match(/\b\w+\b/g) || [];
    
    const commonKeywords = new Set(
      outputKeywords.filter(word => contextKeywords.includes(word))
    );
    
    return commonKeywords.size / outputKeywords.length < 0.4;
  }

  _mitigateDrift(output, context) {
    const corrected = output.replace(/drift/g, 'alignment');
    return corrected.replace(/semantic drift/g, 'contextual alignment');
  }
}

module.exports = ContextualIntegrityShield;
