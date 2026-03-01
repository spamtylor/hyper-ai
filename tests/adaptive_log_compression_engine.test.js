import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import AdaptiveLogCompressionEngine from '../src/adaptive_log_compression_engine';

describe('AdaptiveLogCompressionEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AdaptiveLogCompressionEngine();
  });

  it('compresses non-critical logs by counting duplicates', () => {
    const logs = [
      'INFO: user logged in',
      'INFO: user logged in',
      'INFO: user logged in',
      'ERROR: failed to connect'
    ];
    const compressed = engine.compress(logs);
    expect(compressed).toEqual([
      'ERROR: failed to connect',
      'INFO: user logged in (x3)'
    ]);
  });

  it('does not compress critical logs', () => {
    const logs = ['CRITICAL: system failure', 'INFO: user logged in', 'INFO: user logged in'];
    const compressed = engine.compress(logs);
    expect(compressed).toEqual([
      'CRITICAL: system failure',
      'INFO: user logged in (x2)'
    ]);
  });

  it('handles only critical logs', () => {
    const logs = ['ERROR: connection lost', 'CRITICAL: system down'];
    const compressed = engine.compress(logs);
    expect(compressed).toEqual(logs);
  });

  it('handles empty logs array', () => {
    expect(engine.compress([])).toEqual([]);
  });
});
