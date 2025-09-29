import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
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
        include: ['buffer', 'path', 'process', 'tty', 'net'],
        globals: {
          process: true,
          Buffer: true,
        },
      }),
      viteStaticCopy({
        targets: [
          {
            src: `./node_modules/@aztec/noir-acvm_js/web/acvm_js_bg.wasm`,
            dest: 'assets',
          },
          {
            src: `./node_modules/@aztec/noir-noirc_abi/web/noirc_abi_wasm_bg.wasm`,
            dest: 'assets',
          },
        ],
      }),
    ],
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
      },
      host: '127.0.0.1',
    },
    assetsInclude: ['**/*.wasm'],
    define: {
      'process.env': JSON.stringify({
        LOG_LEVEL: env.LOG_LEVEL || 'info',
      }),
    },
    build: {
      sourcemap: true,
      // Increase chunk size warning limit for Aztec libraries
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Manual chunk splitting for large dependencies
          manualChunks(id: string) {
            // React libraries in separate chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            // WalletMesh libraries
            if (id.includes('@walletmesh/')) {
              return 'walletmesh';
            }
            // All other node_modules into vendor chunk (except barretenberg)
            if (id.includes('node_modules') && !id.includes('barretenberg')) {
              return 'vendor';
            }
            // Keep barretenberg separate for better caching
            if (id.includes('barretenberg')) {
              return 'barretenberg';
            }
          },
        },
      },
    },
  } as any;
});
