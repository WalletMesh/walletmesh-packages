import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    cacheDir: '/tmp/.vite',
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
        include: ['buffer', 'path', 'process'],
      }),
      viteStaticCopy({
        targets: [
          {
            src: `./node_modules/@aztec/noir-acvm_js/web/acvm_js_bg.wasm`,
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
    },
  };
});
