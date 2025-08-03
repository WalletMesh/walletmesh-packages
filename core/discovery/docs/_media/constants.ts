import type { ErrorCategory } from './types.js';

/**
 * Current version of the WalletMesh discovery protocol.
 *
 * Used to ensure compatibility between different implementations.
 * All protocol messages include this version for validation.
 *
 * @example
 * ```typescript
 * const message = {
 *   type: 'wallet:discovery:capability-request',
 *   version: DISCOVERY_PROTOCOL_VERSION,
 *   // ... other fields
 * };
 * ```
 *
 * @category Protocol
 * @since 0.1.0
 * @readonly
 */
export const DISCOVERY_PROTOCOL_VERSION = '0.1.0';

/**
 * Event types for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Defines the standardized event types used throughout the capability-first
 * discovery process. These events enable secure cross-origin
 * communication between initiators and responders.
 *
 * @example
 * ```typescript
 * // Listen for discovery responses
 * eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, handler);
 *
 * // Dispatch discovery request
 * const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, {
 *   detail: capabilityRequest
 * });
 * eventTarget.dispatchEvent(event);
 * ```
 *
 * @category Events
 * @since 0.1.0
 * @readonly
 */
export const DISCOVERY_EVENTS = {
  /**
   * Event type for discovery requests.
   * Emitted by initiators to announce their requirements.
   */
  REQUEST: 'discovery:wallet:request',

  /**
   * Event type for discovery responses.
   * Emitted by qualified responders in response to discovery requests.
   */
  RESPONSE: 'discovery:wallet:response',

  /**
   * Event type for discovery session completion.
   * Emitted when a discovery session transitions to COMPLETED state.
   */
  COMPLETE: 'discovery:wallet:complete',

  /**
   * Event type for discovery errors.
   * Emitted when a discovery session transitions to ERROR state.
   */
  ERROR: 'discovery:wallet:error',
} as const;

/**
 * Default configuration settings for the discovery protocol.
 *
 * Provides sensible defaults for timeouts, limits, and intervals
 * used throughout the discovery process. These can be overridden
 * in specific implementations as needed.
 *
 * @example
 * ```typescript
 * const customTimeout = DISCOVERY_CONFIG.DISCOVERY_TIMEOUT_MS * 2;
 * const maxSessions = DISCOVERY_CONFIG.MAX_SESSIONS_PER_ORIGIN;
 * ```
 *
 * @category Configuration
 * @since 0.1.0
 * @readonly
 */
export const DISCOVERY_CONFIG = {
  /**
   * Time in milliseconds to wait for wallet responses.
   * After this timeout, discovery is considered complete.
   *
   * @type {number}
   * @default 3000
   */
  DISCOVERY_TIMEOUT_MS: 3000,

  /**
   * Maximum age of a session in milliseconds.
   * Sessions older than this are considered expired.
   *
   * @type {number}
   * @default 300000 (5 minutes)
   */
  SESSION_MAX_AGE_MS: 5 * 60 * 1000,

  /**
   * Maximum number of requests per origin per minute.
   * Used for rate limiting to prevent abuse.
   *
   * @type {number}
   * @default 10
   */
  MAX_REQUESTS_PER_MINUTE: 10,

  /**
   * Time window for rate limiting in milliseconds.
   *
   * @type {number}
   * @default 60000 (1 minute)
   */
  RATE_LIMIT_WINDOW_MS: 60 * 1000,

  /**
   * Maximum number of concurrent sessions per origin.
   *
   * @type {number}
   * @default 5
   */
  MAX_SESSIONS_PER_ORIGIN: 5,

  /**
   * Cleanup interval for expired sessions in milliseconds.
   *
   * @type {number}
   * @default 60000 (1 minute)
   */
  CLEANUP_INTERVAL_MS: 60 * 1000,
} as const;

/**
 * Standard chain type identifiers for blockchain classification.
 *
 * Categorizes blockchain networks by their fundamental architecture
 * and transaction models. Used for capability matching and wallet
 * integration pattern selection.
 *
 * @example
 * ```typescript
 * const ethereumType = CHAIN_TYPES.EVM;     // 'evm'
 * const bitcoinType = CHAIN_TYPES.UTXO;     // 'utxo'
 * const solanaType = CHAIN_TYPES.ACCOUNT;   // 'account'
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @readonly
 * @see {@link ChainCapability} for chain-specific capabilities
 */
export const CHAIN_TYPES = {
  EVM: 'evm',
  UTXO: 'utxo',
  ACCOUNT: 'account',
  SUBSTRATE: 'substrate',
  COSMOS: 'cosmos',
  CUSTOM: 'custom',
} as const;

/**
 * Standard responder feature identifiers for capability matching.
 *
 * Features represent specific wallet functionalities beyond basic blockchain support.
 * They are one of three components that make up a wallet's complete capabilities:
 *
 * 1. **Chains**: Which blockchains are supported (e.g., 'eip155:1')
 * 2. **Features**: What the wallet can do (defined here)
 * 3. **Interfaces**: How to communicate with the wallet (e.g., 'eip-1193')
 *
 * Features focus on user-facing functionality and security characteristics,
 * helping dApps select wallets based on their specific needs.
 *
 * @example Basic wallet features
 * ```typescript
 * // Minimal wallet requirements - just the essentials
 * const basicRequirements = {
 *   chains: ['eip155:1'],
 *   features: [
 *     RESPONDER_FEATURES.ACCOUNT_MANAGEMENT,   // View accounts
 *     RESPONDER_FEATURES.TRANSACTION_SIGNING    // Sign transactions
 *   ],
 *   interfaces: ['eip-1193']
 * };
 * ```
 *
 * @example Advanced DeFi features
 * ```typescript
 * // DeFi application with enhanced requirements
 * const defiRequirements = {
 *   chains: ['eip155:1', 'eip155:137'],
 *   features: [
 *     RESPONDER_FEATURES.ACCOUNT_MANAGEMENT,
 *     RESPONDER_FEATURES.TRANSACTION_SIGNING,
 *     RESPONDER_FEATURES.BATCH_TRANSACTIONS,    // Complex DeFi operations
 *     RESPONDER_FEATURES.GASLESS_TRANSACTIONS   // Better UX
 *   ],
 *   interfaces: ['eip-1193']
 * };
 *
 * // Optional preferences for even better experience
 * const defiPreferences = {
 *   features: [
 *     RESPONDER_FEATURES.HARDWARE_WALLET,       // Enhanced security
 *     RESPONDER_FEATURES.DEFI_INTEGRATION       // DeFi-specific optimizations
 *   ]
 * };
 * ```
 *
 * @category Features
 * @since 0.1.0
 * @readonly
 * @see {@link CapabilityRequirements} for usage in requirements
 * @see {@link CapabilityPreferences} for usage in preferences
 * @see {@link ResponderFeature} for feature data structure
 */
export const RESPONDER_FEATURES = {
  /**
   * Basic account viewing and management functionality.
   * Includes listing accounts, switching active account, and account metadata.
   * This is typically a minimum requirement for any dApp connection.
   */
  ACCOUNT_MANAGEMENT: 'account-management',

  /**
   * Ability to sign and broadcast blockchain transactions.
   * Core functionality for interacting with smart contracts and sending tokens.
   * Usually paired with account-management as a basic requirement.
   */
  TRANSACTION_SIGNING: 'transaction-signing',

  /**
   * Ability to sign arbitrary messages for authentication/verification.
   * Used for proving account ownership, signing in to dApps, and creating
   * verifiable attestations without blockchain transactions.
   */
  MESSAGE_SIGNING: 'message-signing',

  /**
   * Multi-signature wallet support requiring multiple approvals.
   * Essential for DAOs, treasury management, and high-security applications
   * where transactions need approval from multiple parties.
   */
  MULTI_SIGNATURE: 'multi-signature',

  /**
   * Hardware wallet integration for enhanced security.
   * Private keys are stored in secure hardware (Ledger, Trezor, etc.),
   * providing protection against malware and remote attacks.
   */
  HARDWARE_WALLET: 'hardware-wallet',

  /**
   * Social recovery mechanisms for account access restoration.
   * Allows users to recover accounts through trusted contacts or
   * social verification, reducing dependency on seed phrases.
   */
  SOCIAL_RECOVERY: 'social-recovery',

  /**
   * Gasless transaction support (meta-transactions, relayers).
   * Enables users to perform transactions without holding native tokens
   * for gas, improving UX especially for new users.
   */
  GASLESS_TRANSACTIONS: 'gasless-transactions',

  /**
   * Batch transaction execution in a single operation.
   * Allows multiple transactions to be bundled and executed together,
   * saving gas and improving UX for complex operations.
   */
  BATCH_TRANSACTIONS: 'batch-transactions',

  /**
   * Native cross-chain swap functionality.
   * Built-in support for swapping assets across different blockchains
   * without leaving the wallet interface.
   */
  CROSS_CHAIN_SWAPS: 'cross-chain-swaps',

  /**
   * Enhanced NFT display and management features.
   * Specialized support for viewing, organizing, and interacting with
   * NFT collections beyond basic token transfers.
   */
  NFT_SUPPORT: 'nft-support',

  /**
   * Deep DeFi protocol integration and position tracking.
   * Advanced features for yield farming, liquidity provision, lending,
   * and other DeFi activities with position visualization.
   */
  DEFI_INTEGRATION: 'defi-integration',

  /**
   * Privacy-preserving transaction capabilities.
   * Support for private transactions, zero-knowledge proofs,
   * and confidential transfers (particularly for privacy chains).
   */
  PRIVATE_TRANSACTIONS: 'private-transactions',

  /**
   * Hardware acceleration for cryptographic operations.
   * Utilizes specialized hardware for faster signing, key generation,
   * and cryptographic computations.
   */
  HARDWARE_ACCELERATION: 'hardware-acceleration',
} as const;

/**
 * Standard interface identifiers for responder APIs.
 *
 * Interfaces represent the third component of a wallet's capabilities
 * (alongside chains and features). They define the programmatic API
 * standards that wallets implement for dApp communication.
 *
 * While features describe WHAT a wallet can do, interfaces describe
 * HOW dApps can interact with the wallet programmatically.
 *
 * @example Ethereum wallet interfaces
 * ```typescript
 * const ethereumRequirements = {
 *   chains: ['eip155:1'],
 *   features: ['account-management', 'transaction-signing'],
 *   interfaces: [RESPONDER_INTERFACES.EIP1193]  // Standard Ethereum provider
 * };
 * ```
 *
 * @example Multi-interface Solana wallet
 * ```typescript
 * const solanaRequirements = {
 *   chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
 *   features: ['account-management', 'transaction-signing'],
 *   interfaces: [
 *     RESPONDER_INTERFACES.SOLANA_WALLET_STANDARD,      // Solana wallet standard
 *     RESPONDER_INTERFACES.SOLANA_WALLET_ADAPTER // Adapter pattern support
 *   ]
 * };
 * ```
 *
 * @example Cross-chain wallet with multiple interfaces
 * ```typescript
 * const multiChainRequirements = {
 *   chains: ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
 *   features: ['account-management', 'cross-chain-swaps'],
 *   interfaces: [
 *     RESPONDER_INTERFACES.EIP1193,              // For Ethereum
 *     RESPONDER_INTERFACES.SOLANA_WALLET_STANDARD       // For Solana
 *   ]
 * };
 * ```
 *
 * @category Interfaces
 * @since 0.1.0
 * @readonly
 * @see {@link CapabilityRequirements} for interface requirements
 * @see {@link RESPONDER_FEATURES} for feature capabilities
 */
export const RESPONDER_INTERFACES = {
  /**
   * EIP-1193: Ethereum Provider JavaScript API.
   * Standard interface for Ethereum wallets, defining methods like
   * eth_requestAccounts, eth_sendTransaction, etc.
   */
  EIP1193: 'eip-1193',

  /**
   * Wallet Standard: Solana's standardized wallet interface.
   * Defines how wallets expose themselves and interact with Solana dApps.
   */
  SOLANA_WALLET_STANDARD: 'solana-wallet-standard',

  /**
   * Aztec Wallet API v1: Interface for privacy-focused Aztec network.
   * Supports private transactions and zero-knowledge proof operations.
   */
  AZTEC_WALLET_API_V1: 'aztec-wallet-api-v1',

  /**
   * Solana Wallet Adapter: Adapter pattern for Solana wallets.
   * Provides a unified interface for various Solana wallet implementations.
   */
  SOLANA_WALLET_ADAPTER: 'solana-wallet-adapter',

  /**
   * Phantom API: Phantom wallet's extended interface.
   * Includes additional features beyond standard Solana wallet adapter.
   */
  PHANTOM_API: 'phantom-api',
} as const;

/**
 * Standardized numeric error codes for the discovery protocol.
 *
 * Error codes follow a 4-digit numeric format with category-based ranges.
 * These codes ensure consistent error handling across implementations
 * while maintaining security and privacy principles.
 *
 * @example
 * ```typescript
 * // Check for specific error
 * if (error.code === ERROR_CODES.ORIGIN_VALIDATION_FAILED) {
 *   console.log('Origin validation failed');
 * }
 *
 * // Check error category
 * if (error.code >= 2000 && error.code < 3000) {
 *   console.log('Security error occurred');
 * }
 *
 * // Error response
 * const errorResponse = {
 *   type: 'wallet:discovery:error',
 *   error: {
 *     code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
 *     message: 'Rate limit exceeded',
 *     category: 'security'
 *   }
 * };
 * ```
 *
 * @category Errors
 * @since 0.1.0
 * @readonly
 * @see {@link DiscoveryErrorEvent} for error event structure
 * @see {@link DiscoveryError} for error handling
 */
export const ERROR_CODES = {
  // Protocol Errors (1000-1999)
  INVALID_MESSAGE_FORMAT: 1001,
  UNSUPPORTED_VERSION: 1002,
  MISSING_REQUIRED_FIELD: 1003,
  INVALID_SESSION_ID: 1004,
  MESSAGE_TOO_LARGE: 1005,
  INVALID_TIMESTAMP: 1006,
  ENCODING_ERROR: 1007,

  // Security Errors (2000-2999)
  ORIGIN_VALIDATION_FAILED: 2001,
  RATE_LIMIT_EXCEEDED: 2002,
  SESSION_REPLAY_DETECTED: 2003,
  ORIGIN_BLOCKED: 2004,
  HTTPS_REQUIRED: 2005,
  SIGNATURE_VERIFICATION_FAILED: 2006,
  UNAUTHORIZED_ACCESS: 2007,

  // Capability Errors (3000-3999)
  CAPABILITY_NOT_SUPPORTED: 3001,
  CHAIN_NOT_SUPPORTED: 3002,
  FEATURE_NOT_AVAILABLE: 3003,
  INTERFACE_NOT_IMPLEMENTED: 3004,
  CAPABILITY_TEMPORARILY_UNAVAILABLE: 3005,
  INCOMPATIBLE_CAPABILITY_VERSION: 3006,

  // Connection Errors (4000-4999)
  CONNECTION_TIMEOUT: 4001,
  CONNECTION_REJECTED: 4002,
  WALLET_NOT_FOUND: 4003,
  CONNECTION_ALREADY_EXISTS: 4004,
  CONNECTION_CLOSED: 4005,
  MAX_CONNECTIONS_REACHED: 4006,

  // Internal Errors (5000-5999)
  INTERNAL_WALLET_ERROR: 5001,
  RESOURCE_EXHAUSTED: 5002,
  STORAGE_ERROR: 5003,
  INITIALIZATION_ERROR: 5004,
  EXTENSION_NOT_READY: 5005,
} as const;

/**
 * Error messages for standardized error codes.
 *
 * Human-readable messages for each error code. These messages are
 * generic and do not expose sensitive information about wallet
 * capabilities or internal state.
 *
 * @category Errors
 * @since 0.1.0
 * @readonly
 */
export const ERROR_MESSAGES: Record<number, string> = {
  // Protocol Errors
  [ERROR_CODES.INVALID_MESSAGE_FORMAT]: 'Message does not conform to protocol schema',
  [ERROR_CODES.UNSUPPORTED_VERSION]: 'Protocol version not supported',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required message field is missing',
  [ERROR_CODES.INVALID_SESSION_ID]: 'Session ID format is invalid',
  [ERROR_CODES.MESSAGE_TOO_LARGE]: 'Message exceeds size limits',
  [ERROR_CODES.INVALID_TIMESTAMP]: 'Timestamp is invalid or expired',
  [ERROR_CODES.ENCODING_ERROR]: 'Message encoding/decoding failure',

  // Security Errors
  [ERROR_CODES.ORIGIN_VALIDATION_FAILED]: 'Origin validation failed',
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Request rate limit exceeded',
  [ERROR_CODES.SESSION_REPLAY_DETECTED]: 'Session ID has been used before',
  [ERROR_CODES.ORIGIN_BLOCKED]: 'Origin is on blocklist',
  [ERROR_CODES.HTTPS_REQUIRED]: 'HTTPS is required but not used',
  [ERROR_CODES.SIGNATURE_VERIFICATION_FAILED]: 'Message signature invalid',
  [ERROR_CODES.UNAUTHORIZED_ACCESS]: 'Access denied due to permissions',

  // Capability Errors
  [ERROR_CODES.CAPABILITY_NOT_SUPPORTED]: 'Required capability not supported',
  [ERROR_CODES.CHAIN_NOT_SUPPORTED]: 'Requested blockchain not supported',
  [ERROR_CODES.FEATURE_NOT_AVAILABLE]: 'Requested feature not available',
  [ERROR_CODES.INTERFACE_NOT_IMPLEMENTED]: 'Required interface not implemented',
  [ERROR_CODES.CAPABILITY_TEMPORARILY_UNAVAILABLE]: 'Capability temporarily unavailable',
  [ERROR_CODES.INCOMPATIBLE_CAPABILITY_VERSION]: 'Capability version mismatch',

  // Connection Errors
  [ERROR_CODES.CONNECTION_TIMEOUT]: 'Connection request timed out',
  [ERROR_CODES.CONNECTION_REJECTED]: 'User rejected connection',
  [ERROR_CODES.WALLET_NOT_FOUND]: 'Specified wallet not found',
  [ERROR_CODES.CONNECTION_ALREADY_EXISTS]: 'Connection already established',
  [ERROR_CODES.CONNECTION_CLOSED]: 'Connection was closed',
  [ERROR_CODES.MAX_CONNECTIONS_REACHED]: 'Maximum connections limit reached',

  // Internal Errors
  [ERROR_CODES.INTERNAL_WALLET_ERROR]: 'Internal wallet error occurred',
  [ERROR_CODES.RESOURCE_EXHAUSTED]: 'Wallet resources exhausted',
  [ERROR_CODES.STORAGE_ERROR]: 'Storage operation failed',
  [ERROR_CODES.INITIALIZATION_ERROR]: 'Wallet initialization failed',
  [ERROR_CODES.EXTENSION_NOT_READY]: 'Extension not fully loaded',
} as const;

/**
 * Retryable error codes indicating transient failures.
 *
 * Set of error codes that indicate transient failures which can be
 * resolved by retrying the operation. Used to implement retry logic
 * with exponential backoff. These errors typically represent temporary
 * conditions like rate limits, timeouts, or resource constraints.
 *
 * @example Retry logic implementation
 * ```typescript
 * async function retryableOperation(fn: () => Promise<void>) {
 *   let attempts = 0;
 *   const maxAttempts = 3;
 *
 *   while (attempts < maxAttempts) {
 *     try {
 *       await fn();
 *       return;
 *     } catch (error) {
 *       if (error.code && RETRYABLE_ERROR_CODES.has(error.code)) {
 *         attempts++;
 *         const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
 *         await new Promise(resolve => setTimeout(resolve, delay));
 *       } else {
 *         throw error; // Non-retryable error
 *       }
 *     }
 *   }
 *   throw new Error('Max retry attempts exceeded');
 * }
 * ```
 *
 * @example Checking if error is retryable
 * ```typescript
 * function isRetryable(errorCode: number): boolean {
 *   return RETRYABLE_ERROR_CODES.has(errorCode);
 * }
 * ```
 *
 * @category Errors
 * @since 0.1.0
 * @readonly
 * @see {@link ERROR_CODES} for error code definitions
 * @see {@link ERROR_MESSAGES} for error descriptions
 */
export const RETRYABLE_ERROR_CODES = new Set([
  ERROR_CODES.INVALID_TIMESTAMP,
  ERROR_CODES.RATE_LIMIT_EXCEEDED,
  ERROR_CODES.CAPABILITY_TEMPORARILY_UNAVAILABLE,
  ERROR_CODES.CONNECTION_TIMEOUT,
  ERROR_CODES.MAX_CONNECTIONS_REACHED,
  ERROR_CODES.INTERNAL_WALLET_ERROR,
  ERROR_CODES.RESOURCE_EXHAUSTED,
  ERROR_CODES.STORAGE_ERROR,
  ERROR_CODES.EXTENSION_NOT_READY,
]);

/**
 * Silent failure error codes for security and privacy protection.
 *
 * Set of error codes that should result in no response being sent
 * to maintain security and privacy. These errors are logged locally
 * but not communicated to the requesting party to prevent information
 * leakage about wallet capabilities or security policies.
 *
 * Silent failures are crucial for:
 * - Preventing capability enumeration attacks
 * - Hiding security policy details from potential attackers
 * - Maintaining user privacy about installed wallets
 *
 * @example Handling silent failures
 * ```typescript
 * function handleDiscoveryError(error: DiscoveryError): void {
 *   // Log locally for debugging
 *   console.error('Discovery error:', error);
 *
 *   // Check if error should be silent
 *   if (SILENT_FAILURE_CODES.has(error.code)) {
 *     // Do not send error response
 *     return;
 *   }
 *
 *   // Send error response for non-silent failures
 *   sendErrorResponse(error);
 * }
 * ```
 *
 * @example Security-aware error handling
 * ```typescript
 * try {
 *   validateOrigin(request.origin);
 * } catch (error) {
 *   if (error.code === ERROR_CODES.ORIGIN_BLOCKED) {
 *     // Silent failure - don't reveal blocklist
 *     logger.warn('Blocked origin attempted connection', { origin: request.origin });
 *     return;
 *   }
 *   throw error;
 * }
 * ```
 *
 * @category Errors
 * @since 0.1.0
 * @readonly
 * @see {@link ERROR_CODES} for error code definitions
 * @see {@link RETRYABLE_ERROR_CODES} for transient errors
 */
export const SILENT_FAILURE_CODES = new Set([
  ERROR_CODES.ORIGIN_VALIDATION_FAILED,
  ERROR_CODES.SESSION_REPLAY_DETECTED,
  ERROR_CODES.ORIGIN_BLOCKED,
  ERROR_CODES.CAPABILITY_NOT_SUPPORTED,
  ERROR_CODES.CHAIN_NOT_SUPPORTED,
]);

/**
 * Get error category from error code.
 *
 * Determines the category of an error based on its numeric code range.
 * Useful for error handling logic that needs to respond differently
 * to different types of errors.
 *
 * @example
 * ```typescript
 * const category = getErrorCategory(2001); // 'security'
 * const category = getErrorCategory(3002); // 'capability'
 *
 * switch (getErrorCategory(error.code)) {
 *   case 'security':
 *     logSecurityIncident(error);
 *     break;
 *   case 'capability':
 *     // Silent failure
 *     break;
 *   default:
 *     sendErrorResponse(error);
 * }
 * ```
 *
 * @param code - The numeric error code
 * @returns The error category or 'unknown' if code is invalid
 * @category Errors
 * @since 0.1.0
 */
export function getErrorCategory(code: number): ErrorCategory | 'unknown' {
  if (code >= 1000 && code < 2000) return 'protocol';
  if (code >= 2000 && code < 3000) return 'security';
  if (code >= 3000 && code < 4000) return 'capability';
  if (code >= 4000 && code < 5000) return 'connection';
  if (code >= 5000 && code < 6000) return 'internal';
  return 'unknown';
}
