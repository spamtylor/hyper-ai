class HyperCoordinator {
    /**
     * Instantiates the multi-agent coordinator system.
     * @param {Array<string>} availableRoles - Array of supported agent roles (e.g., ['researcher', 'coder']).
     */
    constructor(availableRoles = []) {
        if (!Array.isArray(availableRoles)) {
            throw new Error("availableRoles must be an array of strings.");
        }
        this.roles = new Set(availableRoles.map(r => r.toLowerCase()));
    }

    /**
     * Simulates dispatching a task to a specific sub-agent.
     * @param {string} role - The sub-agent role to handle the task.
     * @param {string} taskDescription - The description of the task.
     * @returns {Promise<Object>} An object containing the role, status, and mocked result data.
     */
    async delegateTask(role, taskDescription) {
        if (!role || typeof role !== 'string') {
            throw new Error("A valid role string is required to delegate a task.");
        }

        if (!taskDescription || typeof taskDescription !== 'string') {
            throw new Error("A valid taskDescription string is required.");
        }

        const normalizedRole = role.toLowerCase();

        if (!this.roles.has(normalizedRole)) {
            throw new Error(`Role "${role}" is not supported by this coordinator.`);
        }

        // Simulate async LLM sub-agent thinking time
        await new Promise(resolve => setTimeout(resolve, 100));

        // Simulate random failure gracefully (e.g., 5% chance the agent fails to understand)
        if (Math.random() < 0.05) {
            throw new Error(`Agent [${normalizedRole}] failed to process the task: LLM hallucination or timeout.`);
        }

        return {
            role: normalizedRole,
            status: 'completed',
            task: taskDescription,
            result: `Simulated successful output for: ${taskDescription.substring(0, 20)}...`
        };
    }

    /**
     * Accepts an array of { role, task } objects and executes them concurrently.
     * @param {Array<Object>} swarmTasks - The tasks for the multi-agent swarm.
     * @returns {Promise<Object>} An aggregated summary of the swarm execution.
     */
    async runSwarm(swarmTasks) {
        if (!Array.isArray(swarmTasks)) {
            throw new Error("runSwarm requires an array of task objects.");
        }

        if (swarmTasks.length === 0) {
            return {
                total: 0,
                successful: 0,
                failed: 0,
                results: []
            };
        }

        // Create the promise array for Promise.allSettled
        const promises = swarmTasks.map(st => {
            if (!st.role || !st.task) {
                return Promise.reject(new Error("Mangeformed swarm task object. Requires 'role' and 'task' parameters."));
            }
            return this.delegateTask(st.role, st.task);
        });

        const settledResults = await Promise.allSettled(promises);

        let successfulCount = 0;
        let failedCount = 0;
        const results = [];

        for (const outcome of settledResults) {
            if (outcome.status === 'fulfilled') {
                successfulCount++;
                results.push({
                    success: true,
                    data: outcome.value
                });
            } else {
                failedCount++;
                results.push({
                    success: false,
                    error: outcome.reason.message
                });
            }
        }

        return {
            total: swarmTasks.length,
            successful: successfulCount,
            failed: failedCount,
            results
        };
    }
}

module.exports = { HyperCoordinator };
