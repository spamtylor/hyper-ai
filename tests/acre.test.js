import { describe, it, expect, vi } from 'vitest';
import AdaptiveContextualReconfigurationEngine from '../src/acre';

describe('AdaptiveContextualReconfigurationEngine', () => {
  it('initializes with provided configuration', () => {
    const engine = new AdaptiveContextualReconfigurationEngine({ mode: 'production' });
    expect(engine.getCurrentConfig()).toEqual({ mode: 'production' });
  });

  it('updates configuration with new data', () => {
    const engine = new AdaptiveContextualReconfigurationEngine({ cpu: 75 });
    engine.updateConfig({ memory: 90, mode: 'debug' });
    expect(engine.getCurrentConfig()).toEqual({
      cpu: 75,
      memory: 90,
      mode: 'debug'
    });
  });

  it('handles empty update data gracefully', () => {
    const engine = new AdaptiveContextualReconfigurationEngine({ version: '1.0' });
    engine.updateConfig({});
    expect(engine.getCurrentConfig()).toEqual({ version: '1.0' });
  });
});
