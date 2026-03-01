import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import ROCmMemoryOptimizer from '../src/rocMemoryOptimizer';

describe('ROCmMemoryOptimizer', () => {
  let optimizer;
  const testModel = { id: 'model1', kernels: ['conv', 'relu'], memoryBlocks: [{ size: 1024 }, { size: 0 }] };

  beforeEach(() => {
    optimizer = new ROCmMemoryOptimizer();
  });

  it('initializes correctly', () => {
    expect(optimizer).toBeInstanceOf(ROCmMemoryOptimizer);
  });

  it('optimizes model with memory pooling', () => {
    const optimized = optimizer.optimize({ ...testModel });
    expect(optimizer.memoryPool.get('model1')).toContain(optimized);
  });

  it('fuses kernels in model', () => {
    const optimized = optimizer.optimize({ ...testModel });
    expect(optimized.fusedKernel).toBe('conv + relu');
    expect(optimized.kernels).toBeUndefined();
  });

  it('reduces memory fragmentation', () => {
    const optimized = optimizer.optimize({ ...testModel });
    expect(optimized.memoryBlocks.length).toBe(1);
  });

  it('handles empty kernel array', () => {
    const model = { id: 'model2', kernels: [] };
    const optimized = optimizer.optimize(model);
    expect(optimized.kernels).toBeUndefined();
  });
});
