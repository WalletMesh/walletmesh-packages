import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig(({ mode }: any) => {
  const env = loadEnv(mode, process.cwd());

  return {
    cacheDir: './node_modules/.vite',
    resolve: {
      alias: {
        pino: 'pino/browser',
        // Handle lodash modules
        'lodash.chunk': 'lodash/chunk',
        'lodash.isequal': 'lodash/isEqual',
      },
    },
    plugins: [
      react(),
      nodePolyfills({
        include: ['buffer', 'path', 'process', 'util', 'stream', 'events', 'tty'],
        globals: {
          Buffer: true,
          process: true,
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: './node_modules/@aztec/noir-acvm_js/web/acvm_js_bg.wasm',
            dest: 'assets',
          }
        ],
      }),
    ],
    optimizeDeps: {
      exclude: ['@aztec/bb.js', 'barretenberg'],
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
      host: '127.0.0.1',
    },
    assetsInclude: ['**/*.wasm'],
    define: {
      'process.env': JSON.stringify({
        LOG_LEVEL: env.LOG_LEVEL || 'info',
        VITE_AZTEC_RPC_URL:
          env.VITE_AZTEC_RPC_URL || 'https://sandbox.aztec.walletmesh.com/api/v1/public',
      }),
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        external: [
          // Externalize Node.js modules that shouldn't be bundled for browser
          'node:fs',
          'node:os',
          'node:crypto',
          // Externalize Solana dependencies (not needed for Aztec-only dApp)
          '@solana/web3.js',
          '@solana/wallet-adapter-base',
          // Externalize other problematic server-side modules
          'fs',
          'os',
        ],
      },
    },
  } as any;
});
