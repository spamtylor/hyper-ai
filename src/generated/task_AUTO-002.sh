#!/bin/bash
# BUILD_MANIFEST: src/predictive_resource_reshaping.js tests/predictive_resource_reshaping.test.js
echo "Creating src/predictive_resource_reshaping.js..."
cat << 'EOF' > $HYPER_ROOT/src/predictive_resource_reshaping.js
class PredictiveResourceReshaper {
  constructor() {
    this.history = [];
  }

  analyzePatterns(containerId) {
    const sample = this.history.find(h => h.containerId === containerId);
    if (!sample) return { cpu: 0.5, memory: 0.6 };
    return {
      cpu: Math.min(0.9, sample.cpu * 1.2),
      memory: Math.min(0.95, sample.memory * 1.15)
    };
  }

  resizeResources(containerId, newCpu, newMemory) {
    if (newCpu < 0.1 || newMemory < 0.1) {
      throw new Error('Invalid resource values');
    }
    return { containerId, cpu: newCpu, memory: newMemory, success: true };
  }

  recordMetrics(containerId, cpu, memory) {
    const existing = this.history.find(h => h.containerId === containerId);
    if (existing) {
      existing.cpu = (existing.cpu * 0.7) + (cpu * 0.3);
      existing.memory = (existing.memory * 0.7) + (memory * 0.3);
    } else {
      this.history.push({ containerId, cpu, memory });
    }
  }
}

module.exports = PredictiveResourceReshaper;
EOF
echo "Creating tests/predictive_resource_reshaping.test.js..."
cat << 'EOF' > $HYPER_ROOT/tests/predictive_resource_reshaping.test.js
import { describe, it, expect, vi } from "vitest";
import PredictiveResourceReshaper from '../src/predictive_resource_reshaping.js';

describe('PredictiveResourceReshaper', () => {
  let reshaper;
  const mockContainer = 'container-123';

  beforeEach(() => {
    reshaper = new PredictiveResourceReshaper();
    reshaper.recordMetrics(mockContainer, 0.5, 0.6);
  });

  it('analyzes patterns correctly', () => {
    const result = reshaper.analyzePatterns(mockContainer);
    expect(result.cpu).toBeCloseTo(0.6, 1);
    expect(result.memory).toBeCloseTo(0.69, 2);
  });

  it('records metrics with exponential smoothing', () => {
    reshaper.recordMetrics(mockContainer, 0.7, 0.8);
    const entry = reshaper.history.find(h => h.containerId === mockContainer);
    expect(entry.cpu).toBeCloseTo(0.56, 2);
    expect(entry.memory).toBeCloseTo(0.68, 2);
  });

  it('resizes resources within valid range', () => {
    const result = reshaper.resizeResources(mockContainer, 0.7, 0.8);
    expect(result).toEqual({ containerId: mockContainer, cpu: 0.7, memory: 0.8, success: true });
  });

  it('throws error for invalid resource values', () => {
    expect(() => reshaper.resizeResources(mockContainer, -0.1, 0.5))
      .toThrow('Invalid resource values');
  });
});
EOF
