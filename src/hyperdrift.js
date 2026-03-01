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
