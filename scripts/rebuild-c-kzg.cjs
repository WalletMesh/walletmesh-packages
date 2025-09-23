#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const C_KZG_PATH = path.join(__dirname, '..', 'node_modules', 'c-kzg');

/**
 * Rebuilds the c-kzg native module if it exists
 */
function rebuildCKzg() {
  console.log('Checking if c-kzg needs to be rebuilt...');

  if (!fs.existsSync(C_KZG_PATH)) {
    console.log('c-kzg not found in node_modules, skipping rebuild.');
    return;
  }

  try {
    // Check if build artifacts already exist
    const buildPath = path.join(C_KZG_PATH, 'build');
    if (fs.existsSync(buildPath) && fs.readdirSync(buildPath).length > 0) {
      console.log('c-kzg build artifacts already exist, skipping rebuild.');
      return;
    }

    console.log('Rebuilding c-kzg native module...');

    // Change to c-kzg directory and run node-gyp rebuild
    process.chdir(C_KZG_PATH);
    execSync('node-gyp rebuild', {
      stdio: 'inherit',
      env: { ...process.env },
    });

    console.log('✓ c-kzg rebuild completed successfully.');
  } catch (error) {
    console.warn('⚠️  c-kzg rebuild failed:', error.message);
    // Don't throw - allow installation to continue
  }
}

// Run if called directly
if (require.main === module) {
  rebuildCKzg();
}

module.exports = { rebuildCKzg };
