const { execSync } = require('child_process');
const os = require('os');

function getProxmoxStatus() {
  try {
    const output = execSync("pvesh get /nodes/titan/status --output-format json").toString().trim();
    const data = JSON.parse(output);
    return {
      cpuModel: data.cpuinfo.model,
      cores: data.cpuinfo.cores,
      threads: data.cpuinfo.cpus,
      ramTotal: Math.round(data.memory.total / 1024 / 1024 / 1024) + 'GB',
      ramUsed: Math.round(data.memory.used / 1024 / 1024 / 1024) + 'GB',
      diskTotal: Math.round(data.rootfs.total / 1024 / 1024 / 1024) + 'GB',
      diskUsed: Math.round(data.rootfs.used / 1024 / 1024 / 1024) + 'GB',
      diskUsage: Math.round((data.rootfs.used / data.rootfs.total) * 100),
      pveVersion: data.pveversion,
      uptime: Math.round(data.uptime / 3600) + 'h'
    };
  } catch (e) {
    return { error: 'Failed to fetch Proxmox status' };
  }
}

function getLxcCount() {
  try {
    const output = execSync("pct list | tail -n +2 | wc -l").toString().trim();
    return parseInt(output);
  } catch (e) {
    return 0;
  }
}

module.exports = {
  getMetrics: () => {
    const status = getProxmoxStatus();
    return {
      ...status,
      lxcCount: getLxcCount(),
      loadAvg: os.loadavg(),
      hostname: os.hostname(),
      timestamp: new Date().toISOString()
    };
  }
};
