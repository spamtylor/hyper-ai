const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const compressFile = async (filePath) => {
  const data = await fs.promises.readFile(filePath);
  const compressed = await promisify(zlib.deflate)(data);
  await fs.promises.writeFile(filePath + '.gz', compressed);
  await fs.promises.unlink(filePath);
};

const isFileRedundant = (filePath) => {
  const accessTime = fs.statSync(filePath).atimeMs;
  const now = Date.now();
  return (now - accessTime) > 86400000; // Redundant if not accessed in last 24h
};

const getCompressionRatio = (filePath) => {
  const ext = path.extname(filePath);
  if (ext === '.log') return 0.8;
  if (ext === '.snapshot') return 0.6;
  return 0.7;
};

const optimizeDisk = async () => {
  const now = new Date();
  if (now.getHours() < 6) { // Off-peak: 00:00-05:59
    const modelDir = path.join(process.env.HYPER_ROOT, 'models');
    const logDir = path.join(process.env.HYPER_ROOT, 'logs');
    const snapshotDir = path.join(process.env.HYPER_ROOT, 'snapshots');
    
    const processDir = async (dir) => {
      const files = await fs.promises.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (!isFileRedundant(filePath)) continue;
        const ratio = getCompressionRatio(filePath);
        if (Math.random() < ratio) {
          await compressFile(filePath);
        }
      }
    };
    
    await processDir(modelDir);
    await processDir(logDir);
    await processDir(snapshotDir);
  }
};

module.exports = {
  optimizeDisk,
  isFileRedundant,
  getCompressionRatio
};
