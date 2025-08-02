import { defineConfig } from 'vite';
import path from 'node:path';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

// Plugin to copy static files
function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    closeBundle() {
      // Copy manifest.json
      copyFileSync('manifest.json', 'dist/manifest.json');

      // Copy popup.html
      copyFileSync('popup.html', 'dist/popup.html');

      // Copy icons
      mkdirSync('dist/icons', { recursive: true });
      copyFileSync('icons/icon-16.png', 'dist/icons/icon-16.png');
      copyFileSync('icons/icon-48.png', 'dist/icons/icon-48.png');
      copyFileSync('icons/icon-128.png', 'dist/icons/icon-128.png');

      console.log('✓ Static files copied to dist/');
    },
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background-simple': path.resolve(__dirname, 'background-simple.ts'),
        content: path.resolve(__dirname, 'content.ts'),
        popup: path.resolve(__dirname, 'popup.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
        // Use strict mode for better compatibility
        strict: true,
        // Ensure globals are properly defined
        globals: {
          chrome: 'chrome',
        },
      },
      external: ['chrome'],
    },
    target: 'chrome91',
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
  plugins: [copyStaticFiles()],
});
