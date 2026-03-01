#!/bin/bash
cat << 'EOF' > "$HYPER_ROOT/src/add.js"
function add(a, b) {
  return a + b;
}
module.exports = { add };
EOF
cat << 'EOF' > "$HYPER_ROOT/tests/add.test.js"
import { describe, it, expect, vi } from 'vitest';
import { add } from '../src/add';

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('adds two negative numbers', () => {
    expect(add(-2, -3)).toBe(-5);
  });

  it('adds positive and negative numbers', () => {
    expect(add(5, -3)).toBe(2);
  });

  it('handles zero', () => {
    expect(add(0, 0)).toBe(0);
    expect(add(10, 0)).toBe(10);
  });
});
EOF
