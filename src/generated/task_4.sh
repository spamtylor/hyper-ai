#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/memory.js
class Memory {
  constructor() {
    this.store = {};
  }

  set(key, value) {
    this.store[key] = value;
  }

  get(key) {
    return this.store[key];
  }

  delete(key) {
    delete this.store[key];
  }
}

export default Memory;
EOF

cat << 'EOF' > $HYPER_ROOT/tests/memory.test.js
import { describe, it, expect, vi } from 'vitest';
import Memory from '../src/memory';

describe('Memory', () => {
  let memory;

  beforeEach(() => {
    memory = new Memory();
  });

  it('stores and retrieves values correctly', () => {
    memory.set('test', 'value');
    expect(memory.get('test')).toBe('value');
  });

  it('returns undefined for non-existent keys', () => {
    expect(memory.get('missing')).toBeUndefined();
  });

  it('deletes keys successfully', () => {
    memory.set('test', 'value');
    memory.delete('test');
    expect(memory.get('test')).toBeUndefined();
  });

  it('handles multiple keys correctly', () => {
    memory.set('a', 1);
    memory.set('b', 2);
    expect(memory.get('a')).toBe(1);
    expect(memory.get('b')).toBe(2);
    memory.delete('a');
    expect(memory.get('a')).toBeUndefined();
  });
});
EOF
