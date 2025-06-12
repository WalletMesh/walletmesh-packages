import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const nodeModulesPath = `${searchForWorkspaceRoot(process.cwd())}/node_modules`;

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
            src: `${nodeModulesPath}/@aztec/noir-acvm_js/web/acvm_js_bg.wasm`,
            dest: 'assets',
          },
          {
            src: `${nodeModulesPath}/@aztec/noir-noirc_abi/web/noirc_abi_wasm_bg.wasm`,
            dest: 'assets',
          },
        ],
      }),
    ],
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
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
