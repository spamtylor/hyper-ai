import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperKnowledge } from './knowledge';
import fs from 'fs/promises';

describe('Intelligence Module: HyperKnowledge', () => {
    let mockMemory;
    let knowledge;

    beforeEach(() => {
        vi.clearAllMocks();

        mockMemory = {
            saveMemory: vi.fn().mockResolvedValue(true),
            searchMemory: vi.fn().mockResolvedValue([])
        };

        knowledge = new HyperKnowledge(mockMemory);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('throws an error if instantiated without a memory system', () => {
            expect(() => new HyperKnowledge()).toThrow('HyperKnowledge requires a HyperMemory instance to be injected.');
        });

        it('instantiates correctly with a memory system', () => {
            expect(knowledge.memory).toBeDefined();
        });
    });

    describe('discoverDocuments', () => {
        it('throws an error if directory path is missing or invalid', async () => {
            await expect(knowledge.discoverDocuments()).rejects.toThrow();
            await expect(knowledge.discoverDocuments(null)).rejects.toThrow();
            await expect(knowledge.discoverDocuments(123)).rejects.toThrow();
        });

        it('returns empty array gracefully if it throws from nonexistent directory', async () => {
            const readdirSpy = vi.spyOn(fs, 'readdir').mockRejectedValue(new Error("ENOENT"));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const files = await knowledge.discoverDocuments('/fake/path');

            expect(files).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();

            readdirSpy.mockRestore();
            consoleSpy.mockRestore();
        });

        it('recursively discovers .md and .txt files while ignoring others', async () => {
            // Mock directory structure
            const rootDir = [
                { name: 'doc1.md', isFile: () => true, isDirectory: () => false },
                { name: 'image.png', isFile: () => true, isDirectory: () => false },
                { name: 'subfolder', isFile: () => false, isDirectory: () => true },
                { name: '.git', isFile: () => false, isDirectory: () => true }, // should ignore
                { name: 'node_modules', isFile: () => false, isDirectory: () => true }, // should ignore
            ];

            const subDir = [
                { name: 'notes.txt', isFile: () => true, isDirectory: () => false },
                { name: 'script.js', isFile: () => true, isDirectory: () => false },
            ];

            const readdirSpy = vi.spyOn(fs, 'readdir');

            // First call root, second call subfolder
            readdirSpy.mockImplementation((path) => {
                if (path === '/docs') return Promise.resolve(rootDir);
                if (path === '/docs/subfolder') return Promise.resolve(subDir);
                return Promise.resolve([]);
            });

            const files = await knowledge.discoverDocuments('/docs');

            expect(files).toHaveLength(2);
            // using path.join implies they look like /docs/doc1.md
            expect(files.some(f => f.includes('doc1.md'))).toBe(true);
            expect(files.some(f => f.includes('notes.txt'))).toBe(true);
            expect(files.some(f => f.includes('image.png'))).toBe(false);

            readdirSpy.mockRestore();
        });
    });

    describe('syncToMemory', () => {
        it('throws error if input is not an array', async () => {
            await expect(knowledge.syncToMemory(null)).rejects.toThrow('syncToMemory requires an array of file paths.');
            await expect(knowledge.syncToMemory("filepath")).rejects.toThrow();
        });

        it('returns early when file array is empty', async () => {
            const result = await knowledge.syncToMemory([]);

            expect(result.filesProcessed).toBe(0);
            expect(result.success).toBe(true);
            expect(mockMemory.saveMemory).not.toHaveBeenCalled();
        });

        it('reads files and saves them via memory system', async () => {
            const readFileSpy = vi.spyOn(fs, 'readFile').mockResolvedValue('File content markdown');

            const result = await knowledge.syncToMemory(['/docs/file1.md', '/docs/file2.txt']);

            expect(result.filesProcessed).toBe(2);
            expect(result.memorySaved).toBe(2);
            expect(result.success).toBe(true);

            expect(readFileSpy).toHaveBeenCalledTimes(2);
            expect(mockMemory.saveMemory).toHaveBeenCalledTimes(2);

            expect(mockMemory.saveMemory).toHaveBeenCalledWith(
                'knowledge_base',
                expect.any(String),
                expect.any(Array),
                expect.objectContaining({
                    fullPath: '/docs/file1.md',
                    fileName: 'file1.md',
                    text: 'File content markdown'
                })
            );

            readFileSpy.mockRestore();
        });

        it('truncates very large documents over 5000 chars', async () => {
            const hugeString = 'A'.repeat(6000);
            const readFileSpy = vi.spyOn(fs, 'readFile').mockResolvedValue(hugeString);

            await knowledge.syncToMemory(['/docs/large.md']);

            const saveCallArgs = mockMemory.saveMemory.mock.calls[0];
            const payload = saveCallArgs[3]; // 4th arg is the payload config

            expect(payload.text).toHaveLength(5000);

            readFileSpy.mockRestore();
        });

        it('handles saveMemory failures gracefully', async () => {
            const readFileSpy = vi.spyOn(fs, 'readFile').mockResolvedValue('Content');
            mockMemory.saveMemory.mockResolvedValueOnce(false); // Fail saving

            const result = await knowledge.syncToMemory(['/docs/fail.md']);

            expect(result.filesProcessed).toBe(1);
            expect(result.memorySaved).toBe(0);
            expect(result.memoryFailed).toBe(1);
            expect(result.success).toBe(false);

            readFileSpy.mockRestore();
        });

        it('handles specific file read access denials gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const readFileSpy = vi.spyOn(fs, 'readFile').mockRejectedValue(new Error("EACCES: permission denied"));

            const result = await knowledge.syncToMemory(['/docs/secret.txt']);

            expect(result.memoryFailed).toBe(1);
            expect(result.success).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();
            expect(mockMemory.saveMemory).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
            readFileSpy.mockRestore();
        });
    });
});
