import type { DiscoveryRequestEvent, DiscoveryResponseEvent, InitiatorInfo } from '../types/core.js';
import type { ResponderInfo, CapabilityRequirements, CapabilityPreferences } from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import type { DiscoveryInitiatorConfig } from '../types/testing.js';
import { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import { DiscoveryInitiator } from '../initiator.js';

/**
 * Create test wallet information for various blockchain types.
 *
 * This object provides factory methods for creating test ResponderInfo objects
 * for different wallet types. Each method returns a complete ResponderInfo
 * object with sensible defaults that can be overridden as needed.
 *
 * @example
 * ```typescript
 * // Create a basic Ethereum wallet
 * const ethWallet = createTestResponderInfo.ethereum();
 *
 * // Create a Solana wallet with custom name
 * const solanaWallet = createTestResponderInfo.solana({
 *   name: 'My Custom Solana Wallet'
 * });
 *
 * // Create a multi-chain wallet
 * const multiWallet = createTestResponderInfo.multiChain();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export const createTestResponderInfo = {
  /**
   * Create test Ethereum wallet info.
   *
   * Creates a ResponderInfo object for an Ethereum wallet with support for
   * mainnet and Goerli testnet. The wallet is configured as a browser extension
   * with standard EIP-1193 support.
   *
   * @param overrides - Optional properties to override the defaults
   * @returns A complete ResponderInfo object for an Ethereum wallet
   * @example
   * ```typescript
   * const wallet = createTestResponderInfo.ethereum({
   *   name: 'My Custom Ethereum Wallet',
   *   version: '2.0.0'
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  ethereum(overrides: Partial<ResponderInfo> = {}): ResponderInfo {
    const baseWallet = {
      uuid: 'test-ethereum-wallet-uuid',
      rdns: 'com.example.ethereumwallet',
      name: 'Test Ethereum Wallet',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      type: 'extension' as const,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193', 'eip-1102'],
          features: ['eip-712', 'personal-sign'],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
        },
        {
          id: 'transaction-signing',
          name: 'Transaction Signing',
        },
      ],
    };

    return { ...baseWallet, ...overrides } as ResponderInfo;
  },

  /**
   * Create test Solana wallet info.
   *
   * Creates a ResponderInfo object for a Solana wallet with support for
   * mainnet and devnet. The wallet is configured as a web wallet with
   * solana-wallet-standard support.
   *
   * @param overrides - Optional properties to override the defaults
   * @returns A complete ResponderInfo object for a Solana wallet
   * @example
   * ```typescript
   * const wallet = createTestResponderInfo.solana({
   *   type: 'extension',
   *   url: undefined // Remove the URL for extension type
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  solana(overrides: Partial<ResponderInfo> = {}): ResponderInfo {
    const baseWallet = {
      uuid: 'test-solana-wallet-uuid',
      rdns: 'com.example.solanawallet',
      name: 'Test Solana Wallet',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      type: 'web' as const,
      url: 'https://example-solana-wallet.com',
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-message', 'sign-transaction'],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
        },
        {
          id: 'transaction-signing',
          name: 'Transaction Signing',
        },
      ],
    };

    return { ...baseWallet, ...overrides } as ResponderInfo;
  },

  /**
   * Create test Aztec wallet info.
   *
   * Creates a ResponderInfo object for an Aztec wallet with support for
   * mainnet and testnet. The wallet is configured as a hardware wallet
   * with Aztec-specific features including private transactions.
   *
   * @param overrides - Optional properties to override the defaults
   * @returns A complete ResponderInfo object for an Aztec wallet
   * @example
   * ```typescript
   * const wallet = createTestResponderInfo.aztec({
   *   type: 'mobile',
   *   features: [
   *     { id: 'private-transactions', name: 'Private Transactions' },
   *     { id: 'zk-proofs', name: 'Zero-Knowledge Proofs' }
   *   ]
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  aztec(overrides: Partial<ResponderInfo> = {}): ResponderInfo {
    const baseWallet = {
      uuid: 'test-aztec-wallet-uuid',
      rdns: 'com.example.aztecwallet',
      name: 'Test Aztec Wallet',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      type: 'hardware' as const,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      description: 'A test Aztec wallet for development',
      technologies: [
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions', 'encrypted-notes'],
        },
      ],
      features: [
        {
          id: 'private-transactions',
          name: 'Private Transactions',
        },
        {
          id: 'transaction-signing',
          name: 'Transaction Signing',
        },
      ],
    };

    return { ...baseWallet, ...overrides } as ResponderInfo;
  },

  /**
   * Create test multi-chain wallet info.
   *
   * Creates a ResponderInfo object for a multi-chain wallet that supports
   * Ethereum, Solana, and Aztec networks. The wallet is configured as a
   * mobile wallet with cross-chain swap capabilities.
   *
   * @param overrides - Optional properties to override the defaults
   * @returns A complete ResponderInfo object for a multi-chain wallet
   * @example
   * ```typescript
   * const wallet = createTestResponderInfo.multiChain({
   *   technologies: [
   *     { type: 'evm', interfaces: ['eip-1193'] },
   *     { type: 'solana', interfaces: ['solana-wallet-standard'] }
   *   ]
   * });
   * ```
   * @category Testing
   * @since 1.0.0
   */
  multiChain(overrides: Partial<ResponderInfo> = {}): ResponderInfo {
    const baseWallet = {
      uuid: 'test-multichain-wallet-uuid',
      rdns: 'com.example.multichainwallet',
      name: 'Test Multi-Chain Wallet',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      type: 'mobile' as const,
      version: '1.0.0',
      protocolVersion: '0.1.0',
      description: 'A test multi-chain wallet for development',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193', 'eip-1102'],
          features: ['eip-712', 'personal-sign'],
        },
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-message', 'sign-transaction'],
        },
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions', 'encrypted-notes'],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
        },
        {
          id: 'transaction-signing',
          name: 'Transaction Signing',
        },
        {
          id: 'cross-chain-swaps',
          name: 'Cross-Chain Swaps',
        },
      ],
    };

    return { ...baseWallet, ...overrides } as ResponderInfo;
  },
};

/**
 * Create test dApp information.
 *
 * Creates a complete InitiatorInfo object representing a decentralized application (dApp)
 * for testing purposes. The default values represent a typical local development dApp.
 *
 * @param overrides - Optional properties to override the defaults
 * @returns A complete InitiatorInfo object representing a test dApp
 * @example
 * ```typescript
 * // Create a basic test dApp
 * const dapp = createTestDAppInfo();
 *
 * // Create a production dApp
 * const prodDapp = createTestDAppInfo({
 *   name: 'My DeFi App',
 *   url: 'https://mydefiapp.com',
 *   description: 'The best DeFi trading platform'
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createTestDAppInfo(overrides: Partial<InitiatorInfo> = {}): InitiatorInfo {
  return {
    name: 'Test dApp',
    url: 'http://localhost:3000',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    description: 'A test dApp for development',
    ...overrides,
  };
}

/**
 * Create test discovery request.
 *
 * Creates a complete DiscoveryRequestEvent object that a dApp would send to discover
 * compatible wallets. The request includes requirements that must be met and
 * optional preferences that are nice to have.
 *
 * @param overrides - Optional properties to override the defaults
 * @returns A complete DiscoveryRequestEvent object for testing
 * @example
 * ```typescript
 * // Create a basic discovery request
 * const request = createTestDiscoveryRequest();
 *
 * // Create a request for Solana wallets
 * const solanaRequest = createTestDiscoveryRequest({
 *   required: {
 *     technologies: [{
 *       type: 'solana',
 *       interfaces: ['solana-wallet-standard']
 *     }],
 *     features: ['account-management']
 *   }
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createTestDiscoveryRequest(
  overrides: Partial<DiscoveryRequestEvent> = {},
): DiscoveryRequestEvent {
  return {
    type: 'discovery:wallet:request',
    version: DISCOVERY_PROTOCOL_VERSION,
    sessionId: crypto.randomUUID(),
    origin: 'http://localhost:3000',
    initiatorInfo: createTestDAppInfo(),
    required: {
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
          features: ['eip-712'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
    },
    optional: {
      features: ['hardware-wallet'],
    },
    ...overrides,
  };
}

/**
 * Create a DiscoveryInitiator instance with sensible defaults for testing.
 */
export function createTestDiscoveryInitiator(
  overrides: Partial<DiscoveryInitiatorConfig> = {},
): DiscoveryInitiator {
  const requirements =
    overrides.requirements ??
    ({
      technologies: [
        {
          type: 'evm' as const,
          interfaces: ['eip-1193'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
    } satisfies CapabilityRequirements);

  const initiatorInfo = overrides.initiatorInfo ?? createTestDAppInfo();

  const options = {
    ...(overrides.timeout !== undefined && { timeout: overrides.timeout }),
    ...(overrides.eventTarget && { eventTarget: overrides.eventTarget }),
    ...(overrides.logger && { logger: overrides.logger }),
    ...(overrides.securityPolicy && { security: overrides.securityPolicy }),
  };

  return new DiscoveryInitiator(requirements, initiatorInfo, options, overrides.preferences);
}

/**
 * Create test discovery response.
 *
 * Creates a complete DiscoveryResponseEvent object that a wallet would send in response
 * to a discovery request. The response indicates which requirements the wallet
 * can fulfill and includes metadata about the wallet.
 *
 * @param overrides - Optional properties to override the defaults
 * @returns A complete DiscoveryResponseEvent object for testing
 * @example
 * ```typescript
 * // Create a basic discovery response
 * const response = createTestDiscoveryResponse();
 *
 * // Create a response with custom matched capabilities
 * const customResponse = createTestDiscoveryResponse({
 *   sessionId: request.sessionId,
 *   matched: {
 *     required: {
 *       technologies: [{
 *         type: 'evm',
 *         interfaces: ['eip-1193'],
 *         features: ['eip-712']
 *       }],
 *       features: ['account-management']
 *     },
 *     optional: {
 *       features: ['hardware-wallet'],
 *     }
 *   }
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createTestDiscoveryResponse(
  overrides: Partial<DiscoveryResponseEvent> = {},
): DiscoveryResponseEvent {
  const responderInfo = createTestResponderInfo.ethereum();

  const base: DiscoveryResponseEvent = {
    type: 'discovery:wallet:response',
    version: DISCOVERY_PROTOCOL_VERSION,
    sessionId: crypto.randomUUID(),
    responderId: responderInfo.uuid,
    rdns: responderInfo.rdns,
    name: responderInfo.name,
    icon: responderInfo.icon,
    responderVersion: responderInfo.version,
    matched: {
      required: {
        technologies: [
          {
            type: 'evm',
            interfaces: ['eip-1193'],
            features: ['eip-712'],
          },
        ],
        features: ['account-management', 'transaction-signing'],
      },
      optional: {
        features: ['hardware-wallet'],
      },
    },
  };

  return { ...base, ...overrides };
}

/**
 * Create test security policy.
 *
 * Creates a complete SecurityPolicy object with sensible defaults for testing.
 * The default policy is permissive to facilitate testing but includes common
 * security configurations that can be overridden.
 *
 * @param overrides - Optional properties to override the defaults
 * @returns A complete SecurityPolicy object for testing
 * @example
 * ```typescript
 * // Create a restrictive security policy
 * const strictPolicy = createTestSecurityPolicy({
 *   allowedOrigins: ['https://myapp.com'],
 *   requireHttps: true,
 *   allowLocalhost: false,
 *   rateLimit: {
 *     enabled: true,
 *     maxRequests: 10,
 *     windowMs: 60000
 *   }
 * });
 *
 * // Create a development-friendly policy
 * const devPolicy = createTestSecurityPolicy({
 *   allowLocalhost: true,
 *   requireHttps: false
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createTestSecurityPolicy(overrides: Partial<SecurityPolicy> = {}): SecurityPolicy {
  return {
    // Don't specify allowedOrigins to allow any origin (for testing)
    blockedOrigins: ['https://malicious-site.com'],
    requireHttps: false,
    allowLocalhost: true,
    certificateValidation: false,
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60 * 1000,
    },
    ...overrides,
  };
}

/**
 * Create test discovery configuration with sensible defaults.
 *
 * @param overrides - Optional property overrides
 * @returns Complete discovery configuration for testing
 */
export function createTestDiscoveryConfig(
  overrides: { timeout?: number; maxResponders?: number; eventTarget?: EventTarget } = {},
): {
  timeout: number;
  maxResponders: number;
  eventTarget: EventTarget;
} {
  return {
    timeout: 3000,
    maxResponders: 10,
    eventTarget: globalThis.window || new EventTarget(),
    ...overrides,
  };
}

/**
 * Create test capability requirements.
 *
 * This object provides factory methods for creating CapabilityRequirements
 * for different blockchain types. These are used to specify what a dApp
 * requires from wallets during the discovery process.
 *
 * @example
 * ```typescript
 * // Get Ethereum requirements
 * const ethReqs = createTestCapabilityRequirements.ethereum();
 *
 * // Get multi-chain requirements
 * const multiReqs = createTestCapabilityRequirements.multiChain();
 *
 * // Use in a discovery request
 * const request = createTestDiscoveryRequest({
 *   required: createTestCapabilityRequirements.solana()
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export const createTestCapabilityRequirements = {
  /**
   * Create Ethereum capability requirements.
   *
   * Returns requirements for Ethereum mainnet with EIP-1193 support
   * and basic account management features.
   *
   * @returns CapabilityRequirements for Ethereum
   * @category Testing
   * @since 1.0.0
   */
  ethereum(): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
    };
  },

  /**
   * Create Solana capability requirements.
   *
   * Returns requirements for Solana mainnet with solana-wallet-standard support
   * and basic account management features.
   *
   * @returns CapabilityRequirements for Solana
   * @category Testing
   * @since 1.0.0
   */
  solana(): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
    };
  },

  /**
   * Create Aztec capability requirements.
   *
   * Returns requirements for Aztec mainnet with support for private
   * transactions and the Aztec wallet API.
   *
   * @returns CapabilityRequirements for Aztec
   * @category Testing
   * @since 1.0.0
   */
  aztec(): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
        },
      ],
      features: ['private-transactions', 'transaction-signing'],
    };
  },

  /**
   * Create multi-chain capability requirements.
   *
   * Returns requirements for both Ethereum and Solana mainnet,
   * suitable for testing cross-chain dApps.
   *
   * @returns CapabilityRequirements for multiple chains
   * @category Testing
   * @since 1.0.0
   */
  multiChain(): CapabilityRequirements {
    return {
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
        },
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
    };
  },
};

/**
 * Create test capability preferences.
 *
 * This object provides factory methods for creating CapabilityPreferences
 * which represent optional nice-to-have features that a dApp would prefer
 * but doesn't require.
 *
 * @example
 * ```typescript
 * // Get basic preferences
 * const basicPrefs = createTestCapabilityPreferences.basic();
 *
 * // Get advanced preferences
 * const advancedPrefs = createTestCapabilityPreferences.advanced();
 *
 * // Use in a discovery request
 * const request = createTestDiscoveryRequest({
 *   required: createTestCapabilityRequirements.ethereum(),
 *   optional: createTestCapabilityPreferences.basic()
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export const createTestCapabilityPreferences = {
  /**
   * Create basic capability preferences.
   *
   * Returns preferences for testnet support, hardware wallet features,
   * and hardware wallet support.
   *
   * @returns Basic CapabilityPreferences
   * @category Testing
   * @since 1.0.0
   */
  basic(): CapabilityPreferences {
    return {
      features: ['hardware-wallet'],
    };
  },

  /**
   * Create advanced capability preferences.
   *
   * Returns preferences for Layer 2 chains (Polygon, Arbitrum),
   * and advanced security features.
   *
   * @returns Advanced CapabilityPreferences
   * @category Testing
   * @since 1.0.0
   */
  advanced(): CapabilityPreferences {
    return {
      features: ['multi-signature', 'social-recovery'],
    };
  },
};

/**
 * Utility to wait for a specific amount of time (useful in tests).
 *
 * This function creates a promise that resolves after the specified number
 * of milliseconds. Useful for simulating delays or waiting in tests.
 *
 * @param ms - Number of milliseconds to wait
 * @returns A promise that resolves after the specified delay
 * @example
 * ```typescript
 * // Wait for 1 second
 * await waitFor(1000);
 *
 * // Wait between operations
 * await operation1();
 * await waitFor(500); // Wait 500ms
 * await operation2();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Utility to wait for a condition to be true.
 *
 * Polls a condition function at regular intervals until it returns true
 * or the timeout is reached. Throws an error if the timeout is exceeded.
 *
 * @param condition - Function that returns true when the condition is met
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 5000)
 * @param intervalMs - Polling interval in milliseconds (default: 100)
 * @returns A promise that resolves when the condition is met
 * @throws Error if the condition is not met within the timeout
 * @example
 * ```typescript
 * // Wait for an element to be visible
 * await waitForCondition(() => element.isVisible());
 *
 * // Wait with custom timeout and interval
 * await waitForCondition(
 *   () => wallet.isConnected(),
 *   10000, // 10 second timeout
 *   200    // Check every 200ms
 * );
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function waitForCondition(
  condition: () => boolean,
  timeoutMs = 5000,
  intervalMs = 100,
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Condition not met within ${timeoutMs}ms`);
    }
    await waitFor(intervalMs);
  }
}

/**
 * Generate a random test session ID.
 *
 * Creates a unique session identifier with a 'test-session-' prefix
 * for easy identification in logs and debugging.
 *
 * @returns A unique test session ID
 * @example
 * ```typescript
 * const sessionId = generateTestSessionId();
 * // Returns: 'test-session-123e4567-e89b-12d3-a456-426614174000'
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function generateTestSessionId(): string {
  return `test-session-${crypto.randomUUID()}`;
}

/**
 * Generate a random test wallet ID.
 *
 * Creates a unique wallet identifier with a 'test-wallet-' prefix
 * for easy identification in logs and debugging.
 *
 * @returns A unique test wallet ID
 * @example
 * ```typescript
 * const walletId = generateTestWalletId();
 * // Returns: 'test-wallet-123e4567-e89b-12d3-a456-426614174000'
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function generateTestWalletId(): string {
  return `test-wallet-${crypto.randomUUID()}`;
}

/**
 * Generate a random test origin.
 *
 * Creates a realistic HTTPS origin URL by combining random subdomains
 * and domains. Useful for testing origin validation and security policies.
 *
 * @returns A random HTTPS origin URL
 * @example
 * ```typescript
 * const origin = generateTestOrigin();
 * // Possible returns:
 * // 'https://app.example.com'
 * // 'https://dapp.test.org'
 * // 'https://wallet.demo.net'
 * // 'https://defi.example.com'
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function generateTestOrigin(): string {
  const domains = ['example.com', 'test.org', 'demo.net'];
  const subdomains = ['app', 'dapp', 'wallet', 'defi'];

  const subdomain = subdomains[Math.floor(Math.random() * subdomains.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];

  return `https://${subdomain}.${domain}`;
}
