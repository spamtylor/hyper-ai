import { describe, it, expect, beforeEach } from 'vitest';
import { HyperImprovement } from './improvement';

describe('Intelligence Module: HyperImprovement', () => {
    let improvement;

    beforeEach(() => {
        improvement = new HyperImprovement();
    });

    describe('evaluateTaskLogs', () => {
        it('throws an error if input is not an array', () => {
            expect(() => improvement.evaluateTaskLogs(null)).toThrow('evaluateTaskLogs requires an array of log objects.');
            expect(() => improvement.evaluateTaskLogs({})).toThrow('evaluateTaskLogs requires an array of log objects.');
            expect(() => improvement.evaluateTaskLogs('logs')).toThrow('evaluateTaskLogs requires an array of log objects.');
        });

        it('handles an empty log array perfectly', () => {
            const result = improvement.evaluateTaskLogs([]);
            expect(result.total).toBe(0);
            expect(result.successCount).toBe(0);
            expect(result.successRate).toBe(100);
            expect(result.commonErrors).toEqual({});
        });

        it('calculates 100% success rate correctly', () => {
            const logs = [
                { id: 1, success: true },
                { id: 2, success: true }
            ];
            const result = improvement.evaluateTaskLogs(logs);

            expect(result.total).toBe(2);
            expect(result.successCount).toBe(2);
            expect(result.successRate).toBe(100);
            expect(result.commonErrors).toEqual({});
        });

        it('categorizes network errors correctly', () => {
            const logs = [
                { id: 1, success: false, error: "Network timeout after 5000ms" },
                { id: 2, success: false, error: "Failed to fetch data from API" },
                { id: 3, success: true }
            ];

            const result = improvement.evaluateTaskLogs(logs);
            expect(result.successCount).toBe(1);
            expect(result.successRate).toBe(33.33);
            expect(result.commonErrors['Network/Timeout']).toBe(2);
        });

        it('categorizes permission errors correctly', () => {
            const logs = [
                { id: 1, success: false, error: "Permission denied for /tmp/file" }
            ];

            const result = improvement.evaluateTaskLogs(logs);
            expect(result.commonErrors['Permissions/Access']).toBe(1);
        });

        it('categorizes syntax errors correctly', () => {
            const logs = [
                { id: 1, success: false, error: "Unexpected token in JSON at position 0" }
            ];

            const result = improvement.evaluateTaskLogs(logs);
            expect(result.commonErrors['Parsing/Syntax']).toBe(1);
        });

        it('handles unknown errors and truncates long ones', () => {
            const longError = "A".repeat(100);
            const logs = [
                { id: 1, success: false }, // Missing error string
                { id: 2, success: false, error: "Weird rare error" },
                { id: 3, success: false, error: longError }
            ];

            const result = improvement.evaluateTaskLogs(logs);

            expect(result.commonErrors['Unknown Error']).toBe(1);
            expect(result.commonErrors['Weird rare error']).toBe(1);

            const truncatedKey = Object.keys(result.commonErrors).find(k => k.startsWith('A') && k.endsWith('...'));
            expect(truncatedKey).toBeDefined();
            expect(truncatedKey.length).toBe(50); // 47 chars + "..."
        });
    });

    describe('generateImprovementPlan', () => {
        it('throws an error for invalid evaluation input', () => {
            expect(() => improvement.generateImprovementPlan(null)).toThrow('generateImprovementPlan requires a valid evaluation object.');
            expect(() => improvement.generateImprovementPlan({})).toThrow('generateImprovementPlan requires a valid evaluation object.');
        });

        it('returns praise for 100% success rate', () => {
            const evaluation = { total: 5, successRate: 100 };
            const plan = improvement.generateImprovementPlan(evaluation);

            expect(plan).toHaveLength(1);
            expect(plan[0]).toContain("Maintain current operational parameters");
        });

        it('requests more data if total is 0', () => {
            const evaluation = { total: 0, successRate: 100 };
            const plan = improvement.generateImprovementPlan(evaluation);

            expect(plan).toHaveLength(1);
            expect(plan[0]).toContain("Insufficient data");
        });

        it('triggers a critical warning if success rate is below 50%', () => {
            const evaluation = {
                total: 10,
                successRate: 40,
                commonErrors: { 'Network/Timeout': 6 }
            };

            const plan = improvement.generateImprovementPlan(evaluation);

            expect(plan).toContain("CRITICAL: Success rate is below 50%. A full system diagnostic is recommended.");
            // Should also include the specific network fix logic
            expect(plan.some(p => p.includes("exponential backoff"))).toBe(true);
        });

        it('addresses Permissions/Access errors', () => {
            const evaluation = {
                total: 10,
                successRate: 90,
                commonErrors: { 'Permissions/Access': 1 }
            };

            const plan = improvement.generateImprovementPlan(evaluation);
            expect(plan.some(p => p.includes("Verify API keys and filesystem directory ownership"))).toBe(true);
        });

        it('addresses Parsing/Syntax errors', () => {
            const evaluation = {
                total: 10,
                successRate: 90,
                commonErrors: { 'Parsing/Syntax': 1 } // 1/10 = 10% which meets criteria
            };

            const plan = improvement.generateImprovementPlan(evaluation);
            expect(plan.some(p => p.includes("Introduce stricter data validation"))).toBe(true);
        });

        it('addresses unknown specific errors', () => {
            const evaluation = {
                total: 10,
                successRate: 90,
                commonErrors: { 'Custom Database Crash': 1 }
            };

            const plan = improvement.generateImprovementPlan(evaluation);
            expect(plan.some(p => p.includes('Investigate frequent error: "Custom Database Crash"'))).toBe(true);
        });

        it('ignores insignificant errors (< 10%) but offers generic fallback', () => {
            const evaluation = {
                total: 100,
                successRate: 98,
                commonErrors: { 'Minor Lag': 1, 'Weird State': 1 }
            };

            const plan = improvement.generateImprovementPlan(evaluation);

            expect(plan).toHaveLength(1);
            expect(plan[0]).toContain("Review execution logs closely to identify subtle inefficiencies");
        });
    });
});
