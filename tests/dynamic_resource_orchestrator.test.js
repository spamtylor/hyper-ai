import { describe, it, expect, vi } from "vitest";
import { DynamicResourceOrchestrator } from '../src/dynamic_resource_orchestrator.js';

describe('DynamicResourceOrchestrator', () => {
  it('rebalances containers with high CPU usage', () => {
    const orchestrator = new DynamicResourceOrchestrator();
    orchestrator.updateContainer('container1', { cpu: 85, ram: 50, gpu: 10 });
    orchestrator.updateContainer('container2', { cpu: 50, ram: 30, gpu: 5 });

    const plan = orchestrator.rebalance();
    expect(plan).toEqual([{ containerId: 'container1', cpu: 75 }]);
  });

  it('handles no high CPU containers', () => {
    const orchestrator = new DynamicResourceOrchestrator();
    orchestrator.updateContainer('container1', { cpu: 70, ram: 50, gpu: 10 });
    orchestrator.updateContainer('container2', { cpu: 60, ram: 30, gpu: 5 });

    const plan = orchestrator.rebalance();
    expect(plan).toEqual([]);
  });
});
