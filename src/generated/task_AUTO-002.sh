#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/contextualRealityIntegration.js
class ContextualRealityIntegration {
  integrate(data) {
    return {
      ...data,
      processedAt: new Date().toISOString(),
      environmentAdaptation: this._calculateAdaptation(data)
    };
  }

  _calculateAdaptation(data) {
    if (data.weather === 'rainy' && data.traffic > 0.7) {
      return 'increase_ventilation';
    }
    if (data.socialSentiment < -0.3) {
      return 'postpone_non_essential';
    }
    return 'maintain_normal';
  }
}

module.exports = ContextualRealityIntegration;
EOF

cat << 'EOF' > $HYPER_ROOT/tests/contextualRealityIntegration.test.js
import { describe, it, expect, vi } from 'vitest';
import ContextualRealityIntegration from '../src/contextualRealityIntegration';

describe('ContextualRealityIntegration', () => {
  it('should add processedAt timestamp and environmentAdaptation', () => {
    const mockData = {
      weather: 'rainy',
      traffic: 0.8,
      socialSentiment: -0.4
    };
    
    const integration = new ContextualRealityIntegration();
    const result = integration.integrate(mockData);
    
    expect(result).toEqual(expect.objectContaining({
      processedAt: expect.any(String),
      environmentAdaptation: 'increase_ventilation'
    }));
    
    // Verify original data preserved
    expect(result.weather).toBe('rainy');
    expect(result.traffic).toBe(0.8);
  });

  it('should handle social sentiment adaptation', () => {
    const mockData = {
      socialSentiment: -0.35
    };
    
    const integration = new ContextualRealityIntegration();
    const result = integration.integrate(mockData);
    
    expect(result.environmentAdaptation).toBe('postpone_non_essential');
  });

  it('should default to maintain_normal when no conditions met', () => {
    const mockData = {
      weather: 'sunny',
      traffic: 0.2,
      socialSentiment: 0.1
    };
    
    const integration = new ContextualRealityIntegration();
    const result = integration.integrate(mockData);
    
    expect(result.environmentAdaptation).toBe('maintain_normal');
  });
});
EOF
