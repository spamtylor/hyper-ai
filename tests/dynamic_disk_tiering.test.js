import { describe, it, expect, vi } from "vitest";
import { DynamicDiskTiering } from '../src/dynamic_disk_tiering';

describe('DynamicDiskTiering', () => {
    it('initializes with empty tiers and access patterns', () => {
        const tiering = new DynamicDiskTiering();
        expect(tiering.tiers.hot.size).toBe(0);
        expect(tiering.tiers.warm.size).toBe(0);
        expect(tiering.tiers.cold.size).toBe(0);
        expect(tiering.accessPatterns.size).toBe(0);
    });

    it('monitors file access patterns correctly', () => {
        const tiering = new DynamicDiskTiering();
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/dataset1');
        expect(tiering.accessPatterns.get('/model/artifact1')).toBe(2);
        expect(tiering.accessPatterns.get('/dataset1')).toBe(1);
    });

    it('migrates data between tiers based on access counts', () => {
        const tiering = new DynamicDiskTiering();
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/model/artifact1');
        tiering.monitorAccess('/dataset1');
        tiering.migrateData();
        expect(tiering.tiers.hot.has('/model/artifact1')).toBe(true);
        expect(tiering.tiers.warm.has('/model/artifact1')).toBe(false);
        expect(tiering.tiers.cold.has('/model/artifact1')).toBe(false);
        expect(tiering.tiers.hot.has('/dataset1')).toBe(false);
        expect(tiering.tiers.warm.has('/dataset1')).toBe(true);
    });

    it('compresses infrequently accessed data in cold tier', () => {
        const tiering = new DynamicDiskTiering();
        tiering.monitorAccess('/dataset2');
        tiering.monitorAccess('/dataset2');
        tiering.migrateData();
        expect(tiering.tiers.warm.has('/dataset2')).toBe(true);
        tiering.monitorAccess('/dataset2');
        tiering.migrateData();
        expect(tiering.tiers.hot.has('/dataset2')).toBe(true);
    });
});
