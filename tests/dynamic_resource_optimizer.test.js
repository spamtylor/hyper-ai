import { describe, it, expect, vi } from "vitest";
import DynamicResourceOptimizer from '../src/dynamic_resource_optimizer';

describe('DynamicResourceOptimizer', () => {
  let optimizer;
  let mockContainers = [
    { id: 'c1', priority: 'high', memory: 0.8 },
    { id: 'c2', priority: 'low', memory: 0.9 }
  ];

  beforeEach(() => {
    optimizer = new DynamicResourceOptimizer();
    vi.spyOn(optimizer, 'analyzeWorkload').mockReturnValue({
      cpuUsage: 0.6,
      memoryUsage: 0.7,
      priority: 'low'
    });
  });

  it('should adjust resources for low priority containers', () => {
    const result = optimizer.adjustResources(mockContainers[1], {});
    expect(result.memory).toBeLessThan(0.9);
    expect(result.priority).toBe('low');
  });

  it('should migrate low priority containers', () => {
    const result = optimizer.migrateContainer(mockContainers[1]);
    expect(result.host).toBe('backup-host');
  });

  it('should run full optimization cycle', () => {
    const result = optimizer.runOptimization();
    expect(result.containers).toHaveLength(2);
    expect(result.containers[1].memory).toBeLessThan(0.9);
    expect(result.containers[1].host).toBe('backup-host');
  });

  it('should handle high priority containers correctly', () => {
    mockContainers[0].priority = 'high';
    const result = optimizer.runOptimization();
    expect(result.containers[0].memory).toBe(0.8);
    expect(result.containers[0].host).toBeUndefined();
  });
});
