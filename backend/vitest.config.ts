import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
export default defineConfig({
  test: {
    globals: true, // Allows using 'describe', 'it', 'expect' without importing them
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    alias: [
      {
        // This handles the .js extensions in your imports
        // and maps them back to .ts files for the tests.
        find: /^(.*)\.js$/,
        replacement: '$1.ts',
      },
    ],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
