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
