/**
 * Custom test matchers for WalletMesh domain-specific assertions
 *
 * Provides domain-specific Jest/Vitest matchers for more readable
 * and expressive test assertions.
 */

import { expect } from 'vitest';
import { ChainType } from '../../types.js';
import type { WalletInfo } from '../../types.js';

interface ExpectationResult {
  pass: boolean;
  message: () => string;
}

type MatcherFunction<TArgs extends unknown[] = []> = (
  this: unknown,
  received: unknown,
  ...args: TArgs
) => ExpectationResult;

/**
 * Custom matcher to check if a wallet connection result is valid
 */
const toBeValidConnectionResult: MatcherFunction<[]> = (received: unknown) => {
  const obj = received as Record<string, unknown>;
  const pass =
    received &&
    typeof received === 'object' &&
    'address' in obj &&
    typeof obj['address'] === 'string' &&
    obj['address'].length > 0 &&
    'walletId' in obj &&
    typeof obj['walletId'] === 'string' &&
    obj['walletId'].length > 0 &&
    'chainId' in obj &&
    typeof obj['chainId'] === 'string' &&
    obj['chainId'].length > 0 &&
    'chainType' in obj &&
    Object.values(ChainType).includes(obj['chainType'] as ChainType) &&
    'accounts' in obj &&
    Array.isArray(obj['accounts']) &&
    obj['accounts'].length > 0;

  if (pass) {
    return {
      message: () => `Expected ${JSON.stringify(received)} not to be a valid connection result`,
      pass: true,
    };
  }
  return {
    message: () =>
      `Expected ${JSON.stringify(received)} to be a valid connection result with address, walletId, chainId, chainType, and accounts`,
    pass: false,
  };
};

/**
 * Custom matcher to check if an object is a valid WalletInfo
 */
const toBeValidWalletInfo: MatcherFunction<[]> = (received: unknown) => {
  const obj = received as Record<string, unknown>;
  const pass =
    received &&
    typeof received === 'object' &&
    typeof obj['id'] === 'string' &&
    obj['id'].length > 0 &&
    typeof obj['name'] === 'string' &&
    obj['name'].length > 0 &&
    typeof obj['icon'] === 'string' &&
    Array.isArray(obj['chains']) &&
    obj['chains'].length > 0 &&
    obj['chains'].every((chain: unknown) => Object.values(ChainType).includes(chain as ChainType));

  if (pass) {
    return {
      message: () => `Expected ${JSON.stringify(received)} not to be a valid wallet info`,
      pass: true,
    };
  }
  return {
    message: () =>
      `Expected ${JSON.stringify(received)} to be a valid wallet info with id, name, icon, and chains`,
    pass: false,
  };
};

/**
 * Custom matcher to check if an error is a WalletMesh error
 */
const toBeWalletMeshError: MatcherFunction<[string?]> = (received: unknown, expectedCode?: string) => {
  const obj = received as Record<string, unknown>;
  const isWalletMeshError =
    received &&
    typeof received === 'object' &&
    typeof obj['code'] === 'string' &&
    typeof obj['message'] === 'string' &&
    typeof obj['category'] === 'string';

  if (!isWalletMeshError) {
    return {
      message: () =>
        `Expected ${JSON.stringify(received)} to be a WalletMesh error with code, message, and category`,
      pass: false,
    };
  }

  if (expectedCode && obj['code'] !== expectedCode) {
    return {
      message: () => `Expected error code to be "${expectedCode}" but got "${obj['code']}"`,
      pass: false,
    };
  }

  return {
    message: () => `Expected ${JSON.stringify(received)} not to be a WalletMesh error`,
    pass: true,
  };
};

/**
 * Custom matcher to check wallet connection state
 */
const toHaveConnectionState: MatcherFunction<[string]> = (received: unknown, expectedState: string) => {
  const obj = received as Record<string, unknown>;
  const hasConnectionState =
    received &&
    typeof received === 'object' &&
    obj['connection'] &&
    (obj['connection'] as Record<string, unknown>)['state'] === expectedState;

  if (hasConnectionState) {
    return {
      message: () => `Expected connection state not to be "${expectedState}"`,
      pass: true,
    };
  }
  const actualState = (obj?.['connection'] as Record<string, unknown> | undefined)?.['state'] || 'undefined';
  return {
    message: () => `Expected connection state to be "${expectedState}" but got "${actualState}"`,
    pass: false,
  };
};

/**
 * Custom matcher to check if wallet supports chain
 */
const toSupportChain: MatcherFunction<[ChainType]> = (received: unknown, chainType: ChainType) => {
  const receivedWallet = received as WalletInfo;
  const supportsChain = receivedWallet?.chains?.includes(chainType);

  if (supportsChain) {
    return {
      message: () => `Expected wallet "${receivedWallet.name}" not to support chain type "${chainType}"`,
      pass: true,
    };
  }
  const supportedChains = receivedWallet?.chains?.join(', ') || 'none';
  return {
    message: () =>
      `Expected wallet "${receivedWallet?.name || 'unknown'}" to support chain type "${chainType}", but it only supports: ${supportedChains}`,
    pass: false,
  };
};

/**
 * Custom matcher to check if address is valid for chain type
 */
const toBeValidAddressForChain: MatcherFunction<[ChainType]> = (received: unknown, chainType: ChainType) => {
  const address = received as string;
  let isValid = false;
  let expectedFormat = '';

  switch (chainType) {
    case ChainType.Evm:
      isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
      expectedFormat = '0x followed by 40 hex characters';
      break;
    case ChainType.Solana:
      isValid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      expectedFormat = '32-44 base58 characters';
      break;
    case ChainType.Aztec:
      isValid = /^0x[a-fA-F0-9]{64}$/.test(address);
      expectedFormat = '0x followed by 64 hex characters';
      break;
    default:
      expectedFormat = 'unknown format';
  }

  if (isValid) {
    return {
      message: () => `Expected "${address}" not to be a valid ${chainType} address`,
      pass: true,
    };
  }
  return {
    message: () => `Expected "${address}" to be a valid ${chainType} address (${expectedFormat})`,
    pass: false,
  };
};

/**
 * Custom matcher to check if session state is valid
 */
const toBeValidSessionState: MatcherFunction<[]> = (received: unknown) => {
  const obj = received as Record<string, unknown>;
  const pass =
    received &&
    typeof received === 'object' &&
    typeof obj['sessionId'] === 'string' &&
    typeof obj['walletId'] === 'string' &&
    typeof obj['status'] === 'string' &&
    ['connected', 'connecting', 'disconnected', 'error'].includes(obj['status'] as string) &&
    typeof obj['primaryAddress'] === 'string' &&
    Array.isArray(obj['addresses']) &&
    (obj['addresses'] as unknown[]).length > 0;

  if (pass) {
    return {
      message: () => `Expected ${JSON.stringify(received)} not to be a valid session state`,
      pass: true,
    };
  }
  return {
    message: () =>
      `Expected ${JSON.stringify(received)} to be a valid session state with sessionId, walletId, status, primaryAddress, and addresses`,
    pass: false,
  };
};

/**
 * Custom matcher to check mock function calls with wallet context
 */
const toHaveBeenCalledWithWallet: MatcherFunction<[string]> = (received: unknown, walletId: string) => {
  if (typeof received !== 'function' || !('mock' in received)) {
    return {
      message: () => `Expected ${received} to be a mock function`,
      pass: false,
    };
  }

  const mockFn = received as { mock: { calls: unknown[][] } };
  const calls = mockFn.mock.calls;
  const hasWalletCall = calls.some((call: unknown[]) =>
    call.some(
      (arg) =>
        (typeof arg === 'string' && arg === walletId) ||
        (typeof arg === 'object' && (arg as Record<string, unknown>)?.['walletId'] === walletId),
    ),
  );

  if (hasWalletCall) {
    return {
      message: () => `Expected mock function not to have been called with wallet "${walletId}"`,
      pass: true,
    };
  }
  return {
    message: () => `Expected mock function to have been called with wallet "${walletId}"`,
    pass: false,
  };
};

/**
 * Extend Vitest expect with custom matchers
 */
declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: Must match Vitest's Assertion interface declaration
  interface Assertion<T = any> {
    toBeValidConnectionResult(): T;
    toBeValidWalletInfo(): T;
    toBeWalletMeshError(expectedCode?: string): T;
    toHaveConnectionState(expectedState: string): T;
    toSupportChain(chainType: ChainType): T;
    toBeValidAddressForChain(chainType: ChainType): T;
    toBeValidSessionState(): T;
    toHaveBeenCalledWithWallet(walletId: string): T;
  }
}

/**
 * Install custom matchers
 */
export function installCustomMatchers() {
  expect.extend({
    toBeValidConnectionResult,
    toBeValidWalletInfo,
    toBeWalletMeshError,
    toHaveConnectionState,
    toSupportChain,
    toBeValidAddressForChain,
    toBeValidSessionState,
    toHaveBeenCalledWithWallet,
  });
}

/**
 * Export matchers for manual use
 */
export const customMatchers = {
  toBeValidConnectionResult,
  toBeValidWalletInfo,
  toBeWalletMeshError,
  toHaveConnectionState,
  toSupportChain,
  toBeValidAddressForChain,
  toBeValidSessionState,
  toHaveBeenCalledWithWallet,
} as const;

/**
 * Helper function to create domain-specific assertions
 */
export const walletMeshAssertions = {
  /**
   * Assert that a connection result is valid and contains expected data
   */
  expectValidConnection: (result: unknown, expectedWalletId?: string) => {
    expect(result).toBeValidConnectionResult();
    if (expectedWalletId) {
      expect((result as Record<string, unknown>)['walletId']).toBe(expectedWalletId);
    }
  },

  /**
   * Assert that a wallet info object is valid
   */
  expectValidWallet: (wallet: unknown, expectedChains?: ChainType[]) => {
    expect(wallet).toBeValidWalletInfo();
    if (expectedChains) {
      for (const chain of expectedChains) {
        expect(wallet).toSupportChain(chain);
      }
    }
  },

  /**
   * Assert that an error is a WalletMesh error with specific properties
   */
  expectWalletMeshError: (error: unknown, code?: string, category?: string) => {
    expect(error).toBeWalletMeshError(code);
    if (category) {
      expect((error as Record<string, unknown>)['category']).toBe(category);
    }
  },

  /**
   * Assert that a mock was called with wallet-related parameters
   */
  expectWalletAction: (mockFn: unknown, walletId: string, action?: string) => {
    expect(mockFn).toHaveBeenCalledWithWallet(walletId);
    if (action) {
      expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ action }));
    }
  },

  /**
   * Assert chain compatibility
   */
  expectChainCompatibility: (address: string, chainType: ChainType) => {
    expect(address).toBeValidAddressForChain(chainType);
  },
} as const;
