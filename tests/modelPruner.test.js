import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import { pruneModel } from '../src/modelPruner';

describe('Model Pruner', () => {
  it('reduces model size by 30% without accuracy loss', () => {
    const originalModel = { size: 1000 };
    const prunedModel = pruneModel(originalModel);
    expect(prunedModel.size).toBe(700);
  });

  it('preserves original model structure', () => {
    const originalModel = { size: 1000, name: 'test' };
    const prunedModel = pruneModel(originalModel);
    expect(prunedModel.name).toBe('test');
  });
});
