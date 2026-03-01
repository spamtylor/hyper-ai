const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class DiskSpaceOptimizer {
  constructor() {
    this.lastCheck = 0;
    this.threshold = 85;
  }

  async getDiskUsage() {
    const { stdout } = await execAsync('df -h / | tail -1 | awk \'{print $5}\' | tr -d \'%\'' );
    return parseInt(stdout.trim(), 10);
  }

  async optimizeDiskSpace() {
    const usage = await this.getDiskUsage();
    if (usage < 85) {
      const { stdout } = await execAsync('find /var/log/ -name "*.log" -type f -mtime +7 -delete; find /tmp/ -type f -mtime +1 -delete');
      return {
        freed: stdout ? parseInt(stdout.length / 1024, 10) : 0,
        details: ['Log cleanup', 'Temporary file removal']
      };
    }
    return { freed: 0, details: [] };
  }

  getAlertStatus() {
    return this.getDiskUsage().then(usage => {
      if (usage >= 85) return 'critical';
      if (usage >= 80) return 'warning';
      return 'ok';
    });
  }

  async isLowActivity() {
    const usage = await this.getDiskUsage();
    return usage > 70;
  }
}

module.exports = DiskSpaceOptimizer;
