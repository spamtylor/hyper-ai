#!/bin/bash
mkdir -p $HYPER_ROOT/src/monitor
cat << 'EOF' > $HYPER_ROOT/src/monitor/telemetry.js
const os = require('os');
module.exports = {
  cpuLoad: os.loadavg()[0],
  freeMemory: os.freemem(),
  uptime: os.uptime()
};
EOF
cat << 'EOF' > $HYPER_ROOT/src/monitor/telemetry.test.js
import { describe, it, expect } from 'vitest';
import telemetry from './telemetry';

describe('telemetry', () => {
  it('should return telemetry data', () => {
    expect(telemetry).toHaveProperty('cpuLoad');
  });
});
EOF
