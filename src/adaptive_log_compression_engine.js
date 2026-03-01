class AdaptiveLogCompressionEngine {
  constructor() {
    this.criticalPatterns = [/ERROR/, /CRITICAL/];
  }

  compress(logs) {
    const nonCriticalLogs = {};
    const criticalLogs = [];

    for (const log of logs) {
      if (this.isCritical(log)) {
        criticalLogs.push(log);
      } else {
        nonCriticalLogs[log] = (nonCriticalLogs[log] || 0) + 1;
      }
    }

    const compressedLogs = [];
    for (const [log, count] of Object.entries(nonCriticalLogs)) {
      compressedLogs.push(`${log} (x${count})`);
    }
    return [...criticalLogs, ...compressedLogs];
  }

  isCritical(log) {
    return this.criticalPatterns.some(pattern => pattern.test(log));
  }
}

export default AdaptiveLogCompressionEngine;
