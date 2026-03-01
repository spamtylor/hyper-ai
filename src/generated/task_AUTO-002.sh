#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/cross_modal_knowledge_fusion.js
/**
 * Cross-Modal Knowledge Fusion Module
 * Dynamically integrates heterogeneous data streams into unified semantic representations
 */
class CrossModalKnowledgeFusion {
  constructor() {
    this.modalities = ['text', 'sensor', 'visual', 'temporal'];
  }

  synthesize(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Input must be a valid object');
    }

    const unified = {
      combined: [],
      metadata: {}
    };

    this.modalities.forEach(modality => {
      if (data[modality] && Array.isArray(data[modality])) {
        unified.combined = unified.combined.concat(data[modality]);
        unified.metadata[modality] = data[modality].length;
      }
    });

    unified.semantic = this._generateSemantic(unified.combined);
    return unified;
  }

  _generateSemantic(combinedData) {
    if (combinedData.length === 0) return 'empty_context';
    return combinedData.reduce((acc, item) => {
      return acc + (typeof item === 'string' ? item : item.toString());
    }, 'context_');
  }
}

export default CrossModalKnowledgeFusion;
EOF

cat << 'EOF' > $HYPER_ROOT/tests/cross_modal_knowledge_fusion.test.js
import { describe, it, expect, vi } from vitest;
import CrossModalKnowledgeFusion from '../src/cross_modal_knowledge_fusion';

describe('CrossModalKnowledgeFusion', () => {
  let fusion;

  beforeEach(() => {
    fusion = new CrossModalKnowledgeFusion();
  });

  it('synthesizes all modalities correctly', () => {
    const input = {
      text: ['Hello', 'world'],
      sensor: [23.5, 45.2],
      visual: ['image1.jpg', 'image2.png'],
      temporal: [new Date('2023-01-01'), new Date('2023-01-02')]
    };
    const result = fusion.synthesize(input);
    
    expect(result.combined).toEqual([
      'Hello', 'world', 23.5, 45.2, 'image1.jpg', 'image2.png',
      new Date('2023-01-01'), new Date('2023-01-02')
    ]);
    expect(result.metadata).toEqual({
      text: 2,
      sensor: 2,
      visual: 2,
      temporal: 2
    });
    expect(result.semantic).toBe('context_Helloworld23.545.2image1.jpgimage2.png2023-01-01T00:00:00.000Z2023-01-02T00:00:00.000Z');
  });

  it('handles missing modalities gracefully', () => {
    const input = {
      text: ['Hello'],
      sensor: []
    };
    const result = fusion.synthesize(input);
    
    expect(result.combined).toEqual(['Hello']);
    expect(result.metadata).toEqual({ text: 1, sensor: 0 });
  });

  it('returns empty context for empty input', () => {
    const result = fusion.synthesize({});
    expect(result.semantic).toBe('empty_context');
  });

  it('throws error for invalid input', () => {
    expect(() => fusion.synthesize('invalid')).toThrow('Input must be a valid object');
  });

  it('handles mixed data types correctly', () => {
    const input = {
      text: ['test'],
      sensor: [100],
      visual: [null],
      temporal: [undefined]
    };
    const result = fusion.synthesize(input);
    
    expect(result.combined).toEqual(['test', 100, null, undefined]);
    expect(result.semantic).toBe('context_test100nullundefined');
  });
});
EOF
