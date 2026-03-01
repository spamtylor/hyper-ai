import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import DiskSpaceOptimizer from '../src/diskSpaceOptimizer.js';

describe('DiskSpaceOptimizer', () => {
  let optimizer;
  const mockUsage = vi.fn();
  
  beforeEach(() => {
    optimizer = new DiskSpaceOptimizer();
    vi.spyOn(optimizer, 'getDiskUsage').mockImplementation(mockUsage);
  });

  it('optimizes disk space during low activity', async () => {
    mockUsage.mockResolvedValue(75);
    const result = await optimizer.optimizeDiskSpace();
    expect(result.freed).toBeGreaterThan(0);
    expect(result.details).toContain('Log cleanup');
  });

  it('does not optimize when above threshold', async () => {
    mockUsage.mockResolvedValue(86);
    const result = await optimizer.optimizeDiskSpace();
    expect(result.freed).toBe(0);
  });

  it('returns correct alert status', async () => {
    mockUsage.mockResolvedValue(84);
    expect(await optimizer.getAlertStatus()).toBe('warning');
    
    mockUsage.mockResolvedValue(85);
    expect(await optimizer.getAlertStatus()).toBe('critical');
    
    mockUsage.mockResolvedValue(79);
    expect(await optimizer.getAlertStatus()).toBe('ok');
  });

  it('checks low activity condition', async () => {
    mockUsage.mockResolvedValue(71);
    expect(await optimizer.isLowActivity()).toBe(true);
    
    mockUsage.mockResolvedValue(69);
    expect(await optimizer.isLowActivity()).toBe(false);
  });
});
