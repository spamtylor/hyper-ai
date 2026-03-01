class PredictiveResourceReshaper {
  constructor() {
    this.history = [];
  }

  analyzePatterns(containerId) {
    const sample = this.history.find(h => h.containerId === containerId);
    if (!sample) return { cpu: 0.5, memory: 0.6 };
    return {
      cpu: Math.min(0.9, sample.cpu * 1.2),
      memory: Math.min(0.95, sample.memory * 1.15)
    };
  }

  resizeResources(containerId, newCpu, newMemory) {
    if (newCpu < 0.1 || newMemory < 0.1) {
      throw new Error('Invalid resource values');
    }
    return { containerId, cpu: newCpu, memory: newMemory, success: true };
  }

  recordMetrics(containerId, cpu, memory) {
    const existing = this.history.find(h => h.containerId === containerId);
    if (existing) {
      existing.cpu = (existing.cpu * 0.7) + (cpu * 0.3);
      existing.memory = (existing.memory * 0.7) + (memory * 0.3);
    } else {
      this.history.push({ containerId, cpu, memory });
    }
  }
}

module.exports = PredictiveResourceReshaper;
