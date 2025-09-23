/**
 * Lazy-loaded EIP-1193 provider utilities.
 *
 * This module provides lazy loading for EVM-specific functionality
 * that may not be needed by all dApps. For example, ethers.js or web3.js
 * utilities can be lazy-loaded only when an EVM wallet is connected.
 */

import { createLazyModule } from '../utils/lazy/createLazyModule.js';

// Example: Lazy load ethers.js utilities when needed
// This is optional - dApps can choose to use ethers directly
export const ethersModule = createLazyModule('ethers', {
  displayName: 'Ethers.js',
  errorMessage: 'EVM utilities require ethers to be installed',
  transform: (module: unknown) => (module as { ethers?: unknown }).ethers || module, // Handle different export styles
});

// Wrap commonly used ethers functions
export const formatEther = ethersModule.wrap<(wei: bigint | string) => string>('formatEther');
export const parseEther = ethersModule.wrap<(ether: string) => bigint>('parseEther');
export const getAddress = ethersModule.wrap<(address: string) => string>('getAddress');
export const isAddress = ethersModule.wrap<(address: string) => boolean>('isAddress');

// Example: Lazy load web3.js utilities when needed
export const web3Module = createLazyModule('web3', {
  displayName: 'Web3.js',
  errorMessage: 'EVM utilities require web3 to be installed',
});

// Example: Lazy load viem utilities when needed
export const viemModule = createLazyModule('viem', {
  displayName: 'Viem',
  errorMessage: 'EVM utilities require viem to be installed',
});

/**
 * Helper to detect which EVM library is available.
 * This allows dApps to use whichever library they have installed.
 */
export async function detectEvmLibrary(): Promise<'ethers' | 'web3' | 'viem' | null> {
  try {
    await ethersModule.getModule();
    return 'ethers';
  } catch {
    // Ethers not available
  }

  try {
    await web3Module.getModule();
    return 'web3';
  } catch {
    // Web3 not available
  }

  try {
    await viemModule.getModule();
    return 'viem';
  } catch {
    // Viem not available
  }

  return null;
}

/**
 * Format Wei to Ether using available EVM library.
 * Falls back to basic string manipulation if no library is available.
 */
export async function formatWeiToEther(wei: string | bigint): Promise<string> {
  const library = await detectEvmLibrary();

  switch (library) {
    case 'ethers':
      return formatEther(wei);

    case 'web3': {
      const web3 = (await web3Module.getModule()) as {
        utils: { fromWei: (value: string, unit: string) => string };
      };
      return web3.utils.fromWei(String(wei), 'ether');
    }

    case 'viem': {
      const viem = (await viemModule.getModule()) as { formatEther: (value: bigint) => string };
      return viem.formatEther(BigInt(wei));
    }

    default: {
      // Basic fallback without library
      const weiString = String(wei);
      const ethString = weiString.padStart(19, '0');
      const whole = ethString.slice(0, -18) || '0';
      const decimal = ethString.slice(-18).replace(/0+$/, '');
      return decimal ? `${whole}.${decimal}` : whole;
    }
  }
}
