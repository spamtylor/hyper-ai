import { describe, it, expect, vi } from "vitest";
import { optimizeDisk } from '../src/smart_disk_optimization.js';
import * as smartOpt from '../src/smart_disk_optimization';

describe('smart_disk_optimization', () => {
    it('should skip during peak hours', () => {
        const originalDate = Date;
        const mockDate = new Date(2023, 0, 1, 10, 0, 0, 0);
        Date = class extends originalDate {
            constructor(...args) {
                return mockDate;
            }
        };

        const result = optimizeDisk();
        expect(result).toBe(0);
        expect(console.log).toHaveBeenCalledWith('Not off-peak hours, skipping disk optimization.');
        Date = originalDate;
    });

    it('should optimize during off-peak hours', () => {
        const originalDate = Date;
        const mockDate = new Date(2023, 0, 1, 5, 0, 0, 0);
        Date = class extends originalDate {
            constructor(...args) {
                return mockDate;
            }
        };

        vi.spyOn(smartOpt, 'removeLogs').mockReturnValue(1000);
        vi.spyOn(smartOpt, 'removeSnapshots').mockReturnValue(5000);
        vi.spyOn(smartOpt, 'removeTempFiles').mockReturnValue(2000);

        const result = optimizeDisk();
        expect(result).toBe(8000);
        expect(console.log).toHaveBeenCalledWith('Optimized disk: saved 8000 bytes');
        Date = originalDate;
    });
});
