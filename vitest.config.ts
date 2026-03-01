import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75
      },
      include: ['src/**/*.js', 'src/**/*.ts'],
      exclude: ['src/**/*.test.js', 'src/**/*.test.ts']
    },
    environment: 'node'
  }
});
