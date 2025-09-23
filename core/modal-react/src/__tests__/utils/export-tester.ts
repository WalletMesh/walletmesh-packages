/**
 * Export testing utilities
 *
 * Helpers for verifying that module exports contain expected functionality
 * and don't contain unexpected exports from other chains.
 */

import { expect } from 'vitest';

/**
 * Test that a module has expected exports and doesn't have unexpected ones
 */
export async function testExports(
  modulePath: string,
  expectedExports: string[],
  unexpectedExports: string[] = [],
) {
  try {
    // Dynamically import the module
    const moduleExports = await import(modulePath);

    // Check expected exports are present
    for (const exportName of expectedExports) {
      expect(
        moduleExports[exportName],
        `Expected export '${exportName}' to be defined in ${modulePath}`,
      ).toBeDefined();
    }

    // Check unexpected exports are not present
    for (const exportName of unexpectedExports) {
      expect(
        moduleExports[exportName],
        `Unexpected export '${exportName}' should not be defined in ${modulePath}`,
      ).toBeUndefined();
    }

    return moduleExports;
  } catch (error) {
    throw new Error(`Failed to import module ${modulePath}: ${error}`);
  }
}

/**
 * Test that a module only contains exports related to specific chains
 */
export async function testChainIsolation(
  modulePath: string,
  allowedChains: ('core' | 'aztec' | 'evm' | 'solana')[],
) {
  const moduleExports = await import(modulePath);
  const exportNames = Object.keys(moduleExports);

  // Define chain-specific patterns
  const chainPatterns = {
    aztec: ['Aztec', 'useAztec', 'createAztec'],
    evm: ['EVM', 'Evm', 'useEvm', 'Ethereum', 'Polygon', 'createEVM'],
    solana: ['Solana', 'useSolana', 'createSolana'],
  };

  // Check that only allowed chain exports are present
  for (const exportName of exportNames) {
    // Skip type exports and common utilities
    if (exportName.startsWith('type') || exportName === 'default') {
      continue;
    }

    // Check against disallowed chain patterns
    for (const [chain, patterns] of Object.entries(chainPatterns)) {
      if (!allowedChains.includes(chain as 'aztec' | 'evm' | 'solana' | 'core') && chain !== 'core') {
        for (const pattern of patterns) {
          if (exportName.includes(pattern)) {
            throw new Error(
              `Found ${chain} export '${exportName}' in ${modulePath}, ` +
                `but only ${allowedChains.join(', ')} chains are allowed`,
            );
          }
        }
      }
    }
  }
}

/**
 * Get all exports from a module as an array of names
 */
export async function getExportNames(modulePath: string): Promise<string[]> {
  const moduleExports = await import(modulePath);
  return Object.keys(moduleExports).filter((name) => name !== 'default');
}

/**
 * Compare exports between two modules
 */
export async function compareExports(
  module1Path: string,
  module2Path: string,
): Promise<{
  onlyInFirst: string[];
  onlyInSecond: string[];
  inBoth: string[];
}> {
  const exports1 = await getExportNames(module1Path);
  const exports2 = await getExportNames(module2Path);

  const set1 = new Set(exports1);
  const set2 = new Set(exports2);

  const onlyInFirst = exports1.filter((e) => !set2.has(e));
  const onlyInSecond = exports2.filter((e) => !set1.has(e));
  const inBoth = exports1.filter((e) => set2.has(e));

  return { onlyInFirst, onlyInSecond, inBoth };
}

/**
 * Test that core exports are present in a chain-specific module
 */
export async function testCoreExportsPresent(modulePath: string) {
  const coreExports = [
    // Provider and context
    'WalletMeshProvider',
    'WalletMeshContext',
    'useWalletMeshContext',

    // Core hooks
    'useConfig',
    'useTheme',
    'useSSR',
    'useWalletEvents',

    // Modal components
    'WalletMeshModal',
    'WalletMeshErrorBoundary',
    'WalletMeshErrorRecovery',

    // Utilities
    'createWalletMesh',
    'walletMeshStore',
    'ChainType',
    'TransportType',
    'ConnectionState',
  ];

  await testExports(modulePath, coreExports);
}
