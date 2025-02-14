import { defineConfig, type Plugin, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
const config: UserConfig = {
  plugins: react() as Plugin[],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  optimizeDeps: {
    include: ['@walletmesh/modal'],
  },
};

export default defineConfig(config);
