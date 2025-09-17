/**
 * Capability presets for common blockchain ecosystems.
 *
 * Provides pre-configured capability requirements and responder information
 * for popular blockchain networks. These presets replace the factory functions
 * with simple, composable objects.
 *
 * @module presets
 * @category Presets
 * @since 0.1.0
 */

import type {
  CapabilityRequirements,
  TechnologyCapability,
  ResponderFeature,
} from '../types/capabilities.js';

/**
 * Pre-configured capability requirements for popular blockchain ecosystems.
 *
 * Use these presets as starting points for common integration scenarios.
 * They can be customized by spreading and overriding specific properties.
 *
 * @example Basic usage
 * ```typescript
 * const initiator = new DiscoveryInitiator(
 *   CAPABILITY_PRESETS.ethereum,
 *   { name: 'My App', url: 'https://myapp.com' }
 * );
 * ```
 *
 * @example Customized preset
 * ```typescript
 * const customRequirements = {
 *   ...CAPABILITY_PRESETS.ethereum,
 *   features: [...CAPABILITY_PRESETS.ethereum.features, 'hardware-wallet']
 * };
 * ```
 *
 * @category Presets
 * @since 0.1.0
 */
export const CAPABILITY_PRESETS: Record<string, CapabilityRequirements> = {
  /**
   * Ethereum ecosystem requirements.
   * Supports EVM-compatible chains with EIP-1193 provider interface.
   */
  ethereum: {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-1193'],
        features: ['eip-712', 'personal-sign'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
  },

  /**
   * Polygon ecosystem requirements.
   * Uses same EVM technology as Ethereum.
   */
  polygon: {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-1193'],
        features: ['eip-712', 'personal-sign'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
  },

  /**
   * Solana ecosystem requirements.
   * Supports Solana wallets with standard wallet interface.
   */
  solana: {
    technologies: [
      {
        type: 'solana',
        interfaces: ['solana-wallet-standard'],
        features: ['sign-message', 'sign-transaction'],
      },
    ],
    features: ['account-management', 'transaction-signing'],
  },

  /**
   * Aztec ecosystem requirements.
   * Supports privacy-focused Aztec network with private transactions.
   */
  aztec: {
    technologies: [
      {
        type: 'aztec',
        interfaces: ['aztec-wallet-api-v1'],
        features: ['private-transactions', 'encrypted-notes'],
      },
    ],
    features: ['private-transactions', 'contract-deployment', 'token-management'],
  },

  /**
   * Multi-chain requirements.
   * Supports EVM, Solana, and Aztec ecosystems.
   */
  multiChain: {
    technologies: [
      {
        type: 'evm',
        interfaces: ['eip-1193'],
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
    features: ['account-management', 'transaction-signing', 'cross-chain-swaps'],
  },
} as const;

/**
 * Pre-configured technology capabilities for wallet responders.
 *
 * Use these presets to quickly configure wallet capabilities
 * for different blockchain ecosystems.
 *
 * @example Basic usage
 * ```typescript
 * const responderInfo = {
 *   // ... other responder fields
 *   technologies: [RESPONDER_PRESETS.ethereum],
 *   features: FEATURE_PRESETS.basic
 * };
 * ```
 *
 * @category Presets
 * @since 0.1.0
 */
export const RESPONDER_PRESETS: Record<string, TechnologyCapability> = {
  /**
   * Ethereum technology capability for wallet responders.
   */
  ethereum: {
    type: 'evm',
    interfaces: ['eip-1193', 'eip-1102'],
    features: ['eip-712', 'personal-sign', 'eth-sign'],
  },

  /**
   * Solana technology capability for wallet responders.
   */
  solana: {
    type: 'solana',
    interfaces: ['solana-wallet-standard'],
    features: ['sign-message', 'sign-transaction', 'sign-and-send-transaction'],
  },

  /**
   * Aztec technology capability for wallet responders.
   */
  aztec: {
    type: 'aztec',
    interfaces: ['aztec-wallet-api-v1'],
    features: ['private-transactions', 'encrypted-notes', 'proof-generation'],
  },
} as const;

/**
 * Pre-configured feature sets for wallet responders.
 *
 * Common combinations of wallet features that can be used
 * to quickly configure responder capabilities.
 *
 * @category Presets
 * @since 0.1.0
 */
export const FEATURE_PRESETS: Record<string, ResponderFeature[]> = {
  /**
   * Basic wallet features for simple integrations.
   */
  basic: [
    { id: 'account-management', name: 'Account Management' },
    { id: 'transaction-signing', name: 'Transaction Signing' },
  ],

  /**
   * Enhanced wallet features for advanced integrations.
   */
  enhanced: [
    { id: 'account-management', name: 'Account Management' },
    { id: 'transaction-signing', name: 'Transaction Signing' },
    { id: 'message-signing', name: 'Message Signing' },
    { id: 'batch-transactions', name: 'Batch Transactions' },
  ],

  /**
   * DeFi-focused wallet features.
   */
  defi: [
    { id: 'account-management', name: 'Account Management' },
    { id: 'transaction-signing', name: 'Transaction Signing' },
    { id: 'message-signing', name: 'Message Signing' },
    { id: 'batch-transactions', name: 'Batch Transactions' },
    { id: 'gasless-transactions', name: 'Gasless Transactions' },
    { id: 'defi-integration', name: 'DeFi Integration' },
  ],

  /**
   * Privacy-focused wallet features.
   */
  privacy: [
    { id: 'account-management', name: 'Account Management' },
    { id: 'transaction-signing', name: 'Transaction Signing' },
    { id: 'private-transactions', name: 'Private Transactions' },
    { id: 'hardware-wallet', name: 'Hardware Wallet' },
    { id: 'social-recovery', name: 'Social Recovery' },
  ],

  /**
   * Enterprise wallet features.
   */
  enterprise: [
    { id: 'account-management', name: 'Account Management' },
    { id: 'transaction-signing', name: 'Transaction Signing' },
    { id: 'multi-signature', name: 'Multi Signature' },
    { id: 'hardware-wallet', name: 'Hardware Wallet' },
    { id: 'batch-transactions', name: 'Batch Transactions' },
    { id: 'defi-integration', name: 'DeFi Integration' },
  ],
} as const;
