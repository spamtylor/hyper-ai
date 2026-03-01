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
