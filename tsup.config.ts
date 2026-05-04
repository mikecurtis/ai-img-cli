import { defineConfig } from 'tsup';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
  entry: ['ai-img-cli.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  define: {
    __VERSION__: JSON.stringify(version),
  },
  outDir: 'dist',
});
