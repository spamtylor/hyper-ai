#!/usr/bin/env node
class PredictiveDiskAnalyzer {
    analyze(metrics) {
        if (metrics.current_usage < 80) return [];
        const sorted = metrics.container_metrics.slice().sort((a, b) => a.last_accessed - b.last_accessed);
        return sorted.slice(0, 2).map(c => c.id);
    }
}

module.exports = PredictiveDiskAnalyzer;
