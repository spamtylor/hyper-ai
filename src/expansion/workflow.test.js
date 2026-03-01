import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperWorkflow } from './workflow';

describe('Expansion Module: HyperWorkflow', () => {
    let workflow;

    beforeEach(() => {
        workflow = new HyperWorkflow();
    });

    describe('executeScript', () => {
        it('throws an error if workflowSteps is not an array', async () => {
            await expect(workflow.executeScript(null)).rejects.toThrow('executeScript requires an array of workflow steps.');
            await expect(workflow.executeScript("steps")).rejects.toThrow('executeScript requires an array of workflow steps.');
        });

        it('returns initial state immediately if steps array is empty', async () => {
            const state = await workflow.executeScript([], { key: 'value' });
            expect(state).toEqual({ key: 'value' });
        });

        it('throws an error if a step is malformed (missing id or action)', async () => {
            const badStep1 = [{ id: '1' }]; // missing action
            const badStep2 = [{ action: 'wait' }]; // missing id

            await expect(workflow.executeScript(badStep1)).rejects.toThrow("Workflow steps must include a unique 'id' and an 'action' string.");
            await expect(workflow.executeScript(badStep2)).rejects.toThrow("Workflow steps must include a unique 'id' and an 'action' string.");
        });

        it('throws an error if an action is not recognized', async () => {
            const badAction = [{ id: 'step-invalid', action: 'deploy_to_mars' }];
            await expect(workflow.executeScript(badAction)).rejects.toThrow('Action "deploy_to_mars" is not recognized by the workflow engine in step ID [step-invalid].');
        });

        it('executes built-in actions sequentially and augments state', async () => {
            const steps = [
                { id: 'step-1', action: 'sum_values', params: { a: 5, b: 10 } },
                { id: 'step-2', action: 'extract_keyword', params: { text: 'Hello Vitest', word: 'Vitest' } }
            ];

            const initialState = { initial: true };
            const finalState = await workflow.executeScript(steps, initialState);

            // Check state retention
            expect(finalState.initial).toBe(true);

            // Check step 1 calculation
            expect(finalState.last_sum).toBe(15);

            // Check step 2 calculation
            expect(finalState.keyword_found).toBe(true);

            // Check history logging
            expect(finalState._history).toHaveLength(2);
            expect(finalState._history[0].stepId).toBe('step-1');
            expect(finalState._history[1].stepId).toBe('step-2');
        });

        it('handles wait action correctly using fake timers', async () => {
            vi.useFakeTimers();

            const steps = [
                { id: 'wait-step', action: 'wait', params: { ms: 500 } }
            ];

            const promise = workflow.executeScript(steps);

            // Should not resolve yet
            vi.advanceTimersByTime(100);

            // Should resolve after 500
            vi.advanceTimersByTime(400);

            const finalState = await promise;
            expect(finalState.waited).toBe(true);

            vi.useRealTimers();
        });

        it('uses safe fallbacks if params are missing for native actions', async () => {
            const steps = [
                { id: 's1', action: 'sum_values' }, // missing params completely
                { id: 's2', action: 'extract_keyword' }
            ];

            const state = await workflow.executeScript(steps);
            expect(state.last_sum).toBe(0); // fallback to 0 + 0
            expect(state.keyword_found).toBe(true); // default "" contains ""
        });

        it('wraps execution logic errors elegantly with context', async () => {
            // Hot-swap a buggy action to test try-catch wrapper
            workflow.actionRegistry['buggy_action'] = async () => {
                throw new Error("Crash inside action");
            };

            const steps = [
                { id: 'crash-step', action: 'buggy_action' }
            ];

            await expect(workflow.executeScript(steps)).rejects.toThrow("Workflow execution failed at step ID [crash-step]: Crash inside action");
        });
    });
});
