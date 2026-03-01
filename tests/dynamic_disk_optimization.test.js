import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import { DynamicDiskOptimizer } from "../src/dynamic_disk_optimization.js";

describe('DynamicDiskOptimizer', () => {
  let optimizer;
  
  beforeEach(() => {
    optimizer = new DynamicDiskOptimizer();
  });

  it('returns valid optimization metrics', () => {
    const result = optimizer.optimize();
    expect(result.reducedUsage).toBeGreaterThanOrEqual(0.15);
    expect(result.reducedUsage).toBeLessThanOrEqual(0.20);
    expect(result.compressionFormat).toBe('zstd');
    expect(result.migrationStatus).toBe('completed');
  });

  it('maintains consistent reduction rate', () => {
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(optimizer.optimize().reducedUsage);
    }
    const min = Math.min(...results);
    const max = Math.max(...results);
    expect(min).toBeGreaterThanOrEqual(0.15);
    expect(max).toBeLessThanOrEqual(0.20);
  });
});
