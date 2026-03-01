#!/bin/bash
# BUILD_MANIFEST: src/predictive_disk_optimization.js tests/predictive_disk_optimization.test.js
echo "Creating src/predictive_disk_optimization.js..."
cat << 'EOF' > $HYPER_ROOT/src/predictive_disk_optimization.js
const { exec } = require('child_process');

class PredictiveDiskOptimizer {
  analyzeDiskPatterns() {
    return [70, 72, 75, 78, 80, 82, 84];
  }

  predictSpikes(patterns) {
    const last = patterns[patterns.length - 1];
    const trend = patterns.slice(-3).every((val, i, arr) => i === 0 || val >= arr[i-1]);
    return last > 80 && trend;
  }

  async optimizeDisk() {
    const now = new Date();
    if (now.getHours() >= 2 && now.getHours() < 4) {
      console.log('Optimizing disk during low-activity window...');
      await this.runCommand('logrotate /etc/logrotate.d/app');
      await this.runCommand('rm -rf /tmp/*');
    } else {
      console.log('Not a low-activity window, skipping optimization.');
    }
  }

  async runCommand(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Command failed: ${cmd} - ${error}`);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async run() {
    const patterns = this.analyzeDiskPatterns();
    if (this.predictSpikes(patterns)) {
      await this.optimizeDisk();
    }
  }
}

module.exports = PredictiveDiskOptimizer;
EOF
echo "Creating tests/predictive_disk_optimization.test.js..."
cat << 'EOF' > $HYPER_ROOT/tests/predictive_disk_optimization.test.js
import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import PredictiveDiskOptimizer from '../src/predictive_disk_optimization';

describe('PredictiveDiskOptimizer', () => {
  let optimizer;
  const originalDate = Date;

  beforeEach(() => {
    optimizer = new PredictiveDiskOptimizer();
    Date = class extends originalDate {
      constructor(...args) {
        super(...args);
        return new originalDate(2023, 0, 1, 3, 0, 0, 0); // 3am
      }
    };
  });

  afterEach(() => {
    Date = originalDate;
  });

  it('predicts spike when pattern is above 80% and increasing', () => {
    vi.spyOn(optimizer, 'analyzeDiskPatterns').mockReturnValue([81, 82, 83]);
    expect(optimizer.predictSpikes(optimizer.analyzeDiskPatterns())).toBe(true);
  });

  it('does not predict spike when pattern is not increasing', () => {
    vi.spyOn(optimizer, 'analyzeDiskPatterns').mockReturnValue([80, 79, 78]);
    expect(optimizer.predictSpikes(optimizer.analyzeDiskPatterns())).toBe(false);
  });

  it('optimizes disk during low-activity window', async () => {
    const runCommandMock = vi.spyOn(optimizer, 'runCommand').mockResolvedValue('');
    await optimizer.optimizeDisk();
    expect(runCommandMock).toHaveBeenCalledWith('logrotate /etc/logrotate.d/app');
    expect(runCommandMock).toHaveBeenCalledWith('rm -rf /tmp/*');
  });

  it('does not optimize during non-low-activity window', async () => {
    Date = class extends originalDate {
      constructor(...args) {
        super(...args);
        return new originalDate(2023, 0, 1, 10, 0, 0, 0); // 10am
      }
    };
    const runCommandMock = vi.spyOn(optimizer, 'runCommand');
    await optimizer.optimizeDisk();
    expect(runCommandMock).not.toHaveBeenCalled();
  });

  it('runs optimization when spike predicted', async () => {
    vi.spyOn(optimizer, 'analyzeDiskPatterns').mockReturnValue([81, 82, 83]);
    const optimizeDiskMock = vi.spyOn(optimizer, 'optimizeDisk').mockResolvedValue();
    await optimizer.run();
    expect(optimizeDiskMock).toHaveBeenCalled();
  });

  it('does not run optimization when no spike predicted', async () => {
    vi.spyOn(optimizer, 'analyzeDiskPatterns').mockReturnValue([70, 71, 72]);
    const optimizeDiskMock = vi.spyOn(optimizer, 'optimizeDisk');
    await optimizer.run();
    expect(optimizeDiskMock).not.toHaveBeenCalled();
  });
});
EOF
