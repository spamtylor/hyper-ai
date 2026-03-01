class HyperImprovement {
    /**
     * Evaluates an array of task logs to compute a success rate and categorize failures.
     * @param {Array<Object>} logs - Array of task log objects. Expected format: { id, success: boolean, error?: string }
     * @returns {Object} Evaluation metrics including total, successRate, and commonErrors.
     */
    evaluateTaskLogs(logs) {
        if (!Array.isArray(logs)) {
            throw new Error("evaluateTaskLogs requires an array of log objects.");
        }

        if (logs.length === 0) {
            return {
                total: 0,
                successCount: 0,
                successRate: 100, // No failure means perfect baseline
                commonErrors: {}
            };
        }

        let successCount = 0;
        const errorCounts = {};

        for (const log of logs) {
            if (log.success) {
                successCount++;
            } else if (log.error && typeof log.error === 'string') {
                // Extremely basic NLP: normalize the error string to find common categories
                const lowerError = log.error.toLowerCase();
                let category = "Unknown Error";

                if (lowerError.includes('network') || lowerError.includes('timeout') || lowerError.includes('fetch')) {
                    category = 'Network/Timeout';
                } else if (lowerError.includes('permission') || lowerError.includes('access')) {
                    category = 'Permissions/Access';
                } else if (lowerError.includes('parse') || lowerError.includes('json') || lowerError.includes('syntax')) {
                    category = 'Parsing/Syntax';
                } else {
                    // Truncate unknown errors to prevent massive keys
                    category = log.error.length > 50 ? log.error.substring(0, 47) + '...' : log.error;
                }

                errorCounts[category] = (errorCounts[category] || 0) + 1;
            } else {
                errorCounts["Unknown Error"] = (errorCounts["Unknown Error"] || 0) + 1;
            }
        }

        const successRate = (successCount / logs.length) * 100;

        return {
            total: logs.length,
            successCount,
            successRate: Number(successRate.toFixed(2)),
            commonErrors: errorCounts
        };
    }

    /**
     * Synthesizes actionable improvement plans based on evaluated metrics.
     * @param {Object} evaluation - The output from evaluateTaskLogs.
     * @returns {Array<string>} An array of actionable rules or focus areas for the agent.
     */
    generateImprovementPlan(evaluation) {
        if (!evaluation || typeof evaluation !== 'object' || !('successRate' in evaluation)) {
            throw new Error("generateImprovementPlan requires a valid evaluation object.");
        }

        const plan = [];

        // Reward perfect execution
        if (evaluation.successRate === 100 && evaluation.total > 0) {
            plan.push("Maintain current operational parameters. Execution is optimal.");
            return plan;
        }

        if (evaluation.total === 0) {
            plan.push("Insufficient data to generate an improvement plan. Increase task volume.");
            return plan;
        }

        // Generic drop-rate warning
        if (evaluation.successRate < 50) {
            plan.push("CRITICAL: Success rate is below 50%. A full system diagnostic is recommended.");
        }

        // Target specific error categories
        if (evaluation.commonErrors) {
            const errors = Object.entries(evaluation.commonErrors);

            // Sort by most frequent error
            errors.sort((a, b) => b[1] - a[1]);

            for (const [category, count] of errors) {
                // Only address significant errors (e.g., > 10% of total tasks or most frequent)
                if (count >= evaluation.total * 0.1 || errors.length === 1) {
                    switch (category) {
                        case 'Network/Timeout':
                            plan.push(`Address Network/Timeout issues (${count} occurrences): Implement exponential backoff for external API calls and increase default timeout thresholds.`);
                            break;
                        case 'Permissions/Access':
                            plan.push(`Address Permissions/Access issues (${count} occurrences): Verify API keys and filesystem directory ownership before task execution.`);
                            break;
                        case 'Parsing/Syntax':
                            plan.push(`Address Parsing/Syntax issues (${count} occurrences): Introduce stricter data validation and fallback parsing layers for unexpected inputs.`);
                            break;
                        default:
                            plan.push(`Investigate frequent error: "${category}" (${count} occurrences). Consider adding specific error handling for this edge case.`);
                            break;
                    }
                }
            }
        }

        if (plan.length === 0) {
            plan.push("Review execution logs closely to identify subtle inefficiencies not caught by categorization.");
        }

        return plan;
    }
}

module.exports = { HyperImprovement };
