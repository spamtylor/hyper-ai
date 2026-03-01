import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HyperMemory } from './memory';

describe('HyperMemory System', () => {
    let memory;
    let mockClient;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a fake QdrantClient instance
        mockClient = {
            getCollections: vi.fn().mockResolvedValue({ collections: [{ name: 'conversations' }] }),
            createCollection: vi.fn().mockResolvedValue(true),
            upsert: vi.fn().mockResolvedValue(true),
            search: vi.fn().mockResolvedValue([{ id: 1, score: 0.99, payload: { text: "hello" } }])
        };

        // Inject the mock client
        memory = new HyperMemory({ client: mockClient });
    });

    describe('Initialization', () => {
        it('creates missing collections but not existing ones', async () => {
            await memory.initialize(['conversations', 'facts']);

            expect(mockClient.getCollections).toHaveBeenCalled();
            expect(mockClient.createCollection).toHaveBeenCalledTimes(1);
            expect(mockClient.createCollection).toHaveBeenCalledWith('facts', expect.any(Object));
        });
    });

    describe('Saving Memory', () => {
        it('rejects an empty or invalid vector', async () => {
            await expect(memory.saveMemory('facts', 1, [])).rejects.toThrow('Invalid memory vector provided.');
            await expect(memory.saveMemory('facts', 1, null)).rejects.toThrow('Invalid memory vector provided.');
        });

        it('successfully saves a valid memory vector', async () => {
            const result = await memory.saveMemory('facts', 1, [0.1, 0.2, 0.3], { text: "test" });

            expect(result).toBe(true);
            expect(mockClient.upsert).toHaveBeenCalledWith('facts', {
                wait: true,
                points: [{ id: 1, vector: [0.1, 0.2, 0.3], payload: { text: "test" } }]
            });
        });

        it('returns false when Qdrant upsert throws an error', async () => {
            // Simulate failure
            mockClient.upsert.mockRejectedValueOnce(new Error("Network Error"));

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const result = await memory.saveMemory('facts', 1, [0.1, 0.2, 0.3]);

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Searching Memory', () => {
        it('rejects an empty or invalid vector', async () => {
            await expect(memory.searchMemory('facts', [])).rejects.toThrow('Invalid query vector provided.');
            await expect(memory.searchMemory('facts', null)).rejects.toThrow('Invalid query vector provided.');
        });

        it('successfully searches and returns results', async () => {
            const results = await memory.searchMemory('facts', [0.1, 0.2, 0.3]);

            expect(results).toHaveLength(1);
            expect(results[0].payload.text).toBe("hello");
            expect(mockClient.search).toHaveBeenCalledWith('facts', {
                vector: [0.1, 0.2, 0.3],
                limit: 5,
                with_payload: true
            });
        });

        it('returns an empty array when Qdrant search throws an error', async () => {
            // Simulate failure
            mockClient.search.mockRejectedValueOnce(new Error("Search Timeout"));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const results = await memory.searchMemory('facts', [0.1, 0.2, 0.3]);

            expect(results).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});
