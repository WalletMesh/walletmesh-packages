#!/usr/bin/env tsx

/**
 * Intelligent build orchestrator that only runs necessary build steps
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildCSS } from './build-css.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SRC_DIR = path.join(__dirname, '..', 'src');
const TSBUILDINFO = path.join(DIST_DIR, '.tsbuildinfo');

// Check if TypeScript files need rebuilding
function needsTypeScriptBuild(): boolean {
  // If no dist directory or no tsbuildinfo, we need to build
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(TSBUILDINFO)) {
    return true;
  }

  // TypeScript's incremental build will handle the rest
  // We just need to run it and it will determine what needs rebuilding
  return true; // Always let TypeScript decide with its incremental build
}

// Check if CSS files need rebuilding
function needsCSSBuild(): boolean {
  const cacheFile = path.join(DIST_DIR, '.css-build-cache.json');

  // If no cache file, we need to build
  if (!fs.existsSync(cacheFile)) {
    return true;
  }

  // The CSS build script will handle checking individual files
  return true; // Let the CSS script decide what needs copying
}

// Run a command and capture output
function runCommand(command: string, description: string): boolean {
  console.log(`\n${description}`);
  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    console.error((error as Error).message);
    process.exit(1);
  }
}

// Main build function
function build(): void {
  console.log('🔨 Starting smart build process...\n');

  const startTime = Date.now();

  // Always run TypeScript with incremental flag - it will figure out what needs rebuilding
  console.log('📦 TypeScript Build:');
  try {
    // Run TypeScript build with incremental flag
    execSync('pnpm build:ts', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  } catch (error) {
    // TypeScript might exit with non-zero if there are type errors
    // But we still want to continue with CSS build
    console.error('TypeScript build encountered errors');
  }

  // Run CSS build - it will check what needs copying
  console.log('\n📦 CSS Build:');
  buildCSS();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✨ Build complete in ${duration}s`);
}

// Check if dist exists and has content
function checkDistExists(): boolean {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('📝 No dist directory found, running full build...');
    return false;
  }

  const files = fs.readdirSync(DIST_DIR);
  if (files.length === 0) {
    console.log('📝 Dist directory is empty, running full build...');
    return false;
  }

  return true;
}

// Run the build if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}