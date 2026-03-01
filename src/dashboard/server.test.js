import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requestListener, tailFile, getTaskFiles, startServer } from './server';
import fs from 'fs/promises';

describe('Dashboard Component: server.js', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(fs, 'readFile');
        vi.spyOn(fs, 'readdir');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('tailFile', () => {
        it('returns lines from a file successfully', async () => {
            vi.spyOn(fs, 'readFile').mockResolvedValue('line1\nline2\nline3\n');
            const lines = await tailFile('test.log', 2);
            expect(lines).toEqual(['line2', 'line3']);
        });

        it('handles missing files gracefully string format', async () => {
            vi.spyOn(fs, 'readFile').mockRejectedValue(new Error('ENOENT'));
            const lines = await tailFile('missing.log');
            expect(lines[0]).toContain('Log file not found');
        });
    });

    describe('getTaskFiles', () => {
        it('parses valid json files from a directory and ignores invalid ones', async () => {
            fs.readdir.mockResolvedValue(['task1.json', 'task2.json', 'ignore.txt']);

            fs.readFile.mockImplementation(async (filePath) => {
                if (filePath.endsWith('task1.json')) return '{"id":"1", "title":"Valid"}';
                if (filePath.endsWith('task2.json')) return 'INVALID JSON';
                return '';
            });

            const tasks = await getTaskFiles('some_dir');
            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe('Valid');
        });

        it('returns an empty array if directory read fails completely', async () => {
            vi.spyOn(fs, 'readdir').mockRejectedValue(new Error('ENOENT'));
            const tasks = await getTaskFiles('bad_dir');
            expect(tasks).toEqual([]);
        });
    });

    describe('requestListener', () => {
        const createMockRes = () => {
            const res = {};
            res.writeHead = vi.fn();
            res.end = vi.fn();
            return res;
        };

        it('serves the HTML UI on / index load', () => {
            const req = { method: 'GET', url: '/' };
            const res = createMockRes();

            requestListener(req, res);

            expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
            expect(res.end).toHaveBeenCalledWith(expect.stringContaining('<!DOCTYPE html>'));
        });

        it('handles 404 for unknown routes safely', () => {
            const req = { method: 'GET', url: '/unknown' };
            const res = createMockRes();

            requestListener(req, res);

            expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
            expect(res.end).toHaveBeenCalledWith('Not Found');
        });

        it('handles /api/status returning populated JSON structure correctly', async () => {
            fs.readdir.mockRejectedValue(new Error('Empty dir'));
            fs.readFile.mockRejectedValue(new Error('Empty file'));

            const req = { method: 'GET', url: '/api/status' };
            const res = createMockRes();

            await new Promise(resolve => {
                res.end.mockImplementation(() => resolve());
                requestListener(req, res);
            });

            expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });

            const callArgs = res.end.mock.calls[0][0];
            const parsed = JSON.parse(callArgs);
            expect(parsed.status).toBe('online');
            expect(parsed.tasks.pending).toBe(0);
        });

        it('handles /api/status internal errors wrapping HTTP 500 correctly', async () => {
            const originalAll = Promise.all;
            Promise.all = vi.fn().mockRejectedValue(new Error('Fatal Crash'));

            const req = { method: 'GET', url: '/api/status' };
            const res = createMockRes();

            await new Promise(resolve => {
                res.end.mockImplementation(() => resolve());
                requestListener(req, res);
            });

            expect(res.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'application/json' });
            expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: 'Failed to generate status payload' }));

            Promise.all = originalAll;
        });
    });
});
