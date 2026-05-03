import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['ai-img-cli.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  outDir: 'dist',
});
