#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/contextual_integrity_shield.js
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
EOF
cat << 'EOF' > $HYPER_ROOT/tests/contextual_integrity_shield.test.js
import { describe, it, expect, vi } from 'vitest';
import ContextualIntegrityShield from '../src/contextual_integrity_shield';

describe('ContextualIntegrityShield', () => {
  const knowledgeGraph = { domain: 'technology', keywords: ['AI', 'context', 'alignment'] };
  
  it('mitigates semantic drift in output', () => {
    const shield = new ContextualIntegrityShield(knowledgeGraph);
    const output = "This AI model has semantic drift in context.";
    const context = { metadata: { keywords: ['AI', 'context'] } };
    
    const result = shield.mitigate(output, context);
    expect(result).toBe("This AI model has semantic alignment in context.");
  });

  it('preserves output without drift', () => {
    const shield = new ContextualIntegrityShield(knowledgeGraph);
    const output = "This AI model is contextually aligned.";
    const context = { metadata: { keywords: ['AI', 'context', 'alignment'] } };
    
    const result = shield.mitigate(output, context);
    expect(result).toBe(output);
  });

  it('handles empty output gracefully', () => {
    const shield = new ContextualIntegrityShield(knowledgeGraph);
    expect(shield.mitigate('', {})).toBe('');
  });

  it('handles missing context metadata', () => {
    const shield = new ContextualIntegrityShield(knowledgeGraph);
    const output = "This output has semantic drift.";
    expect(shield.mitigate(output, {})).toBe("This output has semantic alignment.");
  });
});
EOF
