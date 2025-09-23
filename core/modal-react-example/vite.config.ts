import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      pino: 'pino/browser',
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      path: 'path-browserify',
      stream: 'stream-browserify',
      fs: false,
      os: false,
    },
  },
  server: {
    host: '127.0.0.1',
    port: 1234,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit for large chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Large Aztec dependencies
          if (id.includes('@aztec/barretenberg') || id.includes('barretenberg')) {
            return 'aztec-barretenberg';
          }
          // Solana dependencies
          if (id.includes('@solana/web3.js')) {
            return 'solana-web3';
          }
          // WalletMesh packages
          if (id.includes('@walletmesh/modal-react')) {
            return 'walletmesh-react';
          }
          if (
            id.includes('@walletmesh/modal-core') ||
            id.includes('@walletmesh/discovery') ||
            id.includes('@walletmesh/jsonrpc')
          ) {
            return 'walletmesh-core';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'path-browserify', 'stream-browserify'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
