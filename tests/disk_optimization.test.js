import { describe, it, expect, vi } from "vitest";
import { optimizeDisk, isFileRedundant, getCompressionRatio } from "../src/disk_optimization";

describe('disk_optimization', () => {
  describe('optimizeDisk', () => {
    it('does nothing during peak hours', async () => {
      const mockDate = new Date(2023, 0, 1, 10, 0, 0);
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      
      const readdirMock = vi.fn();
      const statMock = vi.fn();
      
      vi.mock('fs/promises', () => ({
        default: {
          readdir: readdirMock,
          stat: statMock
        }
      }));
      
      await optimizeDisk();
      expect(readdirMock).not.toHaveBeenCalled();
    });

    it('processes files during off-peak', async () => {
      const mockDate = new Date(2023, 0, 1, 2, 0, 0);
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      
      const readdirMock = vi.fn((dir) => {
        if (dir.includes('models')) return ['model1.bin'];
        if (dir.includes('logs')) return ['app.log'];
        if (dir.includes('snapshots')) return ['snap1.snapshot'];
        return [];
      });
      
      const statMock = vi.fn(() => ({ atimeMs: Date.now() - 900000 })); // Accessed 15 mins ago
      vi.mock('fs/promises', () => ({
        default: {
          readdir: readdirMock,
          stat: statMock
        }
      }));
      
      await optimizeDisk();
      expect(readdirMock).toHaveBeenCalledWith(expect.stringContaining('models'));
      expect(readdirMock).toHaveBeenCalledWith(expect.stringContaining('logs'));
      expect(readdirMock).toHaveBeenCalledWith(expect.stringContaining('snapshots'));
    });
  });

  describe('isFileRedundant', () => {
    it('returns true for files not accessed in 24h', () => {
      const mockStat = { atimeMs: Date.now() - 900000 }; // 15 mins ago
      vi.spyOn(fs, 'statSync').mockReturnValue(mockStat);
      expect(isFileRedundant('test.txt')).toBe(true);
    });

    it('returns false for recently accessed files', () => {
      const mockStat = { atimeMs: Date.now() - 3600000 }; // 1 hour ago
      vi.spyOn(fs, 'statSync').mockReturnValue(mockStat);
      expect(isFileRedundant('test.txt')).toBe(false);
    });
  });

  describe('getCompressionRatio', () => {
    it('returns 0.8 for .log files', () => {
      expect(getCompressionRatio('app.log')).toBe(0.8);
    });

    it('returns 0.6 for .snapshot files', () => {
      expect(getCompressionRatio('snapshot.snapshot')).toBe(0.6);
    });

    it('returns 0.7 for other files', () => {
      expect(getCompressionRatio('model.bin')).toBe(0.7);
    });
  });
});
