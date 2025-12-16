import { defineConfig } from 'tsup';

export default defineConfig([
  // Main bundle (ESM + CJS)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
  },
  // UMD bundle for CDN
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'Unlurk',
    outExtension: () => ({ js: '.min.js' }),
    minify: true,
  },
]);
