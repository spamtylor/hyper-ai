#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/math.js
/**
 * Adds two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b;
}

/**
 * Multiplies two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Product of a and b
 */
function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
EOF

cat << 'EOF' > $HYPER_ROOT/tests/math.test.js
import { describe, it, expect, vi } from 'vitest';
import { add, multiply } from '../src/math';

describe('math module', () => {
  describe('add', () => {
    it('adds positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('adds negative numbers', () => {
      expect(add(-2, -3)).toBe(-5);
    });

    it('adds zero', () => {
      expect(add(0, 0)).toBe(0);
    });
  });

  describe('multiply', () => {
    it('multiplies positive numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('multiplies negative numbers', () => {
      expect(multiply(-2, 3)).toBe(-6);
    });

    it('multiplies with zero', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });
});
EOF
