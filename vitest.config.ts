import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js', 'src/**/*.ts'],
      exclude: ['src/**/*.test.js', 'src/**/*.test.ts']
    },
    environment: 'node'
  }
});
