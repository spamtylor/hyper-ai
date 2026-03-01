import { describe, it, expect, vi } from "vitest";
import { GPUOrchestrator } from '../src/gpu_container_orchestrator';

describe('GPUOrchestrator', () => {
  let orchestrator;
  
  beforeEach(() => {
    orchestrator = new GPUOrchestrator();
  });

  it('allocates resources within capacity limits', () => {
    const result = orchestrator.allocateResources({ containerId: 'c1', demand: 0.8 });
    expect(result.gpuAllocation).toBe(0.8);
    expect(orchestrator.getAllocationStatus().currentLoad).toBe(0.8);
    
    const result2 = orchestrator.allocateResources({ containerId: 'c2', demand: 0.5 });
    expect(result2.gpuAllocation).toBe(0.2);
    expect(orchestrator.getAllocationStatus().currentLoad).toBe(1.0);
  });

  it('handles zero demand correctly', () => {
    const result = orchestrator.allocateResources({ containerId: 'c1', demand: 0 });
    expect(result.gpuAllocation).toBe(0);
    expect(orchestrator.getAllocationStatus().currentLoad).toBe(0);
  });

  it('releases resources properly', () => {
    orchestrator.allocateResources({ containerId: 'c1', demand: 0.5 });
    orchestrator.releaseResources('c1');
    expect(orchestrator.getAllocationStatus().currentLoad).toBe(0);
  });

  it('throws error for invalid demand', () => {
    expect(() => orchestrator.allocateResources({ containerId: 'c1', demand: -1 }))
      .toThrow('Invalid workload demand');
  });

  it('returns correct allocation status', () => {
    orchestrator.allocateResources({ containerId: 'c1', demand: 0.3 });
    const status = orchestrator.getAllocationStatus();
    expect(status.allocations).toEqual([['c1', 0.3]]);
    expect(status.currentLoad).toBe(0.3);
    expect(status.availableCapacity).toBe(0.7);
  });
});
