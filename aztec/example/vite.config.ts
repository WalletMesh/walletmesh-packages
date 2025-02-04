import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
export default defineConfig({
  cacheDir: '/tmp/.vite',
  plugins: [
    react(),
    // https://github.com/AztecProtocol/aztec-packages/issues/5050
    nodePolyfills({
      include: [
        'buffer',
        'crypto',
        'events',
        // @ts-expect-error - fs/promises is not in the types
        'fs/promises',
        'path',
        'process',
        'stream',
        'string_decoder',
        'tty',
        'util',
      ],
    }),
    topLevelAwait(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('bb-prover')) {
            return '@aztec/bb-prover';
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@noir-lang/acvm_js', '@noir-lang/noirc_abi', '@aztec/bb-prover'],
    esbuildOptions: {
      supported: {
        'top-level-await': true,
      },
    },
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
});
