import react from '@vitejs/plugin-react';
import { type ConfigEnv, defineConfig, loadEnv, type UserConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd());
  return {
    cacheDir: './node_modules/.vite',
    plugins: [
      react(),
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
  } satisfies UserConfig;
});
