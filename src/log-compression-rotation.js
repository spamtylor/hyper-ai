const path = require('path');
const fs = require('fs');
const util = require('util');
const { exec } = require('child_process');

async function getDiskUsage() {
  try {
    const { stdout } = await util.promisify(exec)('df -h /');
    const lines = stdout.split('\n');
    const dataLine = lines[1];
    if (!dataLine) return 0;
    const parts = dataLine.split(/\s+/);
    const usagePercent = parseInt(parts[4], 10);
    return usagePercent;
  } catch {
    return 0;
  }
}

async function compressOldLogs(logDir = '/var/log/containers', compressedDir = '/var/log/containers/compressed') {
  const diskUsage = await getDiskUsage();
  if (diskUsage > 80) {
    console.log(`Disk usage ${diskUsage}%, skipping compression`);
    return;
  }

  if (!fs.existsSync(compressedDir)) {
    fs.mkdirSync(compressedDir, { recursive: true });
  }

  const files = fs.readdirSync(logDir);
  for (const file of files) {
    const filePath = path.join(logDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile() && stats.mtimeMs < Date.now() - 30 * 24 * 60 * 60 * 1000) {
      const compressedPath = path.join(compressedDir, `${file}.gz`);
      try {
        await util.promisify(exec)(`gzip -c "${filePath}" > "${compressedPath}"`);
        fs.unlinkSync(filePath);
      } catch {
        console.error(`Failed to compress ${filePath}`);
      }
    }
  }
}

module.exports = { compressOldLogs };
