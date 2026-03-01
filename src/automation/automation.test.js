import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperHealth } from './health';
import { HyperScheduler } from './scheduler';

describe('Automation Module', () => {

    describe('HyperHealth', () => {
        let health;
        let fetchSpy;

        beforeEach(() => {
            vi.clearAllMocks();
            health = new HyperHealth();
            fetchSpy = vi.spyOn(global, 'fetch');
        });

        afterEach(() => {
            fetchSpy.mockRestore();
        });

        describe('checkService', () => {
            it('throws error for invalid URLs', async () => {
                await expect(health.checkService(null)).rejects.toThrow();
                await expect(health.checkService('invalid_url')).rejects.toThrow();
            });

            it('returns true when service responds with OK', async () => {
                fetchSpy.mockResolvedValueOnce({ ok: true });
                const isOnline = await health.checkService('http://localhost:3000');
                expect(isOnline).toBe(true);
            });

            it('returns false when service responds with non-OK', async () => {
                fetchSpy.mockResolvedValueOnce({ ok: false });
                const isOnline = await health.checkService('http://localhost:3000');
                expect(isOnline).toBe(false);
            });

            it('returns false when fetch throws (network error)', async () => {
                fetchSpy.mockRejectedValueOnce(new Error('ECONNREFUSED'));
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                const isOnline = await health.checkService('http://localhost:3000');
                expect(isOnline).toBe(false);

                consoleSpy.mockRestore();
            });
        });

        describe('healService', () => {
            // Need to mock child_process.exec from health.js.
            // Node core modules are mocked differently in vitest (via vi.mock)
            // We will use a mock child_process.exec for our tests
            it('throws an error if missing parameters', async () => {
                await expect(health.healService(null, 'reboot')).rejects.toThrow();
                await expect(health.healService('Service', null)).rejects.toThrow();
            });
        });
    });

    describe('HyperScheduler', () => {
        let scheduler;

        beforeEach(() => {
            vi.clearAllMocks();
            vi.useFakeTimers();
            scheduler = new HyperScheduler(new HyperHealth());
        });

        afterEach(() => {
            vi.useRealTimers();
            scheduler.stopAll();
        });

        describe('Workflows', () => {
            it('throws error for invalid parameters', () => {
                expect(() => scheduler.registerWorkflow(null, 1000, () => { })).toThrow();
                expect(() => scheduler.registerWorkflow('test', '1000', () => { })).toThrow();
            });

            it('prevents registering duplicate workflow names', () => {
                scheduler.registerWorkflow('test', 1000, () => { });
                expect(() => scheduler.registerWorkflow('test', 1000, () => { })).toThrow();
            });

            it('executes task repeatedly on interval', async () => {
                const mockTask = vi.fn();
                scheduler.registerWorkflow('test-timer', 1000, mockTask);

                // Fast forward 3 seconds
                await vi.advanceTimersByTimeAsync(3000);

                expect(mockTask).toHaveBeenCalledTimes(3);
            });

            it('catches and logs errors thrown inside tasks', async () => {
                const mockTask = vi.fn().mockRejectedValue(new Error('Task crashed'));
                const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

                scheduler.registerWorkflow('crash-timer', 1000, mockTask);
                await vi.advanceTimersByTimeAsync(1500);

                expect(mockTask).toHaveBeenCalledTimes(1);
                expect(consoleSpy).toHaveBeenCalled();

                consoleSpy.mockRestore();
            });

            it('can stop a single specific workflow', async () => {
                const mockTask = vi.fn();
                scheduler.registerWorkflow('stop-me', 1000, mockTask);

                await vi.advanceTimersByTimeAsync(1500); // 1 call

                const stopped = scheduler.stopWorkflow('stop-me');
                expect(stopped).toBe(true);

                await vi.advanceTimersByTimeAsync(2000); // no more calls
                expect(mockTask).toHaveBeenCalledTimes(1);
            });

            it('fails to stop a missing workflow', () => {
                expect(scheduler.stopWorkflow('nada')).toBe(false);
            });
        });

        describe('runHealthSweep', () => {
            it('throws if trying to sweep without HyperHealth module loaded', async () => {
                const detachedScheduler = new HyperScheduler();
                await expect(detachedScheduler.runHealthSweep([])).rejects.toThrow();
            });

            it('throws if invalid parameter format passed', async () => {
                await expect(scheduler.runHealthSweep(null)).rejects.toThrow();
            });

            it('sweeps a healthy service without restarting', async () => {
                const services = [{ name: 'Service1', url: 'http://a', restartCommand: 'echo' }];
                scheduler.healthSystem.checkService = vi.fn().mockResolvedValue(true);
                scheduler.healthSystem.healService = vi.fn();

                const results = await scheduler.runHealthSweep(services);

                expect(results.onlineCount).toBe(1);
                expect(results.healedCount).toBe(0);
                expect(results.failedCount).toBe(0);
                expect(results.total).toBe(1);

                expect(scheduler.healthSystem.healService).not.toHaveBeenCalled();
            });

            it('sweeps an offline service and attempts a restart and succeeds', async () => {
                const services = [{ name: 'Service1', url: 'http://a', restartCommand: 'echo' }];
                scheduler.healthSystem.checkService = vi.fn().mockResolvedValue(false);
                scheduler.healthSystem.healService = vi.fn().mockResolvedValue(true);

                const results = await scheduler.runHealthSweep(services);

                expect(results.onlineCount).toBe(0);
                expect(results.healedCount).toBe(1);
                expect(scheduler.healthSystem.healService).toHaveBeenCalledWith('Service1', 'echo');
            });

            it('sweeps an offline service but fails to restart', async () => {
                const services = [{ name: 'Service1', url: 'http://a', restartCommand: 'echo' }];
                scheduler.healthSystem.checkService = vi.fn().mockResolvedValue(false);
                scheduler.healthSystem.healService = vi.fn().mockResolvedValue(false);

                const results = await scheduler.runHealthSweep(services);

                expect(results.onlineCount).toBe(0);
                expect(results.failedCount).toBe(1);
            });
        });
    });
});
