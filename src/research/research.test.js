import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperResearch } from './research';

describe('HyperResearch System', () => {
    let research;
    let fetchSpy;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup global fetch mock
        fetchSpy = vi.spyOn(global, 'fetch');

        // Initialize research class with default localhost URL
        research = new HyperResearch();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('sets the default baseUrl when not provided', () => {
            const defaultResearch = new HyperResearch();
            expect(defaultResearch.baseUrl).toBe('http://localhost:3001/api');
        });

        it('allows overriding the baseUrl', () => {
            const customResearch = new HyperResearch({ baseUrl: 'http://my-ai-server:3000' });
            expect(customResearch.baseUrl).toBe('http://my-ai-server:3000');
        });
    });

    describe('Search', () => {
        it('throws an error if no query is provided', async () => {
            await expect(research.search('')).rejects.toThrow('A valid search query string is required.');
            await expect(research.search(null)).rejects.toThrow('A valid search query string is required.');
            await expect(research.search('   ')).rejects.toThrow('A valid search query string is required.');
        });

        it('returns successful search data when fetch responds ok', async () => {
            const mockResponse = {
                message: 'AI generated answer.',
                sources: [{ title: 'Source 1', url: 'https://example.com' }]
            };

            fetchSpy.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValueOnce(mockResponse)
            });

            const result = await research.search('What is AI?');

            expect(result.success).toBe(true);
            expect(result.answer).toBe('AI generated answer.');
            expect(result.sources.length).toBe(1);

            // Validate fetch arguments
            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(fetchSpy.mock.calls[0][0]).toBe('http://localhost:3001/api/search');

            const fetchOptions = fetchSpy.mock.calls[0][1];
            expect(fetchOptions.method).toBe('POST');

            const body = JSON.parse(fetchOptions.body);
            expect(body.query).toBe('What is AI?');
            expect(body.focusMode).toBe('webSearch');
        });

        it('respects a custom focusMode', async () => {
            fetchSpy.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValueOnce({})
            });

            await research.search('Latest research', 'academicSearch');

            const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
            expect(body.focusMode).toBe('academicSearch');
        });

        it('handles non-ok API responses gracefully with an error message', async () => {
            fetchSpy.mockResolvedValueOnce({
                ok: false,
                status: 500
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await research.search('Query');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Perplexica API request failed with status: 500');
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('catches and handles network fetch throw rejection', async () => {
            fetchSpy.mockRejectedValueOnce(new Error('Network offline'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await research.search('Query');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network offline');
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('Discover', () => {
        it('throws an error if no topic is provided', async () => {
            await expect(research.discover('')).rejects.toThrow('A valid discovery topic string is required.');
            await expect(research.discover(null)).rejects.toThrow('A valid discovery topic string is required.');
        });

        it('returns successful discover data resolving blogs when fetch is ok', async () => {
            const mockResponse = {
                blogs: [{ title: 'Blog 1', content: 'Info' }]
            };

            fetchSpy.mockResolvedValueOnce({
                ok: true,
                json: vi.fn().mockResolvedValueOnce(mockResponse)
            });

            const result = await research.discover('AI advancements');

            expect(result.success).toBe(true);
            expect(result.blogs.length).toBe(1);
            expect(result.blogs[0].title).toBe('Blog 1');

            // Validate fetch structure
            const fetchOptions = fetchSpy.mock.calls[0][1];
            expect(fetchOptions.method).toBe('POST');
            expect(JSON.parse(fetchOptions.body).query).toBe('AI advancements');
        });

        it('handles non-ok API responses gracefully in discover', async () => {
            fetchSpy.mockResolvedValueOnce({
                ok: false,
                status: 404
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await research.discover('Topic');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Perplexica API discover failed with status: 404');

            consoleSpy.mockRestore();
        });

        it('handles network throw errors in discover mode', async () => {
            fetchSpy.mockRejectedValueOnce(new Error('DNS resolution failed'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await research.discover('Topic');

            expect(result.success).toBe(false);
            expect(result.error).toBe('DNS resolution failed');
            expect(result.blogs).toEqual([]);

            consoleSpy.mockRestore();
        });
    });
});
