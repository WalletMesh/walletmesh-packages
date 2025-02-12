#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'glob';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  pnpm?: {
    overrides?: Record<string, string>;
  };
}

async function updateAztecDeps(newVersion: string) {
  try {
    // Find all package.json files in the workspace
    const packageJsonFiles = await glob('**/package.json', {
      ignore: ['**/node_modules/**'],
    });

    for (const filePath of packageJsonFiles) {
      const content = await readFile(filePath, 'utf-8');
      const pkg = JSON.parse(content) as PackageJson;
      let hasChanges = false;

      // Update dependencies
      if (pkg.dependencies) {
        for (const [dep] of Object.entries(pkg.dependencies)) {
          if (dep.startsWith('@aztec/')) {
            pkg.dependencies[dep] = newVersion;
            hasChanges = true;
          }
        }
      }

      // Update devDependencies
      if (pkg.devDependencies) {
        for (const [dep] of Object.entries(pkg.devDependencies)) {
          if (dep.startsWith('@aztec/')) {
            pkg.devDependencies[dep] = newVersion;
            hasChanges = true;
          }
        }
      }

      // Update pnpm overrides in root package.json
      if (pkg.pnpm?.overrides) {
        for (const [dep] of Object.entries(pkg.pnpm.overrides)) {
          if (dep.startsWith('@aztec/')) {
            pkg.pnpm.overrides[dep] = newVersion;
            hasChanges = true;
          }
        }
      }

      if (hasChanges) {
        await writeFile(filePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8');
        console.log(`Updated ${filePath}`);
      }
    }

    console.log('\nAll @aztec/* dependencies updated to version', newVersion);
    console.log('\nRun "pnpm install" to apply the changes.');
  } catch (error) {
    console.error('Error updating dependencies:', error);
    process.exit(1);
  }
}

// Get version from command line argument
const newVersion = process.argv[2];
if (!newVersion) {
  console.error('Please provide a version number');
  console.error('Usage: pnpm update-aztec-deps <version>');
  console.error('Example: pnpm update-aztec-deps 0.72.1');
  process.exit(1);
}

// Run the update
updateAztecDeps(newVersion);
