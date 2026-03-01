class HyperWorkflow {
    /**
     * Instantiates the Advanced Workflow engine.
     */
    constructor() {
        // A built-in registry of actions this workflow engine can perform natively.
        // It accepts an augmented state object and optional parameters from the step definition.
        this.actionRegistry = {
            'sum_values': async (state, params) => {
                const a = params?.a ?? 0;
                const b = params?.b ?? 0;
                state['last_sum'] = a + b;
                return state;
            },
            'extract_keyword': async (state, params) => {
                const text = params?.text ?? "";
                const word = params?.word ?? "";
                state['keyword_found'] = text.includes(word);
                return state;
            },
            'wait': async (state, params) => {
                const ms = params?.ms ?? 100;
                await new Promise(resolve => setTimeout(resolve, ms));
                state['waited'] = true;
                return state;
            }
        };
    }

    /**
     * Executes a directed sequence of steps, passing the accumulated state between them.
     * @param {Array<Object>} workflowSteps - The array of steps: [{ id, action, params }]
     * @param {Object} initialState - Optional seed context data.
     * @returns {Promise<Object>} The final mutated state object.
     */
    async executeScript(workflowSteps, initialState = {}) {
        if (!Array.isArray(workflowSteps)) {
            throw new Error("executeScript requires an array of workflow steps.");
        }

        // Clone initial state to avoid mutating references blindly
        let currentState = { ...initialState };

        for (const step of workflowSteps) {
            if (!step.id || !step.action) {
                throw new Error("Workflow steps must include a unique 'id' and an 'action' string.");
            }

            const handler = this.actionRegistry[step.action];

            if (!handler) {
                throw new Error(`Action "${step.action}" is not recognized by the workflow engine in step ID [${step.id}].`);
            }

            try {
                // Execute step and overwrite current state with the mutated output
                currentState = await handler(currentState, step.params);

                // Track execution history
                if (!currentState._history) {
                    currentState._history = [];
                }
                currentState._history.push({ stepId: step.id, timestamp: new Date().toISOString() });
            } catch (error) {
                // Append the step failure context to the error before throwing upwards
                throw new Error(`Workflow execution failed at step ID [${step.id}]: ${error.message}`);
            }
        }

        return currentState;
    }
}

module.exports = { HyperWorkflow };
