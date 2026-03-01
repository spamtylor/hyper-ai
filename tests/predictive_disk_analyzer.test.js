import { describe, it, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import PredictiveDiskAnalyzer from '../src/predictive_disk_analyzer.js';

describe('PredictiveDiskAnalyzer', () => {
    let analyzer;
    
    beforeEach(() => {
        analyzer = new PredictiveDiskAnalyzer();
    });

    it('returns empty array when current_usage < 80', () => {
        const metrics = {
            current_usage: 79,
            container_metrics: [
                { id: 'c1', last_accessed: 1000 },
                { id: 'c2', last_accessed: 2000 }
            ]
        };
        expect(analyzer.analyze(metrics)).toEqual([]);
    });

    it('returns two oldest containers when current_usage >= 80', () => {
        const metrics = {
            current_usage: 80,
            container_metrics: [
                { id: 'c3', last_accessed: 500 },
                { id: 'c1', last_accessed: 1000 },
                { id: 'c2', last_accessed: 2000 }
            ]
        };
        expect(analyzer.analyze(metrics)).toEqual(['c3', 'c1']);
    });
});
