import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  esbuild: {
    // This tells esbuild to ignore unused imports during build
    legalComments: 'none',
    treeShaking: true,
  },
  build: {
    // These settings help with the TypeScript compilation
    outDir: 'dist',
    assetsDir: 'assets',
    minify: mode === 'production',
    sourcemap: mode !== 'production',
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      'https://sih2h86cxp.ap-south-1.awsapprunner.com/'
    ),
  },
}));
