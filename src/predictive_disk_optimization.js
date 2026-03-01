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
