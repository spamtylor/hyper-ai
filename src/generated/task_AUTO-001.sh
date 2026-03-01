#!/bin/bash
cat << 'EOF' > $HYPER_ROOT/src/hyperdrift.js
class HyperDrift {
  constructor() {
    this.lastDataStats = null;
    this.currentConfig = { learningRate: 0.01, hiddenLayers: 2 };
  }

  detectShift(currentStats) {
    if (!this.lastDataStats) {
      this.lastDataStats = currentStats;
      return false;
    }
    const meanDiff = Math.abs(currentStats.mean - this.lastDataStats.mean);
    const stdDiff = Math.abs(currentStats.std - this.lastDataStats.std);
    return meanDiff > 0.1 || stdDiff > 0.05;
  }

  adapt(dataStats) {
    if (this.detectShift(dataStats)) {
      this.currentConfig = {
        learningRate: Math.min(0.1, this.currentConfig.learningRate * 1.2),
        hiddenLayers: Math.min(10, this.currentConfig.hiddenLayers + 1)
      };
    }
    return { ...this.currentConfig };
  }
}

module.exports = HyperDrift;
EOF
cat << 'EOF' > $HYPER_ROOT/tests/hyperdrift.test.js
import { describe, it, expect } from 'vitest';
import HyperDrift from '../src/hyperdrift';

describe('HyperDrift', () => {
  it('initializes with default configuration', () => {
    const drift = new HyperDrift();
    expect(drift.adapt({ mean: 0.5, std: 0.1 })).toEqual({
      learningRate: 0.01,
      hiddenLayers: 2
    });
  });

  it('adapts correctly on data distribution shift', () => {
    const drift = new HyperDrift();
    drift.adapt({ mean: 0.5, std: 0.1 }); // Set initial stats
    const newConfig = drift.adapt({ mean: 0.7, std: 0.2 });
    expect(newConfig).toEqual({
      learningRate: 0.012,
      hiddenLayers: 3
    });
  });

  it('does not adapt without significant shift', () => {
    const drift = new HyperDrift();
    drift.adapt({ mean: 0.5, std: 0.1 });
    const config = drift.adapt({ mean: 0.55, std: 0.12 });
    expect(config).toEqual({
      learningRate: 0.01,
      hiddenLayers: 2
    });
  });

  it('limits learning rate and layer growth', () => {
    const drift = new HyperDrift();
    for (let i = 0; i < 10; i++) {
      drift.adapt({ mean: 0.5 + i*0.05, std: 0.1 + i*0.01 });
    }
    expect(drift.adapt({ mean: 1.0, std: 0.2 })).toEqual({
      learningRate: 0.1,
      hiddenLayers: 10
    });
  });
});
EOF
