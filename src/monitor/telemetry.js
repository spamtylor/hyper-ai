const os = require('os');
module.exports = {
  cpuLoad: os.loadavg()[0],
  freeMemory: os.freemem(),
  uptime: os.uptime()
};
