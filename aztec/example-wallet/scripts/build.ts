#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const CACHE_FILE = path.join(ROOT_DIR, 'node_modules', '.tmp', '.build-state.json');
const TSCONFIG_PATH = path.join(ROOT_DIR, 'tsconfig.json');
const SRC_DIR = path.join(ROOT_DIR, 'src');

interface BuildState {
  lastBuildTime: number;
  fileHashes: Record<string, string>;
}

function ensureCacheDir(): void {
  const cacheDir = path.dirname(CACHE_FILE);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
}

function getLastModified(dir: string): number {
  let lastModified = 0;

  function walk(currentDir: string): void {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
        walk(itemPath);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        lastModified = Math.max(lastModified, stat.mtimeMs);
      }
    }
  }

  walk(dir);
  return lastModified;
}

function loadBuildState(): BuildState | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Failed to load build state, will rebuild');
  }
  return null;
}

function saveBuildState(state: BuildState): void {
  ensureCacheDir();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(state, null, 2));
}

function shouldRebuild(): boolean {
  const buildState = loadBuildState();
  if (!buildState) {
    return true;
  }

  const lastModified = getLastModified(SRC_DIR);
  if (lastModified > buildState.lastBuildTime) {
    return true;
  }

  // Also check tsconfig changes
  const tsconfigStat = fs.statSync(TSCONFIG_PATH);
  if (tsconfigStat.mtimeMs > buildState.lastBuildTime) {
    return true;
  }

  return false;
}

function runTypeScript(): void {
  console.log('Running TypeScript build...');
  try {
    execSync('tsc --build', {
      stdio: 'inherit',
      cwd: ROOT_DIR,
    });
    console.log('TypeScript build completed');
  } catch (error) {
    console.error('TypeScript build failed');
    process.exit(1);
  }
}

function runVite(): void {
  console.log('Running Vite build...');
  try {
    execSync('NODE_OPTIONS="--max-old-space-size=8192" vite build', {
      stdio: 'inherit',
      cwd: ROOT_DIR,
      shell: true,
    });
    console.log('Vite build completed');
  } catch (error) {
    console.error('Vite build failed');
    process.exit(1);
  }
}

async function main(): Promise<void> {
  console.log('Starting build process for example-wallet...');

  if (shouldRebuild()) {
    console.log('Changes detected, rebuilding...');
    runTypeScript();
    runVite();
  } else {
    console.log('No changes detected, skipping build');
  }

  // Save build state
  const buildState: BuildState = {
    lastBuildTime: Date.now(),
    fileHashes: {},
  };
  saveBuildState(buildState);

  console.log('Build completed successfully!');
}

main().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});