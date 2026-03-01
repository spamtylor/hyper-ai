import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyperIntegration } from './integration';

describe('Expansion Module: HyperIntegration', () => {
    let integration;

    beforeEach(() => {
        vi.unstubAllGlobals();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Initialization', () => {
        it('instantiates correctly with defaults', () => {
            const api = new HyperIntegration();
            expect(api.baseUrl).toBe('');
            expect(api.apiKey).toBeNull();
            expect(api.defaultHeaders['Content-Type']).toBe('application/json');
            expect(api.defaultHeaders['Authorization']).toBeUndefined();
        });

        it('instantiates correctly with a baseUrl and apiKey', () => {
            const api = new HyperIntegration({ baseUrl: 'https://api.example.com', apiKey: 'secret-key-123' });
            expect(api.baseUrl).toBe('https://api.example.com');
            expect(api.apiKey).toBe('secret-key-123');
            expect(api.defaultHeaders['Authorization']).toBe('Bearer secret-key-123');
        });
    });

    describe('request', () => {
        it('throws an error if endpoint is missing', async () => {
            const api = new HyperIntegration();
            await expect(api.request()).rejects.toThrow('A valid endpoint string is required.');
            await expect(api.request(null)).rejects.toThrow('A valid endpoint string is required.');
        });

        it('makes a successful fetch call and parses JSON', async () => {
            const mockResponse = { data: 'success' };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockResponse
            });

            const api = new HyperIntegration({ baseUrl: 'https://api.test' });
            const result = await api.request('/test');

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://api.test/test', expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            }));
        });

        it('handles full URLs bypassing the base URL', async () => {
            const mockResponse = { id: 1 };
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockResponse
            });

            const api = new HyperIntegration({ baseUrl: 'https://api.test' });
            await api.request('http://completely-different.com/data');

            expect(global.fetch).toHaveBeenCalledWith('http://completely-different.com/data', expect.any(Object));
        });

        it('returns an empty object gracefully for 204 No Content', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 204
            });

            const api = new HyperIntegration();
            const result = await api.request('http://test.com/delete');

            expect(result).toEqual({});
        });

        it('throws a rich error object on non-OK responses with JSON error payload', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                json: async () => ({ error: 'Invalid token provided.' })
            });

            const api = new HyperIntegration();

            try {
                await api.request('http://test.com/fail');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).toContain('API request failed with status 403 Forbidden: Invalid token provided.');
                expect(err.status).toBe(403);
            }
        });

        it('throws a standard error object on non-OK responses with non-JSON payload', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => { throw new Error('Not JSON'); }
            });

            const api = new HyperIntegration();

            try {
                await api.request('http://test.com/fail');
                expect.fail('Should have thrown an error');
            } catch (err) {
                expect(err.message).toBe('API request failed with status 500 Internal Server Error');
                expect(err.status).toBe(500);
            }
        });
    });

    describe('executeWithRetry', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            // Mock random so jitter is predictable (0ms)
            vi.spyOn(Math, 'random').mockReturnValue(0);
        });

        it('throws an error if apiFn is not a function', async () => {
            const api = new HyperIntegration();
            await expect(api.executeWithRetry(null)).rejects.toThrow('executeWithRetry requires a function to execute.');
        });

        it('returns successfully on the first try if the function does not throw', async () => {
            const api = new HyperIntegration();
            const mockFn = vi.fn().mockResolvedValue('immediate success');

            const result = await api.executeWithRetry(mockFn);

            expect(result).toBe('immediate success');
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        it('retries until successful and returns the value', async () => {
            const api = new HyperIntegration();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            // Fails twice, succeeds on the third
            const mockFn = vi.fn()
                .mockRejectedValueOnce(new Error("Timeout 1"))
                .mockRejectedValueOnce(new Error("Timeout 2"))
                .mockResolvedValueOnce('eventual success');

            const promise = api.executeWithRetry(mockFn);

            // First failure triggers 500ms wait
            await vi.advanceTimersByTimeAsync(500);

            // Second failure triggers 1000ms wait
            await vi.advanceTimersByTimeAsync(1000);

            const result = await promise;

            expect(result).toBe('eventual success');
            expect(mockFn).toHaveBeenCalledTimes(3);
            expect(consoleSpy).toHaveBeenCalledTimes(2);

            consoleSpy.mockRestore();
        });

        it('propagates the error if all retries are exhausted', async () => {
            const api = new HyperIntegration();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const mockFn = vi.fn().mockRejectedValue(new Error("Persistent failure"));

            // maxRetries = 2
            let caughtError = null;
            const promise = api.executeWithRetry(mockFn, 2, 500).catch(e => { caughtError = e; });

            await vi.advanceTimersByTimeAsync(500); // Wait for retry 1
            await vi.advanceTimersByTimeAsync(1000); // Wait for retry 2

            await promise;

            expect(caughtError).not.toBeNull();
            expect(caughtError.message).toBe("Persistent failure");
            expect(caughtError.retriesExhausted).toBe(true);

            expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
            consoleSpy.mockRestore();
        });

        it('does not retry on 4xx Client Errors (except 429)', async () => {
            const api = new HyperIntegration();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const clientError = new Error("Bad Request");
            clientError.status = 400; // Client error

            const mockFn = vi.fn().mockRejectedValue(clientError);

            try {
                await api.executeWithRetry(mockFn);
                expect.fail("Should have thrown");
            } catch (e) {
                expect(e.status).toBe(400);
                expect(e.retriesExhausted).toBeUndefined(); // Didn't hit retry limit
            }

            // Should only be called once, no retries
            expect(mockFn).toHaveBeenCalledTimes(1);
            expect(consoleSpy).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('retries on 429 Rate Limit Errors', async () => {
            const api = new HyperIntegration();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const rateLimitError = new Error("Too Many Requests");
            rateLimitError.status = 429;

            const mockFn = vi.fn()
                .mockRejectedValueOnce(rateLimitError)
                .mockResolvedValueOnce('success after rate limit');

            const promise = api.executeWithRetry(mockFn);

            await vi.advanceTimersByTimeAsync(500);

            const result = await promise;
            expect(result).toBe('success after rate limit');
            expect(mockFn).toHaveBeenCalledTimes(2);

            consoleSpy.mockRestore();
        });
    });
});
