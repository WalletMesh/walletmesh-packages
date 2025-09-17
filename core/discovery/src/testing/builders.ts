/**
 * Test data builders and scenario creators.
 *
 * Consolidates all test data creation utilities including responder info builders,
 * discovery request/response builders, and test scenario creators.
 *
 * @module testing/builders
 * @category Testing
 * @since 0.1.0
 */

import type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  DiscoveryCompleteEvent,
  DiscoveryErrorEvent,
  InitiatorInfo,
  TransportConfig,
} from '../types/core.js';
import type {
  CapabilityRequirements,
  CapabilityPreferences,
  ResponderInfo,
  CapabilityIntersection,
} from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import { createTestSessionId, createTestUUID, createTestResponderId } from './mocks.js';

// ============================================================================
// Basic Data Builders
// ============================================================================

/**
 * Create test initiator info.
 */
export function createTestInitiatorInfo(overrides: Partial<InitiatorInfo> = {}): InitiatorInfo {
  return {
    name: 'Test DApp',
    url: 'https://test-dapp.com',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjwvc3ZnPg==',
    description: 'Test decentralized application',
    ...overrides,
  };
}

/**
 * Create test capability requirements.
 */
export function createTestCapabilityRequirements(
  overrides: Partial<CapabilityRequirements> = {},
): CapabilityRequirements {
  return {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-1193'],
        features: ['eip-712'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
    ...overrides,
  };
}

/**
 * Create test capability preferences.
 */
export function createTestCapabilityPreferences(
  overrides: Partial<CapabilityPreferences> = {},
): CapabilityPreferences {
  return {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-6963'],
        features: ['personal-sign'],
      },
    ],
    features: ['hardware-wallet'],
    ...overrides,
  };
}

/**
 * Create test responder info.
 */
export function createTestResponderInfo(overrides: Partial<ResponderInfo> = {}): ResponderInfo {
  return {
    uuid: createTestUUID({ deterministic: true }),
    rdns: 'com.test.wallet',
    name: 'Test Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjwvc3ZnPg==',
    type: 'extension',
    version: '1.0.0',
    protocolVersion: DISCOVERY_PROTOCOL_VERSION,
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-1193', 'eip-1102'],
        features: ['eip-712', 'personal-sign'],
      },
    ],
    features: [
      { id: 'account-management', name: 'Account Management' },
      { id: 'transaction-signing', name: 'Transaction Signing' },
    ],
    description: 'Test wallet for development',
    ...overrides,
  };
}

/**
 * Create test security policy.
 */
export function createTestSecurityPolicy(overrides: Partial<SecurityPolicy> = {}): SecurityPolicy {
  return {
    requireHttps: false,
    allowLocalhost: true,
    allowedOrigins: ['https://test-dapp.com'],
    rateLimit: {
      enabled: false,
      maxRequests: 100,
      windowMs: 60000,
    },
    ...overrides,
  };
}

/**
 * Create test transport config.
 */
export function createTestTransportConfig(overrides: Partial<TransportConfig> = {}): TransportConfig {
  return {
    type: 'extension',
    extensionId: 'test-extension-id',
    metadata: {
      name: 'Test Wallet',
      version: '1.0.0',
    },
    ...overrides,
  };
}

// ============================================================================
// Discovery Event Builders
// ============================================================================

/**
 * Create test discovery request event.
 */
export function createTestDiscoveryRequestEvent(
  overrides: Partial<DiscoveryRequestEvent> = {},
): DiscoveryRequestEvent {
  return {
    type: 'discovery:wallet:request',
    version: DISCOVERY_PROTOCOL_VERSION,
    sessionId: createTestSessionId({ deterministic: true }),
    initiatorInfo: createTestInitiatorInfo(overrides.initiatorInfo),
    required: createTestCapabilityRequirements(overrides.required),
    optional: overrides.optional ?? createTestCapabilityPreferences(),
    origin: 'https://test-dapp.com',
    ...overrides,
  };
}

/**
 * Create test discovery response event.
 */
export function createTestDiscoveryResponseEvent(
  overrides: Partial<DiscoveryResponseEvent> = {},
): DiscoveryResponseEvent {
  const responderInfo = createTestResponderInfo();
  const matched: CapabilityIntersection = overrides.matched ?? {
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
  };

  return {
    type: 'discovery:wallet:response',
    version: DISCOVERY_PROTOCOL_VERSION,
    sessionId: overrides.sessionId ?? createTestSessionId({ deterministic: true }),
    responderId: overrides.responderId ?? createTestResponderId({ deterministic: true }),
    rdns: overrides.rdns ?? responderInfo.rdns,
    name: overrides.name ?? responderInfo.name,
    icon: overrides.icon ?? responderInfo.icon,
    matched,
    ...(overrides.transportConfig && { transportConfig: overrides.transportConfig }),
    ...(overrides.description && { description: overrides.description }),
    ...(overrides.responderVersion && { responderVersion: overrides.responderVersion }),
  };
}

/**
 * Create test discovery complete event.
 */
export function createTestDiscoveryCompleteEvent(
  overrides: Partial<DiscoveryCompleteEvent> = {},
): DiscoveryCompleteEvent {
  return {
    type: 'discovery:wallet:complete',
    version: DISCOVERY_PROTOCOL_VERSION,
    sessionId: overrides.sessionId ?? createTestSessionId({ deterministic: true }),
    reason: overrides.reason ?? 'timeout',
    respondersFound: overrides.respondersFound ?? 1,
  };
}

/**
 * Create test discovery error event.
 */
export function createTestDiscoveryErrorEvent(
  overrides: Partial<DiscoveryErrorEvent> = {},
): DiscoveryErrorEvent {
  return {
    type: 'discovery:wallet:error',
    version: DISCOVERY_PROTOCOL_VERSION,
    sessionId: overrides.sessionId ?? createTestSessionId({ deterministic: true }),
    errorCode: overrides.errorCode ?? 1001,
    errorMessage: overrides.errorMessage ?? 'Discovery timed out',
    errorCategory: overrides.errorCategory ?? ('protocol' as import('../types/core.js').ErrorCategory),
  };
}

// ============================================================================
// Specialized Builders
// ============================================================================

/**
 * Create Ethereum-specific test data.
 */
export const createEthereumTestData = {
  responderInfo: (overrides: Partial<ResponderInfo> = {}): ResponderInfo =>
    createTestResponderInfo({
      rdns: 'com.ethereum.wallet',
      name: 'Ethereum Wallet',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193', 'eip-1102'],
          features: ['eip-712', 'personal-sign', 'eth-sign'],
        },
      ],
      ...overrides,
    }),

  requirements: (overrides: Partial<CapabilityRequirements> = {}): CapabilityRequirements =>
    createTestCapabilityRequirements({
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
          features: ['eip-712'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
      ...overrides,
    }),
};

/**
 * Create Solana-specific test data.
 */
export const createSolanaTestData = {
  responderInfo: (overrides: Partial<ResponderInfo> = {}): ResponderInfo =>
    createTestResponderInfo({
      rdns: 'com.solana.wallet',
      name: 'Solana Wallet',
      technologies: [
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-message', 'sign-transaction'],
        },
      ],
      ...overrides,
    }),

  requirements: (overrides: Partial<CapabilityRequirements> = {}): CapabilityRequirements =>
    createTestCapabilityRequirements({
      technologies: [
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-transaction'],
        },
      ],
      features: ['account-management', 'transaction-signing'],
      ...overrides,
    }),
};

/**
 * Create Aztec-specific test data.
 */
export const createAztecTestData = {
  responderInfo: (overrides: Partial<ResponderInfo> = {}): ResponderInfo =>
    createTestResponderInfo({
      rdns: 'com.aztec.wallet',
      name: 'Aztec Wallet',
      technologies: [
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions', 'encrypted-notes'],
        },
      ],
      features: [
        { id: 'private-transactions', name: 'Private Transactions' },
        { id: 'contract-deployment', name: 'Contract Deployment' },
      ],
      ...overrides,
    }),

  requirements: (overrides: Partial<CapabilityRequirements> = {}): CapabilityRequirements =>
    createTestCapabilityRequirements({
      technologies: [
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions'],
        },
      ],
      features: ['private-transactions', 'contract-deployment'],
      ...overrides,
    }),
};

/**
 * Create multi-chain test data.
 */
export const createMultiChainTestData = {
  responderInfo: (overrides: Partial<ResponderInfo> = {}): ResponderInfo =>
    createTestResponderInfo({
      rdns: 'com.multichain.wallet',
      name: 'Multi-Chain Wallet',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
          features: ['eip-712'],
        },
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-transaction'],
        },
        {
          type: 'aztec',
          interfaces: ['aztec-wallet-api-v1'],
          features: ['private-transactions'],
        },
      ],
      features: [
        { id: 'account-management', name: 'Account Management' },
        { id: 'transaction-signing', name: 'Transaction Signing' },
        { id: 'cross-chain-swaps', name: 'Cross Chain Swaps' },
      ],
      ...overrides,
    }),

  requirements: (overrides: Partial<CapabilityRequirements> = {}): CapabilityRequirements =>
    createTestCapabilityRequirements({
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
          features: ['eip-712'],
        },
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
          features: ['sign-transaction'],
        },
      ],
      features: ['account-management', 'transaction-signing', 'cross-chain-swaps'],
      ...overrides,
    }),
};

// ============================================================================
// Test Scenario Builders
// ============================================================================

/**
 * Test scenario configuration.
 */
export interface TestScenarioConfig {
  initiatorInfo?: Partial<InitiatorInfo>;
  responderInfo?: Partial<ResponderInfo>;
  requirements?: Partial<CapabilityRequirements>;
  preferences?: Partial<CapabilityPreferences>;
  securityPolicy?: Partial<SecurityPolicy>;
  timeout?: number;
  origin?: string;
}

/**
 * Create a basic discovery test scenario.
 */
export function createBasicDiscoveryScenario(config: TestScenarioConfig = {}) {
  const initiatorInfo = createTestInitiatorInfo(config.initiatorInfo);
  const responderInfo = createTestResponderInfo(config.responderInfo);
  const requirements = createTestCapabilityRequirements(config.requirements);
  const preferences = config.preferences ? createTestCapabilityPreferences(config.preferences) : undefined;
  const securityPolicy = createTestSecurityPolicy(config.securityPolicy);

  return {
    initiatorInfo,
    responderInfo,
    requirements,
    preferences,
    securityPolicy,
    timeout: config.timeout ?? 3000,
    origin: config.origin ?? 'https://test-dapp.com',
  };
}

/**
 * Create a security rejection test scenario.
 */
export function createSecurityRejectionScenario(rejectionType: 'origin' | 'rateLimit' | 'https') {
  const base = createBasicDiscoveryScenario();

  switch (rejectionType) {
    case 'origin':
      return {
        ...base,
        securityPolicy: createTestSecurityPolicy({
          allowedOrigins: ['https://different-origin.com'],
        }),
        origin: 'https://malicious-origin.com',
      };

    case 'rateLimit':
      return {
        ...base,
        securityPolicy: createTestSecurityPolicy({
          rateLimit: {
            enabled: true,
            maxRequests: 1,
            windowMs: 60000,
          },
        }),
      };

    case 'https':
      return {
        ...base,
        securityPolicy: createTestSecurityPolicy({
          requireHttps: true,
        }),
        origin: 'http://insecure-origin.com',
      };

    default:
      return base;
  }
}

/**
 * Create a timeout test scenario.
 */
export function createTimeoutScenario(timeoutMs = 100) {
  return {
    ...createBasicDiscoveryScenario(),
    timeout: timeoutMs,
  };
}

/**
 * Create an incompatible capability scenario.
 */
export function createIncompatibleCapabilityScenario() {
  return createBasicDiscoveryScenario({
    requirements: {
      technologies: [
        {
          type: 'solana',
          interfaces: ['solana-wallet-standard'],
        },
      ],
      features: ['account-management'],
    },
    responderInfo: {
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
        },
      ],
      features: [{ id: 'transaction-signing', name: 'Transaction Signing' }],
    },
  });
}
