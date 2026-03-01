#!/bin/bash
echo "Creating src/proactive-disk-optimization.js..."
cat << 'EOF' > $HYPER_ROOT/src/proactive-disk-optimization.js
const { exec } = require('child_process');

async function cleanContainerLogs() {
    return new Promise((resolve, reject) => {
        exec('find /var/log/lxc -type f -mtime +7 -delete', (error, stdout, stderr) => {
            if (error) {
                console.error(`Container logs cleanup error: ${error}`);
                reject(error);
            } else {
                console.log('Container logs cleaned');
                resolve();
            }
        });
    });
}

async function cleanSnapshots() {
    return new Promise((resolve, reject) => {
        exec('find /var/lib/lxd/snapshots -mindepth 2 -type d -mtime +30 -delete', (error, stdout, stderr) => {
            if (error) {
                console.error(`Snapshots cleanup error: ${error}`);
                reject(error);
            } else {
                console.log('Snapshots cleaned');
                resolve();
            }
        });
    });
}

async function cleanCache() {
    return new Promise((resolve, reject) => {
        exec('find /var/cache/lxd -type f -mtime +7 -delete', (error, stdout, stderr) => {
            if (error) {
                console.error(`Cache cleanup error: ${error}`);
                reject(error);
            } else {
                console.log('Cache cleaned');
                resolve();
            }
        });
    });
}

async function runOptimization() {
    console.log("Starting proactive disk optimization...");
    await cleanContainerLogs();
    await cleanSnapshots();
    await cleanCache();
    console.log("Disk optimization completed.");
}

module.exports = {
    runOptimization
};
EOF
echo "Creating tests/proactive-disk-optimization.test.js..."
cat << 'EOF' > $HYPER_ROOT/tests/proactive-disk-optimization.test.js
import { describe, it, expect, vi } from "vitest";
import { cleanContainerLogs, cleanSnapshots, cleanCache } from '../src/proactive-disk-optimization';

describe('Proactive Disk Optimization', () => {
    it('should clean container logs', async () => {
        const execMock = vi.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
            if (command.includes('find /var/log/lxc')) {
                callback(null, 'logs cleaned');
            }
        });
        await cleanContainerLogs();
        expect(execMock).toHaveBeenCalledWith(expect.stringContaining('find /var/log/lxc'), expect.any(Function));
        execMock.mockRestore();
    });

    it('should clean snapshots', async () => {
        const execMock = vi.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
            if (command.includes('find /var/lib/lxd/snapshots')) {
                callback(null, 'snapshots cleaned');
            }
        });
        await cleanSnapshots();
        expect(execMock).toHaveBeenCalledWith(expect.stringContaining('find /var/lib/lxd/snapshots'), expect.any(Function));
        execMock.mockRestore();
    });

    it('should clean cache', async () => {
        const execMock = vi.spyOn(require('child_process'), 'exec').mockImplementation((command, callback) => {
            if (command.includes('find /var/cache/lxd')) {
                callback(null, 'cache cleaned');
            }
        });
        await cleanCache();
        expect(execMock).toHaveBeenCalledWith(expect.stringContaining('find /var/cache/lxd'), expect.any(Function));
        execMock.mockRestore();
    });
});
EOF
