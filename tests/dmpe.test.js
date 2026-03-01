import { describe, it, expect, vi } from "vitest";
import DynamicModelPruningEngine from '../src/dmpe';

describe('DynamicModelPruningEngine', () => {
  it('prunes the model without changing the model structure', () => {
    const engine = new DynamicModelPruningEngine();
    const model = { layers: ['conv1', 'conv2'] };
    const resourceConstraints = { memory: 'low' };
    const prunedModel = engine.pruneModel(model, resourceConstraints);
    expect(prunedModel).toBe(model);
  });

  it('logs the resource constraints', () => {
    const engine = new DynamicModelPruningEngine();
    const resourceConstraints = { memory: 'low' };
    const consoleLog = vi.spyOn(console, 'log');
    engine.pruneModel({}, resourceConstraints);
    expect(consoleLog).toHaveBeenCalledWith(`Pruning model with resource constraints: ${JSON.stringify(resourceConstraints)}`);
    consoleLog.mockRestore();
  });
});
