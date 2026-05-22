import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/engines/**', 'src/core/**'],
      exclude: ['**/*.d.ts', '**/*.config.ts']
    },
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});