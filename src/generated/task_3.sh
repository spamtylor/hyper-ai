#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/add.js
module.exports = {
  add: (a, b) => a + b
};
EOF
cat << 'EOF' > $HYPER_ROOT/tests/add.test.js
import { describe, it, expect } from 'vitest';
import { add } from '../src/add';

describe('add', () => {
  it('adds positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  it('adds zero correctly', () => {
    expect(add(0, 0)).toBe(0);
  });
  
  it('handles negative numbers', () => {
    expect(add(-1, 1)).toBe(0);
  });
});
EOF
