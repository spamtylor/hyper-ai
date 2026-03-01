import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperCoordinator } from './multi-agent';

describe('Expansion Module: HyperCoordinator', () => {
    let coordinator;

    beforeEach(() => {
        // Mock Math.random to always succeed in normal tests to avoid flaky tests
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        vi.useFakeTimers(); // Speed up the simulated async delays

        coordinator = new HyperCoordinator(['researcher', 'coder', 'reviewer']);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Initialization', () => {
        it('throws an error if availableRoles is not an array', () => {
            expect(() => new HyperCoordinator(null)).toThrow('availableRoles must be an array of strings.');
            expect(() => new HyperCoordinator("researcher")).toThrow('availableRoles must be an array of strings.');
        });

        it('instantiates correctly with roles and normalizes them', () => {
            const coord = new HyperCoordinator(['REseArchEr', 'CODER']);
            expect(coord.roles.has('researcher')).toBe(true);
            expect(coord.roles.has('coder')).toBe(true);
        });

        it('defaults to an empty set of roles if none provided', () => {
            const coord = new HyperCoordinator();
            expect(coord.roles.size).toBe(0);
        });
    });

    describe('delegateTask', () => {
        it('throws an error for invalid role input', async () => {
            await expect(coordinator.delegateTask(null, "task")).rejects.toThrow('A valid role string is required to delegate a task.');
        });

        it('throws an error for invalid task input', async () => {
            await expect(coordinator.delegateTask("coder", null)).rejects.toThrow('A valid taskDescription string is required.');
        });

        it('throws an error if the requested role is not supported', async () => {
            await expect(coordinator.delegateTask("hacker", "Hack the mainframe")).rejects.toThrow('Role "hacker" is not supported by this coordinator.');
        });

        it('simulates throwing an error if the agent fails (random chance)', async () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01); // Force failure ( < 0.05 )

            const promise = coordinator.delegateTask("coder", "Write a loop");
            vi.advanceTimersByTime(100);

            await expect(promise).rejects.toThrow('Agent [coder] failed to process the task: LLM hallucination or timeout.');
        });

        it('resolves with the agent output successfully', async () => {
            const promise = coordinator.delegateTask("researcher", "Find the specs for HTTP/3");

            // Advance fake timers to resolve the 100ms simulated wait
            vi.advanceTimersByTime(100);

            const result = await promise;

            expect(result.role).toBe('researcher');
            expect(result.status).toBe('completed');
            expect(result.task).toBe("Find the specs for HTTP/3");
            expect(result.result).toContain("Simulated successful output");
        });
    });

    describe('runSwarm', () => {
        it('throws an error if swarmTasks is not an array', async () => {
            await expect(coordinator.runSwarm(null)).rejects.toThrow('runSwarm requires an array of task objects.');
        });

        it('returns early with a 0 summary if the swarm array is empty', async () => {
            const summary = await coordinator.runSwarm([]);
            expect(summary.total).toBe(0);
            expect(summary.results).toEqual([]);
        });

        it('handles malformed task objects gracefully within the swarm', async () => {
            const swarm = [
                { role: "coder" } // Missing task
            ];

            const promise = coordinator.runSwarm(swarm);
            vi.advanceTimersByTime(100);

            const summary = await promise;
            expect(summary.failed).toBe(1);
            expect(summary.results[0].success).toBe(false);
            expect(summary.results[0].error).toContain("Mangeformed swarm task object.");
        });

        it('executes a swarm concurrently and aggregates successful results', async () => {
            const swarm = [
                { role: "researcher", task: "Find APIs" },
                { role: "coder", task: "Build the script" },
                { role: "reviewer", task: "Check the code" }
            ];

            const promise = coordinator.runSwarm(swarm);
            vi.advanceTimersByTime(100);

            const summary = await promise;

            expect(summary.total).toBe(3);
            expect(summary.successful).toBe(3);
            expect(summary.failed).toBe(0);
            expect(summary.results).toHaveLength(3);

            expect(summary.results[0].data.role).toBe('researcher');
            expect(summary.results[1].data.role).toBe('coder');
            expect(summary.results[2].data.role).toBe('reviewer');
        });

        it('aggregates a mix of successful and failed swarm tasks', async () => {
            const swarm = [
                { role: "researcher", task: "Find APIs" }, // Success
                { role: "hacker", task: "Invalid role" },  // Failure
            ];

            const promise = coordinator.runSwarm(swarm);
            vi.advanceTimersByTime(100);

            const summary = await promise;

            expect(summary.total).toBe(2);
            expect(summary.successful).toBe(1);
            expect(summary.failed).toBe(1);

            expect(summary.results[0].success).toBe(true);
            expect(summary.results[0].data.role).toBe('researcher');

            expect(summary.results[1].success).toBe(false);
            expect(summary.results[1].error).toContain('not supported');
        });
    });
});
