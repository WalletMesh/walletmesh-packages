#!/usr/bin/env tsx

/**
 * Intelligent CSS build script that only copies files when they've changed
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_COMPONENTS = path.join(__dirname, '..', 'src', 'components');
const DIST_COMPONENTS = path.join(DIST_DIR, 'components');

// Cache file to store last build timestamps
const CACHE_FILE = path.join(DIST_DIR, '.css-build-cache.json');

interface CSSFile {
  src: string;
  relative: string;
  isModule: boolean;
}

interface BuildCache {
  [filePath: string]: number;
}

// Get all CSS files from source
function getCSSFiles(): CSSFile[] {
  const files: CSSFile[] = [];

  if (!fs.existsSync(SRC_COMPONENTS)) {
    return files;
  }

  const walk = (dir: string): void => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        walk(itemPath);
      } else if (item.endsWith('.css')) {
        files.push({
          src: itemPath,
          relative: path.relative(SRC_COMPONENTS, itemPath),
          isModule: item.endsWith('.module.css'),
        });
      }
    }
  };

  walk(SRC_COMPONENTS);
  return files;
}

// Load cache
function loadCache(): BuildCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')) as BuildCache;
    }
  } catch (e) {
    console.warn('Warning: Could not load CSS build cache:', (e as Error).message);
  }
  return {};
}

// Save cache
function saveCache(cache: BuildCache): void {
  try {
    fs.mkdirSync(DIST_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn('Warning: Could not save CSS build cache:', (e as Error).message);
  }
}

// Check if file has changed
function hasFileChanged(filePath: string, cache: BuildCache): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const stat = fs.statSync(filePath);
  const mtime = stat.mtimeMs;

  if (cache[filePath] !== mtime) {
    return true;
  }

  return false;
}

// Copy CSS file
function copyCSSFile(file: CSSFile): string {
  const destPath = path.join(DIST_COMPONENTS, file.relative);
  const destDir = path.dirname(destPath);

  // Create destination directory if needed
  fs.mkdirSync(destDir, { recursive: true });

  // Copy the file
  fs.copyFileSync(file.src, destPath);

  // Special handling for WalletMeshModal.module.css - also create non-module version
  if (file.relative === 'WalletMeshModal.module.css') {
    const nonModulePath = path.join(DIST_COMPONENTS, 'WalletMeshModal.css');
    fs.copyFileSync(file.src, nonModulePath);
  }

  return destPath;
}

// Main build function
export function buildCSS(): void {
  console.log('🎨 Building CSS files...');

  const cache = loadCache();
  const newCache: BuildCache = {};
  const cssFiles = getCSSFiles();

  if (cssFiles.length === 0) {
    console.log('  No CSS files found to build.');
    return;
  }

  let copiedCount = 0;
  let skippedCount = 0;

  for (const file of cssFiles) {
    const stat = fs.statSync(file.src);
    const mtime = stat.mtimeMs;
    newCache[file.src] = mtime;

    // Check if file has changed or destination doesn't exist
    const destPath = path.join(DIST_COMPONENTS, file.relative);
    const needsCopy = !fs.existsSync(destPath) || hasFileChanged(file.src, cache);

    if (needsCopy) {
      const _copied = copyCSSFile(file);
      console.log(`  ✓ Copied: ${file.relative}`);
      copiedCount++;
    } else {
      skippedCount++;
    }
  }

  // Save the new cache
  saveCache(newCache);

  // Summary
  if (copiedCount > 0) {
    console.log(`✅ CSS build complete: ${copiedCount} file(s) copied, ${skippedCount} unchanged`);
  } else {
    console.log(`✅ CSS build complete: All ${skippedCount} file(s) up-to-date (skipped)`);
  }
}

// Run the build if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  buildCSS();
}
