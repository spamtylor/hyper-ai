import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import { optimizeDisk } from '../src/disk_health_optimizer';

describe('diskHealthOptimizer', () => {
  it('returns valid optimization message with 15-20% recovery', () => {
    const result = optimizeDisk();
    expect(result).toMatch(/Recovered (\d{2})%/);
    const match = result.match(/Recovered (\d{2})%/);
    const percentage = parseInt(match[1], 10);
    expect(percentage).toBeGreaterThanOrEqual(15);
    expect(percentage).toBeLessThanOrEqual(20);
  });
});
