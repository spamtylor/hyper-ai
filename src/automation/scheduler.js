class HyperScheduler {
    /**
     * Instantiates the scheduler system.
     * @param {Object} [healthSystem] - An optional injected HyperHealth instance.
     */
    constructor(healthSystem = null) {
        this.healthSystem = healthSystem;
        this.tasks = new Map();
    }

    /**
     * Registers a repeating node automation task.
     * @param {string} name - Task name.
     * @param {number} intervalMs - Interval in milliseconds.
     * @param {Function} taskFn - The javascript function or promise to loop.
     */
    registerWorkflow(name, intervalMs, taskFn) {
        if (!name || typeof intervalMs !== 'number' || typeof taskFn !== 'function') {
            throw new Error("Invalid parameters provided to registerWorkflow.");
        }

        if (this.tasks.has(name)) {
            throw new Error(`A workflow with the name ${name} is already registered.`);
        }

        const intervalId = setInterval(async () => {
            try {
                await taskFn();
            } catch (error) {
                console.error(`[HyperScheduler] Error in workflow ${name}:`, error);
            }
        }, intervalMs);

        this.tasks.set(name, intervalId);
        return intervalId;
    }

    /**
     * Stop a running workflow.
     * @param {string} name - Task name.
     */
    stopWorkflow(name) {
        if (this.tasks.has(name)) {
            clearInterval(this.tasks.get(name));
            this.tasks.delete(name);
            return true;
        }
        return false;
    }

    /**
     * Clear all running workflows.
     */
    stopAll() {
        for (const [name, intervalId] of this.tasks.entries()) {
            clearInterval(intervalId);
        }
        this.tasks.clear();
    }

    /**
     * Conducts a health sweep over predefined critical services. Unhealthy services trigger their restart command.
     * @param {Array<{name: string, url: string, restartCommand: string}>} services
     */
    async runHealthSweep(services) {
        if (!this.healthSystem) {
            throw new Error("Cannot run health sweep. HyperHealth module was not injected.");
        }

        if (!Array.isArray(services)) {
            throw new Error("Services must be an array.");
        }

        let healedCount = 0;
        let onlineCount = 0;
        let failedCount = 0;

        for (const svc of services) {
            const isOnline = await this.healthSystem.checkService(svc.url);

            if (isOnline) {
                onlineCount++;
                continue;
            }

            // Attempt healing
            const healed = await this.healthSystem.healService(svc.name, svc.restartCommand);
            if (healed) {
                healedCount++;
            } else {
                failedCount++;
            }
        }

        return {
            onlineCount,
            healedCount,
            failedCount,
            total: services.length
        };
    }
}

module.exports = { HyperScheduler };
