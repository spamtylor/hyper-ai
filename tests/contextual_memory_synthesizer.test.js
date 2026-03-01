import { describe, it, expect, vi } from 'vitest';
import ContextualMemorySynthesizer from '../src/contextual_memory_synthesizer';

describe('ContextualMemorySynthesizer', () => {
  let synthesizer;
  const SESSION_ID = 'user123';

  beforeEach(() => {
    synthesizer = new ContextualMemorySynthesizer();
  });

  it('adds interactions to memory', () => {
    const timestamp = Date.now();
    synthesizer.addInteraction(SESSION_ID, 'Test content', timestamp);
    expect(synthesizer.memory.get(SESSION_ID)).toEqual([{ timestamp, content: 'Test content' }]);
  });

  it('prioritizes recent interactions', () => {
    const oldTimestamp = Date.now() - 10000;
    const recentTimestamp = Date.now() - 1000;
    synthesizer.addInteraction(SESSION_ID, 'Old content', oldTimestamp);
    synthesizer.addInteraction(SESSION_ID, 'Recent content', recentTimestamp);
    const context = synthesizer.getRelevantContext(SESSION_ID, 'Test');
    expect(context).toEqual(['Recent content', 'Old content']);
  });

  it('uses semantic similarity for relevance', () => {
    synthesizer.addInteraction(SESSION_ID, 'Hello world', Date.now());
    synthesizer.addInteraction(SESSION_ID, 'Hi there', Date.now());
    const context = synthesizer.getRelevantContext(SESSION_ID, 'Hello');
    expect(context).toEqual(['Hello world', 'Hi there']);
  });

  it('handles empty memory correctly', () => {
    expect(synthesizer.getRelevantContext('nonexistent', 'Test')).toEqual([]);
  });

  it('limits context size', () => {
    for (let i = 0; i < 10; i++) {
      synthesizer.addInteraction(SESSION_ID, `Content ${i}`, Date.now() - i * 1000);
    }
    const context = synthesizer.getRelevantContext(SESSION_ID, 'Test', 3);
    expect(context.length).toBe(3);
  });
});
