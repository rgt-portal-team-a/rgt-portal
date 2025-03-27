import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    // This tells esbuild to ignore unused imports during build
    legalComments: 'none',
    treeShaking: true,
  },
  build: {
    // These settings help with the TypeScript compilation
    minify: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
