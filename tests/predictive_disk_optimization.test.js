import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import { predictAndClean } from '../src/predictive_disk_optimization';

describe('predictive_disk_optimization', () => {
  let originalGetDiskUsage;
  let originalCleanUp;

  beforeEach(() => {
    const module = require('../src/predictive_disk_optimization');
    originalGetDiskUsage = module.getDiskUsage;
    originalCleanUp = module.cleanUp;
  });

  afterEach(() => {
    const module = require('../src/predictive_disk_optimization');
    module.getDiskUsage = originalGetDiskUsage;
    module.cleanUp = originalCleanUp;
  });

  it('should clean up containers with usage above 85%', async () => {
    const mockGetDiskUsage = vi.fn().mockReturnValue({
      containers: [
        { id: 'container1', usage: 80 },
        { id: 'container2', usage: 90 }
      ]
    });
    const mockCleanUp = vi.fn();

    const module = require('../src/predictive_disk_optimization');
    module.getDiskUsage = mockGetDiskUsage;
    module.cleanUp = mockCleanUp;

    await predictAndClean();

    expect(mockGetDiskUsage).toHaveBeenCalled();
    expect(mockCleanUp).toHaveBeenCalledWith('container2');
  });

  it('should not clean up containers with usage below 85%', async () => {
    const mockGetDiskUsage = vi.fn().mockReturnValue({
      containers: [
        { id: 'container1', usage: 80 }
      ]
    });
    const mockCleanUp = vi.fn();

    const module = require('../src/predictive_disk_optimization');
    module.getDiskUsage = mockGetDiskUsage;
    module.cleanUp = mockCleanUp;

    await predictAndClean();

    expect(mockCleanUp).not.toHaveBeenCalled();
  });
});
