import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HyperLearning } from './learning';

describe('Intelligence Module: HyperLearning', () => {
    let mockMemory;
    let learning;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a mock memory system
        mockMemory = {
            saveMemory: vi.fn().mockResolvedValue(true),
            searchMemory: vi.fn().mockResolvedValue([])
        };

        learning = new HyperLearning(mockMemory);
    });

    describe('Initialization', () => {
        it('throws an error if instantiated without a memory system', () => {
            expect(() => new HyperLearning()).toThrow('HyperLearning requires a HyperMemory instance to be injected.');
            expect(() => new HyperLearning(null)).toThrow('HyperLearning requires a HyperMemory instance to be injected.');
        });

        it('instantiates correctly with a memory system', () => {
            expect(learning.memory).toBeDefined();
            expect(learning.memory).toBe(mockMemory);
        });
    });

    describe('analyzeInteraction', () => {
        it('returns an empty array for invalid input', () => {
            expect(learning.analyzeInteraction(null)).toEqual([]);
            expect(learning.analyzeInteraction(undefined)).toEqual([]);
            expect(learning.analyzeInteraction('')).toEqual([]);
            expect(learning.analyzeInteraction(123)).toEqual([]);
        });

        it('extracts sentences containing specific keywords', () => {
            const text = "The user likes coffee. They went to the store. The system needs an update! The dog is running.";
            const facts = learning.analyzeInteraction(text);

            expect(facts).toHaveLength(3);
            expect(facts).toContain("The user likes coffee.");
            expect(facts).toContain("The system needs an update!");
            expect(facts).toContain("The dog is running.");
            expect(facts).not.toContain("They went to the store.");
        });

        it('handles text without punctuation correctly', () => {
            const text = "He prefers tea over coffee";
            const facts = learning.analyzeInteraction(text);

            expect(facts).toHaveLength(1);
            expect(facts[0]).toBe("He prefers tea over coffee");
        });

        it('does not extract duplicate facts from a single sentence with multiple keywords', () => {
            const text = "He likes coffee and he needs it to function.";
            const facts = learning.analyzeInteraction(text);

            expect(facts).toHaveLength(1);
        });
    });

    describe('consolidateMemory', () => {
        it('throws an error if no interactionId is provided', async () => {
            await expect(learning.consolidateMemory(null, 'test')).rejects.toThrow('An interactionId is required to consolidate memory.');
        });

        it('returns early with success config if no facts are extracted', async () => {
            const result = await learning.consolidateMemory(1, "Just a normal day. Nothing special happened.");

            expect(result.factsExtracted).toBe(0);
            expect(result.factsSaved).toBe(0);
            expect(result.success).toBe(true);
            expect(mockMemory.saveMemory).not.toHaveBeenCalled();
        });

        it('loops over extracted facts and saves them to the memory system', async () => {
            const text = "The user likes coffee. The system needs an update!";
            const result = await learning.consolidateMemory(123, text);

            expect(result.factsExtracted).toBe(2);
            expect(result.factsSaved).toBe(2);
            expect(result.factsFailed).toBe(0);
            expect(result.success).toBe(true);

            expect(mockMemory.saveMemory).toHaveBeenCalledTimes(2);

            // Check args for first save
            expect(mockMemory.saveMemory).toHaveBeenNthCalledWith(
                1,
                'facts',           // collection name
                '123-0',           // fact ID
                expect.any(Array), // Dummy vector
                expect.objectContaining({
                    sourceInteraction: 123,
                    text: 'The user likes coffee.'
                })
            );
        });

        it('handles failures from the memory system gracefully', async () => {
            // First save succeeds, second fails
            mockMemory.saveMemory.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

            const text = "The user likes coffee. The system needs an update!";
            const result = await learning.consolidateMemory(123, text);

            expect(result.factsExtracted).toBe(2);
            expect(result.factsSaved).toBe(1);
            expect(result.factsFailed).toBe(1);
            expect(result.success).toBe(false);
        });

        it('catches thrown errors from the memory system gracefully', async () => {
            mockMemory.saveMemory.mockRejectedValue(new Error("Database connection lost"));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const text = "The user likes coffee.";
            const result = await learning.consolidateMemory(123, text);

            expect(result.factsExtracted).toBe(1);
            expect(result.factsSaved).toBe(0);
            expect(result.factsFailed).toBe(1);
            expect(result.success).toBe(false);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
