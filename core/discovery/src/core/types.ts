import type { CHAIN_TYPES, DISCOVERY_PROTOCOL_VERSION } from './constants.js';
import type { Logger } from './logger.js';

// Re-export Logger type so it's available from types.js
export type { Logger };

/**
 * Base interface for all discovery protocol messages.
 *
 * All protocol messages extend this interface to ensure consistent
 * structure and enable protocol version compatibility checks.
 *
 * @example
 * ```typescript
 * const message: BaseDiscoveryMessage = {
 *   type: 'discovery:wallet:request',
 *   version: '0.1.0',
 *   sessionId: crypto.randomUUID()
 * };
 * ```
 *
 * @category Protocol
 * @since 0.1.0
 * @see {@link DiscoveryRequestEvent} for request messages
 * @see {@link DiscoveryResponseEvent} for response messages
 * @see {@link DiscoveryCompleteEvent} for completion events
 * @see {@link DiscoveryErrorEvent} for error events
 */
export interface BaseDiscoveryMessage {
  type: string;
  version: typeof DISCOVERY_PROTOCOL_VERSION;
  sessionId: string;
}

/**
 * Initiator information for identification in discovery requests.
 *
 * Provides responder users with context about the requesting application
 * to make informed connection decisions. The icon should be a data URI
 * for Content Security Policy compliance.
 *
 * @example
 * ```typescript
 * const initiatorInfo: InitiatorInfo = {
 *   name: 'UniSwap Interface',
 *   url: 'https://app.uniswap.org',
 *   icon: 'data:image/svg+xml;base64,PHN2Zy4uLg==',
 *   description: 'Decentralized trading protocol'
 * };
 * ```
 *
 * @category Protocol
 * @since 0.1.0
 * @see {@link DiscoveryRequestEvent} for usage in discovery requests
 * @see {@link DiscoveryInitiatorConfig} for configuration setup
 */
export interface InitiatorInfo {
  name: string;
  icon?: string;
  url: string;
  description?: string;
}

/**
 * Capability requirements specification for responder discovery.
 *
 * Capabilities represent the complete set of functionalities a wallet can provide,
 * organized into three distinct categories:
 *
 * - **chains**: Blockchain networks the wallet supports (e.g., 'eip155:1' for Ethereum mainnet)
 * - **features**: Wallet-specific functionalities (e.g., 'hardware-wallet', 'batch-transactions')
 * - **interfaces**: API standards the wallet implements (e.g., 'eip-1193' for EVM wallets)
 *
 * Together, these three categories form the wallet's complete capability profile.
 * All requirements must be fulfilled for a responder to qualify for connection.
 *
 * @example Basic requirements
 * ```typescript
 * const requirements: CapabilityRequirements = {
 *   chains: ['eip155:1'],                              // Must support Ethereum mainnet
 *   features: ['account-management'],                   // Must have account management
 *   interfaces: ['eip-1193']                           // Must implement EIP-1193 standard
 * };
 * ```
 *
 * @example Advanced multi-chain requirements
 * ```typescript
 * const requirements: CapabilityRequirements = {
 *   chains: ['eip155:1', 'eip155:137'],                // Ethereum AND Polygon
 *   features: ['transaction-signing', 'hardware-wallet'], // Transaction signing AND hardware security
 *   interfaces: ['eip-1193', 'eip-6963']               // Multiple interface standards
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link CapabilityPreferences} for optional preferences
 * @see {@link RESPONDER_FEATURES} in constants.ts for standard feature identifiers
 */
export interface CapabilityRequirements {
  /**
   * Blockchain networks that must be supported.
   * Uses CAIP-2 chain identifiers (e.g., 'eip155:1' for Ethereum mainnet).
   * ALL specified chains must be supported by the wallet.
   */
  chains: string[];

  /**
   * Wallet features that must be available.
   * These represent specific functionalities beyond basic blockchain support,
   * such as hardware security, batch transactions, or gasless operations.
   * See RESPONDER_FEATURES for standard values.
   */
  features: string[];

  /**
   * API interfaces that must be implemented for wallet communication.
   * These define how dApps can interact with the wallet programmatically.
   * Examples: 'eip-1193' for Ethereum providers, 'solana-wallet-standard' for Solana.
   */
  interfaces: string[];
}

/**
 * Optional capability preferences for enhanced responder matching.
 *
 * While CapabilityRequirements define what a wallet MUST support,
 * preferences indicate what would be nice to have. These help rank
 * and prioritize wallets that go beyond the minimum requirements.
 *
 * Preferences use the same three-category model as requirements:
 * chains and features.
 *
 * @example Basic preferences
 * ```typescript
 * const preferences: CapabilityPreferences = {
 *   features: ['hardware-wallet']  // Prefer hardware security if available
 * };
 * ```
 *
 * @example Comprehensive preferences
 * ```typescript
 * const preferences: CapabilityPreferences = {
 *   chains: ['eip155:42161'],      // Also nice to have Arbitrum support
 *   features: [
 *     'hardware-wallet',           // Prefer hardware security
 *     'batch-transactions',        // Prefer batch operation support
 *     'gasless-transactions'       // Prefer gasless UX
 *   ]
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link CapabilityRequirements} for mandatory requirements
 */
export interface CapabilityPreferences {
  /**
   * Additional blockchain networks that would be beneficial.
   * These chains are not required but having them increases wallet ranking.
   */
  chains?: string[];

  /**
   * Additional wallet features that would enhance the user experience.
   * These are "nice to have" capabilities beyond the required features.
   */
  features?: string[];
}

/**
 * Discovery request event sent by initiators to discover qualified responders.
 *
 * Initiates the capability-first discovery process where initiators broadcast
 * their requirements and only qualified responders respond. This preserves
 * responder privacy by avoiding enumeration of all available responders.
 *
 * @example
 * ```typescript
 * const request: DiscoveryRequestEvent = {
 *   type: 'discovery:wallet:request',
 *   version: '0.1.0',
 *   sessionId: crypto.randomUUID(),
 *   required: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   origin: 'https://mydapp.com',
 *   initiatorInfo: {
 *     name: 'My dApp',
 *     url: 'https://mydapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryResponseEvent} for responder responses
 * @see {@link DiscoveryInitiator} for initiator-side implementation
 */
export interface DiscoveryRequestEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:request';

  // Functional requirements
  required: CapabilityRequirements;
  optional?: CapabilityPreferences;

  // Request context
  origin: string;
  initiatorInfo: InitiatorInfo;
}

/**
 * Capability intersection between responder and initiator requirements.
 *
 * This represents the exact overlap between what the dApp requested and
 * what the wallet can provide. It contains only capabilities that are
 * both requested by the initiator AND supported by the responder.
 *
 * This privacy-preserving approach ensures wallets never reveal capabilities
 * that weren't specifically requested, preventing capability enumeration attacks.
 *
 * The intersection maintains the same three-category structure:
 * - chains: Blockchains both requested and supported
 * - features: Functionalities both requested and available
 * - interfaces: API standards both requested and implemented
 *
 * @example Basic intersection
 * ```typescript
 * // If dApp requests: ['eip155:1', 'eip155:137']
 * // And wallet supports: ['eip155:1', 'eip155:137', 'eip155:42161']
 * // Intersection will be: ['eip155:1', 'eip155:137'] (not revealing Arbitrum)
 *
 * const intersection: CapabilityIntersection = {
 *   required: {
 *     chains: ['eip155:1', 'eip155:137'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   }
 * };
 * ```
 *
 * @example Intersection with preferences
 * ```typescript
 * const intersection: CapabilityIntersection = {
 *   required: {
 *     chains: ['eip155:1'],
 *     features: ['account-management', 'transaction-signing'],
 *     interfaces: ['eip-1193']
 *   },
 *   optional: {
 *     features: ['hardware-wallet']  // Wallet has this preferred feature
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link CapabilityMatcher} for intersection calculation
 * @see {@link CapabilityRequirements} for requirement structure
 * @see {@link CapabilityPreferences} for preference structure
 */
export interface CapabilityIntersection {
  /**
   * The intersection of required capabilities.
   * All of these were requested as mandatory and are supported by the wallet.
   */
  required: CapabilityRequirements;

  /**
   * The intersection of optional preferences.
   * These were requested as "nice to have" and are supported by the wallet.
   */
  optional?: Partial<CapabilityPreferences>;
}

/**
 * Transport configuration for wallet connections.
 *
 * Specifies how dApps should connect to the wallet, including
 * transport type and necessary configuration parameters.
 *
 * @example Extension transport
 * ```typescript
 * const extensionTransport: TransportConfig = {
 *   type: 'extension',
 *   extensionId: 'abcdefghijklmnop',
 *   walletAdapter: 'MetaMaskAdapter'
 * };
 * ```
 *
 * @example Popup transport
 * ```typescript
 * const popupTransport: TransportConfig = {
 *   type: 'popup',
 *   popupUrl: 'https://wallet.example.com/connect',
 *   adapterConfig: {
 *     windowFeatures: 'width=400,height=600'
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.2.0
 */
export interface TransportConfig {
  /**
   * Type of transport to use for wallet connection
   */
  type: 'extension' | 'popup' | 'websocket' | 'injected';

  /**
   * Chrome extension ID (required for extension transport)
   */
  extensionId?: string;

  /**
   * Popup window URL (required for popup transport)
   */
  popupUrl?: string;

  /**
   * WebSocket endpoint URL (required for websocket transport)
   */
  websocketUrl?: string;

  /**
   * Wallet adapter class name to use (e.g., 'MetaMaskAdapter', 'PhantomAdapter')
   * This helps dApps select the appropriate adapter implementation
   */
  walletAdapter?: string;

  /**
   * Additional adapter-specific configuration
   */
  adapterConfig?: Record<string, unknown>;
}

/**
 * Discovery response event sent by responders that can fulfill requirements.
 *
 * Only sent by responders that can satisfy ALL required capabilities.
 * Contains responder identification, capability intersection, and optional
 * metadata for user selection.
 *
 * @example
 * ```typescript
 * const response: DiscoveryResponseEvent = {
 *   type: 'discovery:wallet:announce',
 *   version: '0.1.0',
 *   sessionId: 'session-uuid',
 *   timestamp: Date.now(),
 *   responderId: crypto.randomUUID(), // Ephemeral ID
 *   rdns: 'com.example.wallet',
 *   name: 'Example Wallet',
 *   icon: 'data:image/png;base64,...',
 *   matched: {
 *     required: {
 *       chains: ['eip155:1'],
 *       features: ['account-management'],
 *       interfaces: ['eip-1193']
 *     }
 *   },
 *   responderVersion: '1.2.3',
 *   // Transport configuration
 *   transportConfig: {
 *     type: 'extension',
 *     extensionId: 'abcdefghijklmnop',
 *     walletAdapter: 'MetaMaskAdapter'
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryRequestEvent} for discovery initiation
 * @see {@link DiscoveryResponder} for responder-side implementation
 */
export interface DiscoveryResponseEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:response';

  // Responder identification
  responderId: string; // Ephemeral GUID
  rdns: string; // Stable reverse DNS identifier
  name: string;
  icon: string; // Data URI

  // Capability intersection (ONLY what initiator requested)
  matched: CapabilityIntersection;

  // Optional metadata
  responderVersion?: string;
  description?: string;

  // Transport configuration (NEW in 0.2.0)
  transportConfig?: TransportConfig;
}

/**
 * Account information from connected wallet.
 *
 * Represents a blockchain account with address, chain information,
 * and optional metadata for user identification.
 *
 * @example
 * ```typescript
 * const account: Account = {
 *   address: '0x742d35Cc6Bf1C82a1e05e1b7bd9Ec7E2E7CE',
 *   chainId: 'eip155:1',
 *   publicKey: '0x04abc123...', // Optional for some chains
 *   name: 'Main Account'        // Optional user-defined name
 * };
 * ```
 *
 * @category Connection
 * @since 0.1.0
 * @see Account information used during connection phase
 */
export interface Account {
  address: string;
  chainId: string;
  publicKey?: string;
  name?: string;
}

/**
 * Error categories for standardized error codes.
 *
 * Groups error codes by type for easier identification and handling.
 * Each category represents a different aspect of protocol operation.
 *
 * @category Protocol
 * @since 0.1.0
 */
export type ErrorCategory = 'protocol' | 'security' | 'capability' | 'connection' | 'internal';

/**
 * Protocol error structure for internal error handling.
 *
 * Used internally by implementations to represent and handle
 * protocol errors before converting to DiscoveryErrorEvent messages.
 *
 * @example
 * ```typescript
 * const protocolError: ProtocolError = {
 *   code: 2001,
 *   message: 'Origin validation failed',
 *   category: 'security',
 *   retryable: false,
 *   silent: true  // Don't expose to prevent information leakage
 * };
 * ```
 *
 * @category Protocol
 * @since 0.1.0
 * @internal
 */
export interface ProtocolError {
  code: number;
  message: string;
  category: ErrorCategory;
  retryable: boolean;
  silent?: boolean;
}

/**
 * Chain type classification for blockchain networks.
 *
 * Categorizes blockchains by their fundamental architecture and
 * transaction models to enable appropriate wallet integration.
 *
 * @example
 * ```typescript
 * const chainType: ChainType = 'evm'; // Ethereum Virtual Machine
 * const chainType: ChainType = 'account'; // Account-based (Solana, Aztec)
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link CHAIN_TYPES} for available values
 */
export type ChainType = (typeof CHAIN_TYPES)[keyof typeof CHAIN_TYPES];

/**
 * Network information for a blockchain network.
 *
 * Contains essential network metadata including native currency,
 * RPC endpoints, and block explorer URLs for wallet integration.
 *
 * @example
 * ```typescript
 * const network: NetworkInfo = {
 *   name: 'Ethereum Mainnet',
 *   chainId: 'eip155:1',
 *   nativeCurrency: {
 *     name: 'Ether',
 *     symbol: 'ETH',
 *     decimals: 18
 *   },
 *   rpcUrls: ['https://ethereum.publicnode.com'],
 *   blockExplorerUrls: ['https://etherscan.io'],
 *   testnet: false
 * };
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link ChainCapability} for full chain capabilities
 */
export interface NetworkInfo {
  name: string;
  chainId: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  testnet: boolean;
}

/**
 * Transaction type specification for blockchain operations.
 *
 * Defines a standardized transaction type that can be supported across
 * different blockchain architectures. This enables wallets to declare
 * their transaction capabilities precisely.
 *
 * @example EVM transfer transaction
 * ```typescript
 * const evmTransfer: TransactionType = {
 *   id: 'evm-transfer',
 *   name: 'Token Transfer',
 *   chainTypes: ['evm'],
 *   parameters: [{
 *     name: 'to',
 *     type: 'address',
 *     required: true,
 *     description: 'Recipient address'
 *   }, {
 *     name: 'value',
 *     type: 'uint256',
 *     required: true,
 *     description: 'Amount to transfer'
 *   }],
 *   validator: 'evm-transfer-validator',
 *   estimator: 'evm-gas-estimator'
 * };
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link ParameterSpec} for parameter definitions
 * @see {@link ChainCapability} for transaction type usage
 */
export interface TransactionType {
  id: string;
  name: string;
  chainTypes: ChainType[];
  parameters: ParameterSpec[];
  validator?: string;
  estimator?: string;
}

/**
 * Parameter specification for transaction and method arguments.
 *
 * Defines the structure, type, and validation rules for parameters
 * used in blockchain transactions and RPC methods. Enables type-safe
 * and validated parameter handling.
 *
 * @example Address parameter
 * ```typescript
 * const addressParam: ParameterSpec = {
 *   name: 'recipient',
 *   type: 'address',
 *   required: true,
 *   description: 'Recipient wallet address',
 *   validation: [{
 *     type: 'pattern',
 *     value: /^0x[a-fA-F0-9]{40}$/,
 *     message: 'Invalid Ethereum address format'
 *   }]
 * };
 * ```
 *
 * @example Amount parameter with validation
 * ```typescript
 * const amountParam: ParameterSpec = {
 *   name: 'amount',
 *   type: 'uint256',
 *   required: true,
 *   description: 'Transfer amount in wei',
 *   validation: [
 *     { type: 'min', value: 1, message: 'Amount must be positive' },
 *     { type: 'max', value: '1000000000000000000000', message: 'Amount exceeds limit' }
 *   ]
 * };
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link ValidationRule} for validation options
 * @see {@link TransactionType} for usage in transactions
 */
export interface ParameterSpec {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  validation?: ValidationRule[];
}

/**
 * Validation rule for parameter values.
 *
 * Provides flexible validation options for transaction and method parameters,
 * supporting both built-in and custom validation logic.
 *
 * @example Min/max validation
 * ```typescript
 * const minRule: ValidationRule = {
 *   type: 'min',
 *   value: 0,
 *   message: 'Value cannot be negative'
 * };
 *
 * const maxRule: ValidationRule = {
 *   type: 'max',
 *   value: 1000000,
 *   message: 'Value exceeds maximum allowed'
 * };
 * ```
 *
 * @example Pattern validation
 * ```typescript
 * const hexRule: ValidationRule = {
 *   type: 'pattern',
 *   value: /^0x[a-fA-F0-9]+$/,
 *   message: 'Value must be a valid hex string'
 * };
 * ```
 *
 * @example Custom validation
 * ```typescript
 * const customRule: ValidationRule = {
 *   type: 'custom',
 *   value: 'checksum-validator',
 *   message: 'Invalid checksum'
 * };
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link ParameterSpec} for usage in parameter definitions
 */
export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: unknown;
  message?: string;
}

/**
 * Chain-specific feature definition for advanced blockchain capabilities.
 *
 * Describes optional features that a wallet supports for a specific blockchain,
 * beyond basic transaction sending. These features help initiators select
 * wallets with the capabilities they need.
 *
 * @example Smart contract interaction
 * ```typescript
 * const smartContracts: ChainFeature = {
 *   id: 'smart-contracts',
 *   name: 'Smart Contract Interaction',
 *   description: 'Full support for deploying and interacting with smart contracts',
 *   configuration: {
 *     supportsCreate2: true,
 *     maxCodeSize: 24576,
 *     supportsDelegate: true
 *   }
 * };
 * ```
 *
 * @example Token standards
 * ```typescript
 * const tokenSupport: ChainFeature = {
 *   id: 'erc-tokens',
 *   name: 'ERC Token Support',
 *   description: 'Native support for ERC-20, ERC-721, and ERC-1155',
 *   configuration: {
 *     standards: ['ERC-20', 'ERC-721', 'ERC-1155'],
 *     autoDetection: true,
 *     batchTransfers: true
 *   }
 * };
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link ChainCapability} for feature integration
 */
export interface ChainFeature {
  id: string;
  name: string;
  description?: string;
  configuration?: Record<string, unknown>;
}

/**
 * Comprehensive blockchain capability information.
 *
 * Defines all capabilities a wallet supports for a specific blockchain,
 * including transaction types, signature schemes, and advanced features.
 * This enables precise capability matching during discovery.
 *
 * @example
 * ```typescript
 * const capability: ChainCapability = {
 *   chainId: 'eip155:1',
 *   chainType: 'evm',
 *   network: {
 *     name: 'Ethereum Mainnet',
 *     chainId: 'eip155:1',
 *     nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
 *     testnet: false
 *   },
 *   standards: ['eip-1193', 'eip-6963'], // Provider interfaces
 *   rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
 *   transactionTypes: [{
 *     id: 'transfer',
 *     name: 'Token Transfer',
 *     chainTypes: ['evm'],
 *     parameters: []
 *   }],
 *   signatureSchemes: ['secp256k1'],
 *   features: [{
 *     id: 'smart-contracts',
 *     name: 'Smart Contract Interaction'
 *   }]
 * };
 * ```
 *
 * @category Blockchain
 * @since 0.1.0
 * @see {@link ResponderInfo} for responder-level capabilities
 * @see {@link CapabilityMatcher} for matching logic
 */
export interface ChainCapability {
  // Chain identification
  chainId: string;
  chainType: ChainType;
  network: NetworkInfo;

  // Supported standards and protocols
  standards: string[]; // Provider interfaces like 'eip-1193', 'eip-6963', etc.
  rpcMethods: string[];

  // Transaction capabilities
  transactionTypes: TransactionType[];
  signatureSchemes: string[];

  // Advanced features
  features: ChainFeature[];
  extensions?: Record<string, unknown>;
}

/**
 * Responder feature definition for wallet-specific functionalities.
 *
 * Features represent the second component of a wallet's capabilities
 * (alongside chains and interfaces). They describe specific functionalities
 * that go beyond basic blockchain support, such as:
 *
 * - Security features (hardware wallet, multi-sig)
 * - Transaction features (batch operations, gasless)
 * - User experience features (social recovery, cross-chain swaps)
 *
 * Features help dApps select wallets based on their specific needs
 * beyond just blockchain compatibility.
 *
 * @example Security feature
 * ```typescript
 * const hardwareFeature: ResponderFeature = {
 *   id: 'hardware-wallet',
 *   name: 'Hardware Security Module',
 *   description: 'Private keys stored in secure hardware',
 *   version: '2.1.0',
 *   configuration: {
 *     deviceTypes: ['ledger', 'trezor'],
 *     securityLevel: 'fips-140-2'
 *   }
 * };
 * ```
 *
 * @example Transaction feature
 * ```typescript
 * const batchFeature: ResponderFeature = {
 *   id: 'batch-transactions',
 *   name: 'Batch Transaction Support',
 *   description: 'Execute multiple transactions in a single operation',
 *   configuration: {
 *     maxBatchSize: 10,
 *     atomicExecution: true
 *   }
 * };
 * ```
 *
 * @category Responder
 * @since 0.1.0
 * @see {@link ResponderInfo} for how features are integrated into wallet info
 * @see {@link RESPONDER_FEATURES} in constants.ts for standard feature identifiers
 * @see {@link CapabilityRequirements} for how features are requested
 */
export interface ResponderFeature {
  /**
   * Unique identifier for the feature.
   * Should match values in RESPONDER_FEATURES when using standard features.
   */
  id: string;

  /**
   * Human-readable name for the feature.
   */
  name: string;

  /**
   * Detailed description of what this feature provides.
   */
  description?: string;

  /**
   * Version of the feature implementation.
   */
  version?: string;

  /**
   * Feature-specific configuration and metadata.
   * Structure varies by feature type.
   */
  configuration?: Record<string, unknown>;
}

/**
 * Responder deployment type classification.
 *
 * Categorizes responders by their deployment model, which affects
 * integration patterns, security considerations, and user experience.
 *
 * @example
 * ```typescript
 * const browserExtension: ResponderType = 'extension';
 * const webResponder: ResponderType = 'web';
 * const mobileApp: ResponderType = 'mobile';
 * const hardwareDevice: ResponderType = 'hardware';
 * ```
 *
 * @category Responder
 * @since 0.1.0
 * @see {@link ResponderInfo} for usage context
 * @see {@link ResponderPlatform} for platform-specific requirements
 * @see {@link TransportConfig} for connection configuration by type
 */
export type ResponderType = 'extension' | 'web' | 'mobile' | 'desktop' | 'hardware';

/**
 * Platform-specific requirements and compatibility information.
 *
 * Defines the operating systems, browsers, devices, and other platform-specific
 * requirements for a wallet responder. Helps ensure compatibility before
 * attempting connections.
 *
 * @example Browser extension requirements
 * ```typescript
 * const extensionPlatform: ResponderPlatform = {
 *   browsers: ['chrome', 'firefox', 'edge'],
 *   os: ['windows', 'macos', 'linux'],
 *   requirements: {
 *     minBrowserVersion: {
 *       chrome: 90,
 *       firefox: 85,
 *       edge: 90
 *     },
 *     permissions: ['storage', 'tabs']
 *   }
 * };
 * ```
 *
 * @example Mobile wallet requirements
 * ```typescript
 * const mobilePlatform: ResponderPlatform = {
 *   os: ['ios', 'android'],
 *   devices: ['phone', 'tablet'],
 *   requirements: {
 *     minOSVersion: {
 *       ios: '14.0',
 *       android: '10.0'
 *     },
 *     features: ['biometric-auth', 'secure-enclave']
 *   }
 * };
 * ```
 *
 * @category Responder
 * @since 0.1.0
 * @see {@link BaseResponderInfo} for platform usage
 */
export interface ResponderPlatform {
  os?: string[];
  browsers?: string[];
  devices?: string[];
  requirements?: Record<string, unknown>;
}

/**
 * Wallet verification and trust information.
 *
 * Contains cryptographic proofs and certificates that establish the
 * authenticity and trustworthiness of a wallet responder. Used for
 * security-critical applications requiring verified wallets.
 *
 * @example Code signing certificate
 * ```typescript
 * const verification: VerificationInfo = {
 *   certificate: 'MIIDXTCCAkWgAwIBAgIJAKl...',
 *   signature: '0x1234567890abcdef...',
 *   authority: 'DigiCert Code Signing CA',
 *   timestamp: 1640995200000
 * };
 * ```
 *
 * @example Domain verification
 * ```typescript
 * const domainVerification: VerificationInfo = {
 *   certificate: 'SSL certificate data...',
 *   authority: 'Let\'s Encrypt',
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link BaseResponderInfo} for verification usage
 */
export interface VerificationInfo {
  certificate?: string;
  signature?: string;
  authority?: string;
  timestamp?: number;
}

/**
 * Permission model specification for wallet access control.
 *
 * Defines the permission structure that wallets use to control access
 * to various operations. Supports both required permissions that must
 * be granted and optional permissions that enhance functionality.
 *
 * @example Basic permission model
 * ```typescript
 * const permissions: PermissionModel = {
 *   required: ['view-accounts', 'sign-transactions'],
 *   optional: ['sign-messages', 'encrypt-decrypt'],
 *   scopes: {
 *     'sign-transactions': ['eth_sendTransaction', 'eth_signTransaction'],
 *     'sign-messages': ['eth_sign', 'personal_sign', 'eth_signTypedData']
 *   }
 * };
 * ```
 *
 * @example DeFi-focused permissions
 * ```typescript
 * const defiPermissions: PermissionModel = {
 *   required: ['view-accounts', 'sign-transactions'],
 *   optional: ['token-approvals', 'defi-positions'],
 *   scopes: {
 *     'token-approvals': ['unlimited', 'per-transaction'],
 *     'defi-positions': ['read-only', 'manage']
 *   }
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link BaseResponderInfo} for permission model usage
 */
export interface PermissionModel {
  required: string[];
  optional?: string[];
  scopes?: Record<string, string[]>;
}

/**
 * Base responder information schema for discovery protocol.
 *
 * Comprehensive responder metadata including identification, capabilities,
 * security features, and platform requirements. Used for capability
 * matching and user selection during discovery.
 *
 * @example
 * ```typescript
 * const responderInfo: BaseResponderInfo = {
 *   name: 'Example Wallet',
 *   icon: 'data:image/svg+xml;base64,...',
 *   rdns: 'com.example.wallet',
 *   uuid: crypto.randomUUID(),
 *   version: '1.2.3',
 *   protocolVersion: '0.1.0',
 *   type: 'extension',
 *   chains: [{
 *     chainId: 'eip155:1',
 *     chainType: 'evm',
 *     // ... chain capabilities
 *   }],
 *   features: [{
 *     id: 'hardware-wallet',
 *     name: 'Hardware Security'
 *   }],
 *   // NEW: Transport configuration
 *   transportConfig: {
 *     type: 'extension',
 *     extensionId: 'abcdefghijklmnop',
 *     walletAdapter: 'MetaMaskAdapter'
 *   }
 * };
 * ```
 *
 * @category Responder
 * @since 0.1.0
 * @see {@link ExtensionResponderInfo} for browser extension responders
 * @see {@link WebResponderInfo} for web-based responders
 * @see {@link DiscoveryResponder} for announcement implementation
 */
export interface BaseResponderInfo {
  // Core identification
  name: string;
  icon: string; // Base64 data URI
  rdns: string; // Reverse DNS identifier
  uuid: string; // Unique responder instance identifier

  // Version and compatibility
  version: string;
  protocolVersion: string;

  // Deployment information
  type: ResponderType;
  platform?: ResponderPlatform;

  // Blockchain capabilities
  chains: ChainCapability[];
  features: ResponderFeature[];

  // Transport configuration (NEW in 0.2.0)
  transportConfig?: TransportConfig;

  // Security and trust
  verification?: VerificationInfo;
  permissions?: PermissionModel;
}

/**
 * Extension-specific responder information for browser extensions.
 *
 * Extends base responder info with extension-specific metadata like
 * extension ID for enhanced security.
 *
 * @example
 * ```typescript
 * const extensionResponder: ExtensionResponderInfo = {
 *   // ... base responder properties
 *   type: 'extension',
 *   extensionId: 'abcdefghijklmnop'
 * };
 * ```
 *
 * @category Responder
 * @since 0.1.0
 * @see {@link BaseResponderInfo} for common properties
 */
export interface ExtensionResponderInfo extends BaseResponderInfo {
  type: 'extension';
  extensionId?: string;
}

/**
 * Web-based responder information for hosted responders.
 *
 * Extends base responder info with web-specific metadata like
 * the responder's web interface URL.
 *
 * @example
 * ```typescript
 * const webResponder: WebResponderInfo = {
 *   // ... base responder properties
 *   type: 'web',
 *   url: 'https://wallet.example.com'
 * };
 * ```
 *
 * @category Responder
 * @since 0.1.0
 * @see {@link BaseResponderInfo} for common properties
 */
export interface WebResponderInfo extends BaseResponderInfo {
  type: 'web';
  url: string;
}

/**
 * Union type for all responder information types.
 *
 * Discriminated union that includes all supported responder deployment
 * types with their specific properties and constraints.
 *
 * @category Responder
 * @since 0.1.0
 */
export type ResponderInfo = ExtensionResponderInfo | WebResponderInfo | BaseResponderInfo;

/**
 * Qualified responder information for user selection.
 *
 * Simplified responder representation containing only the information
 * needed for user selection after capability matching. Includes
 * the capability intersection to show what the responder can provide.
 *
 * @example
 * ```typescript
 * const qualified: QualifiedResponder = {
 *   responderId: 'ephemeral-uuid',
 *   rdns: 'com.example.wallet',
 *   name: 'Example Wallet',
 *   icon: 'data:image/svg+xml;base64,...',
 *   matched: {
 *     required: {
 *       chains: ['eip155:1'],
 *       features: ['account-management'],
 *       interfaces: ['eip-1193']
 *     }
 *   },
 *   // NEW: Transport configuration
 *   transportConfig: {
 *     type: 'extension',
 *     extensionId: 'abcdefghijklmnop',
 *     walletAdapter: 'MetaMaskAdapter'
 *   },
 *   metadata: {
 *     version: '1.2.3',
 *     responseTimestamp: Date.now()
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryResponseEvent} for source data
 * @see {@link DiscoveryInitiator} for collection
 */
export interface QualifiedResponder {
  responderId: string; // Ephemeral GUID
  rdns: string;
  name: string;
  icon: string;
  matched: CapabilityIntersection;
  transportConfig?: TransportConfig; // NEW in 0.2.0
  metadata?: Record<string, unknown>;
}

/**
 * Security policy configuration for discovery protocol.
 *
 * Comprehensive security settings including origin validation,
 * HTTPS enforcement, rate limiting, and session management.
 * Essential for production deployment security.
 *
 * @example Strict production policy:
 * ```typescript
 * const strictPolicy: SecurityPolicy = {
 *   allowedOrigins: ['https://mydapp.com'],
 *   requireHttps: true,
 *   allowLocalhost: false,
 *   certificateValidation: true,
 *   maxSessionAge: 3600000, // 1 hour
 *   rateLimit: {
 *     enabled: true,
 *     maxRequests: 10,
 *     windowMs: 60000
 *   }
 * };
 * ```
 *
 * @example Development policy:
 * ```typescript
 * const devPolicy: SecurityPolicy = {
 *   requireHttps: false,
 *   allowLocalhost: true,
 *   rateLimit: {
 *     enabled: false,
 *     maxRequests: 100,
 *     windowMs: 60000
 *   }
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link OriginValidator} for origin validation
 * @see {@link RateLimiter} for rate limiting
 */
export interface SecurityPolicy {
  allowedOrigins?: string[];
  blockedOrigins?: string[];
  requireHttps?: boolean;
  allowLocalhost?: boolean;
  certificateValidation?: boolean;
  contentSecurityPolicy?: string;
  maxSessionAge?: number;
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * Session tracking and management options.
 *
 * Configures how discovery sessions are tracked, validated, and cleaned up.
 * Essential for preventing session replay attacks and managing resource usage.
 *
 * @example Production session config
 * ```typescript
 * const sessionOptions: SessionOptions = {
 *   maxAge: 300000,              // 5 minutes
 *   cleanupInterval: 60000,      // 1 minute
 *   maxSessionsPerOrigin: 10     // Limit concurrent sessions
 * };
 * ```
 *
 * @example Development session config
 * ```typescript
 * const devSessionOptions: SessionOptions = {
 *   maxAge: 3600000,             // 1 hour
 *   cleanupInterval: 300000,     // 5 minutes
 *   maxSessionsPerOrigin: 100    // Higher limit for testing
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link DiscoveryResponderConfig} for session configuration
 */
export interface SessionOptions {
  maxAge: number;
  cleanupInterval: number;
  maxSessionsPerOrigin: number;
}

/**
 * Discovery error information for error tracking and debugging.
 *
 * Provides structured error information for discovery protocol failures,
 * including origin tracking for security analysis and detailed context
 * for debugging.
 *
 * @example Origin validation error
 * ```typescript
 * const error: DiscoveryError = {
 *   code: 'ORIGIN_BLOCKED',
 *   message: 'Origin is not in allowlist',
 *   origin: 'https://malicious-site.com',
 *   sessionId: 'session-123',
 *   timestamp: Date.now(),
 *   details: {
 *     allowedOrigins: ['https://trusted-app.com'],
 *     attemptedOrigin: 'https://malicious-site.com'
 *   }
 * };
 * ```
 *
 * @example Capability mismatch error
 * ```typescript
 * const capabilityError: DiscoveryError = {
 *   code: 'CAPABILITY_NOT_SUPPORTED',
 *   message: 'Required chain not supported',
 *   sessionId: 'session-456',
 *   timestamp: Date.now(),
 *   details: {
 *     requested: ['eip155:1'],
 *     supported: ['eip155:137']
 *   }
 * };
 * ```
 *
 * @category Errors
 * @since 0.1.0
 * @see {@link DiscoveryErrorEvent} for protocol error events
 * @see {@link DiscoveryErrorEvent} for error event handling
 * @see {@link ERROR_CODES} in constants.ts for standard error codes
 * @see {@link SecurityPolicy} for origin validation configuration
 */
export interface DiscoveryError {
  code: string;
  message: string;
  origin?: string;
  sessionId?: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Rate limiting configuration for request throttling.
 *
 * Prevents abuse and denial-of-service attacks by limiting the number
 * of requests from a single origin within a time window.
 *
 * @example Standard rate limiting
 * ```typescript
 * const rateLimit: RateLimitConfig = {
 *   enabled: true,
 *   maxRequests: 10,
 *   windowMs: 60000  // 10 requests per minute
 * };
 * ```
 *
 * @example Strict rate limiting for production
 * ```typescript
 * const strictRateLimit: RateLimitConfig = {
 *   enabled: true,
 *   maxRequests: 5,
 *   windowMs: 60000  // 5 requests per minute
 * };
 * ```
 *
 * @example Disabled for development
 * ```typescript
 * const devRateLimit: RateLimitConfig = {
 *   enabled: false,
 *   maxRequests: 1000,
 *   windowMs: 60000
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link SecurityPolicy} for rate limit integration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  enabled: boolean;
}

/**
 * Origin validation result for security checks.
 *
 * Contains the outcome of origin validation including the validated origin,
 * validation status, and any failure reasons for audit logging.
 *
 * @example Successful validation
 * ```typescript
 * const valid: OriginValidationResult = {
 *   valid: true,
 *   origin: 'https://trusted-app.com',
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @example Failed validation
 * ```typescript
 * const invalid: OriginValidationResult = {
 *   valid: false,
 *   origin: 'http://insecure-app.com',
 *   reason: 'HTTPS required but HTTP used',
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @example Blocked origin
 * ```typescript
 * const blocked: OriginValidationResult = {
 *   valid: false,
 *   origin: 'https://blocked-site.com',
 *   reason: 'Origin is in blocklist',
 *   timestamp: Date.now()
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link OriginValidator} for validation implementation
 */
export interface OriginValidationResult {
  valid: boolean;
  origin: string;
  reason?: string;
  timestamp: number;
}

/**
 * Session tracking state for managing active discovery sessions.
 *
 * Maintains the internal state needed for session validation, rate limiting,
 * and cleanup. Used by responders to prevent session replay attacks and
 * enforce rate limits.
 *
 * @example Session state structure
 * ```typescript
 * const sessionState: SessionTrackingState = {
 *   usedSessions: new Map([
 *     ['https://app1.com', new Set(['session-1', 'session-2'])],
 *     ['https://app2.com', new Set(['session-3'])]
 *   ]),
 *   sessionTimestamps: new Map([
 *     ['https://app1.com', new Map([
 *       ['session-1', 1640995200000],
 *       ['session-2', 1640995260000]
 *     ])]
 *   ]),
 *   requestCounts: new Map([
 *     ['https://app1.com', [1640995200000, 1640995210000, 1640995220000]]
 *   ]),
 *   lastCleanup: 1640995200000
 * };
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @internal
 * @see {@link SessionOptions} for configuration
 */
export interface SessionTrackingState {
  usedSessions: Map<string, Set<string>>;
  sessionTimestamps: Map<string, Map<string, number>>;
  requestCounts: Map<string, number[]>;
  lastCleanup: number;
}

/**
 * Configuration for initiator-side discovery listener.
 *
 * Defines capability requirements, initiator information, security policy,
 * and operational parameters for discovering qualified responders.
 *
 * @example Basic configuration:
 * ```typescript
 * const config: DiscoveryInitiatorConfig = {
 *   requirements: {
 *     chains: ['eip155:1'],
 *     features: ['account-management'],
 *     interfaces: ['eip-1193']
 *   },
 *   initiatorInfo: {
 *     name: 'My dApp',
 *     url: 'https://mydapp.com',
 *     icon: 'data:image/svg+xml;base64,...'
 *   },
 *   timeout: 5000,
 *   securityPolicy: {
 *     requireHttps: true,
 *     allowLocalhost: false
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryInitiator} for implementation
 */
export interface DiscoveryInitiatorConfig {
  requirements: CapabilityRequirements;
  preferences?: CapabilityPreferences;
  initiatorInfo: InitiatorInfo;
  securityPolicy?: SecurityPolicy;
  timeout?: number;
  eventTarget?: EventTarget;
  logger?: Logger;
}

/**
 * Configuration for responder-side discovery announcer.
 *
 * Defines responder information, security policies, and session management
 * settings for responding to discovery requests from initiators.
 *
 * @example Basic configuration:
 * ```typescript
 * const config: DiscoveryResponderConfig = {
 *   responderInfo: {
 *     name: 'My Wallet',
 *     rdns: 'com.example.wallet',
 *     uuid: crypto.randomUUID(),
 *     version: '1.0.0',
 *     protocolVersion: '0.1.0',
 *     type: 'extension',
 *     icon: 'data:image/svg+xml;base64,...',
 *     chains: [], // chain capabilities
 *     features: [] // responder features
 *   },
 *   securityPolicy: {
 *     allowedOrigins: ['https://trusted-dapp.com'],
 *     requireHttps: true,
 *     rateLimit: {
 *       enabled: true,
 *       maxRequests: 5,
 *       windowMs: 60000
 *     }
 *   }
 * };
 * ```
 *
 * @category Discovery
 * @since 0.1.0
 * @see {@link DiscoveryResponder} for implementation
 */
export interface DiscoveryResponderConfig {
  responderInfo: ResponderInfo;
  securityPolicy?: SecurityPolicy;
  sessionOptions?: SessionOptions;
  eventTarget?: EventTarget;
  logger?: Logger;
}

/**
 * Configuration for connection lifecycle management.
 *
 * Defines limits, timeouts, and retry behavior for managing
 * wallet connections after successful discovery.
 *
 * @example
 * ```typescript
 * const config: ConnectionManagerConfig = {
 *   maxConnections: 3,
 *   connectionTimeout: 30000,
 *   retryAttempts: 3,
 *   retryDelay: 1000
 * };
 * ```
 *
 * @category Connection
 * @since 0.1.0
 * @see Connection management handled by higher-level libraries
 */
export interface ConnectionManagerConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Union type of all discovery protocol messages.
 *
 * Represents all possible message types that can be sent or received
 * in the discovery protocol. Useful for type guards and message routing.
 *
 * @example Type guard usage
 * ```typescript
 * function handleMessage(message: DiscoveryMessage) {
 *   switch (message.type) {
 *     case 'discovery:wallet:request':
 *       handleDiscoveryRequest(message);
 *       break;
 *     case 'discovery:wallet:response':
 *       handleDiscoveryResponse(message);
 *       break;
 *     case 'discovery:wallet:complete':
 *       handleDiscoveryComplete(message);
 *       break;
 *     case 'discovery:wallet:error':
 *       handleDiscoveryError(message);
 *       break;
 *   }
 * }
 * ```
 *
 * @example Message validation
 * ```typescript
 * function isDiscoveryMessage(data: unknown): data is DiscoveryMessage {
 *   if (typeof data !== 'object' || data === null) return false;
 *
 *   // Type-safe property access
 *   const msg = data as Record<string, unknown>;
 *
 *   return (
 *     msg.type === 'discovery:wallet:request' ||
 *     msg.type === 'discovery:wallet:response' ||
 *     msg.type === 'discovery:wallet:complete' ||
 *     msg.type === 'discovery:wallet:error'
 *   );
 * }
 * ```
 *
 * @category Protocol
 * @since 0.1.0
 */
export type DiscoveryMessage =
  | DiscoveryRequestEvent
  | DiscoveryResponseEvent
  | DiscoveryCompleteEvent
  | DiscoveryErrorEvent;

/**
 * Event handler function types for discovery protocol events.
 *
 * Type-safe event handlers for processing discovery protocol messages
 * with proper event payload typing.
 *
 * @example
 * ```typescript
 * const requestHandler: CapabilityRequestHandler = (event) => {
 *   const request = event.detail;
 *   console.log('Received request from:', request.origin);
 * };
 *
 * const responseHandler: CapabilityResponseHandler = (event) => {
 *   const response = event.detail;
 *   console.log('Responder responded:', response.name);
 * };
 * ```
 *
 * @category Events
 * @since 0.1.0
 * @see {@link DiscoveryInitiator} for response handling
 * @see {@link DiscoveryResponder} for request handling
 */
export type DiscoveryRequestEventHandler = (event: CustomEvent<DiscoveryRequestEvent>) => void;
export type DiscoveryResponseEventHandler = (event: CustomEvent<DiscoveryResponseEvent>) => void;

/**
 * Details about a duplicate response for error reporting.
 *
 * Contains information about duplicate responses detected during discovery,
 * used for security analysis and troubleshooting.
 *
 * @example
 * ```typescript
 * const duplicateDetails: DuplicateResponseDetails = {
 *   rdns: 'com.example.wallet',
 *   originalResponderId: 'original-uuid-123',
 *   duplicateResponderId: 'duplicate-uuid-456',
 *   responseCount: 2,
 *   sessionId: 'session-abc',
 *   detectedAt: Date.now(),
 *   originalName: 'Example Wallet',
 *   duplicateName: 'Example Wallet'  // Often the same, but may differ in attacks
 * };
 * ```
 *
 * @category Security
 * @since 0.4.0
 * @see {@link DuplicateResponseError} for error handling
 * @see {@link DiscoveryInitiator} for duplicate detection implementation
 * @see {@link ProtocolStateMachine} for ERROR state transitions
 */
export interface DuplicateResponseDetails {
  /** Original responder RDNS identifier */
  rdns: string;

  /** Original responder ID from first response */
  originalResponderId: string;

  /** Duplicate responder ID from subsequent response */
  duplicateResponderId: string;

  /** Total response count for this RDNS */
  responseCount: number;

  /** Session ID where duplicate was detected */
  sessionId: string;

  /** Timestamp when duplicate was detected */
  detectedAt: number;

  /** Original responder name */
  originalName: string;

  /** Duplicate responder name (may differ) */
  duplicateName: string;
}

/**
 * Error thrown when duplicate responses are detected during discovery.
 *
 * This error indicates a potential security violation where multiple responses
 * were received from the same wallet RDNS identifier, which violates the
 * "first response wins" security model.
 *
 * @example
 * ```typescript
 * try {
 *   const responders = await listener.startDiscovery();
 * } catch (error) {
 *   if (error instanceof DuplicateResponseError) {
 *     console.error('Duplicate response detected:', error.duplicateDetails);
 *     console.error('Investigation needed for:', error.duplicateDetails.rdns);
 *   }
 * }
 * ```
 *
 * @category Security
 * @since 0.4.0
 */
export class DuplicateResponseError extends Error {
  /** Error code for duplicate response detection */
  public readonly code = 2004;

  /** Error category */
  public readonly category: ErrorCategory = 'security';

  /** Detailed information about the duplicate response */
  public readonly duplicateDetails: DuplicateResponseDetails;

  /** Whether this error is retryable (false for security violations) */
  public readonly retryable = false;

  constructor(duplicateDetails: DuplicateResponseDetails) {
    const message = `Duplicate response detected from responder '${duplicateDetails.rdns}'. Received ${duplicateDetails.responseCount} responses in session ${duplicateDetails.sessionId}. This violates the "first response wins" security model and may indicate malicious activity. Discovery session has been invalidated for security.`;

    super(message);
    this.name = 'DuplicateResponseError';
    this.duplicateDetails = duplicateDetails;

    // Maintain proper prototype chain
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateResponseError);
    }
  }

  /**
   * Convert to protocol error format for consistent error handling.
   */
  toProtocolError(): ProtocolError {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      retryable: this.retryable,
      silent: false,
    };
  }

  /**
   * Get user-friendly error summary for UI display.
   */
  getUserFriendlyMessage(): string {
    return `Discovery failed due to suspicious wallet behavior. Multiple responses detected from '${this.duplicateDetails.rdns}'. Please try again or contact support if this persists.`;
  }

  /**
   * Get detailed information for debugging and investigation.
   */
  getInvestigationDetails(): Record<string, unknown> {
    return {
      errorType: 'DuplicateResponse',
      rdns: this.duplicateDetails.rdns,
      sessionId: this.duplicateDetails.sessionId,
      responseCount: this.duplicateDetails.responseCount,
      originalResponderId: this.duplicateDetails.originalResponderId,
      duplicateResponderId: this.duplicateDetails.duplicateResponderId,
      detectedAt: new Date(this.duplicateDetails.detectedAt).toISOString(),
      securityImplication: 'Potential wallet spoofing or malicious behavior',
      recommendedAction: 'Investigation required - check wallet implementation',
    };
  }
}

/**
 * Event emitted when a discovery session completes successfully.
 *
 * This event is broadcast when a discovery session transitions to the COMPLETED state,
 * indicating that the discovery process has finished and responders have been collected.
 * The event provides basic session information without exposing sensitive details.
 *
 * @example
 * ```typescript
 * // Listen for completion events
 * eventTarget.addEventListener(DISCOVERY_EVENTS.COMPLETE, (event) => {
 *   const completionEvent = event as CustomEvent<DiscoveryCompleteEvent>;
 *   console.log(`Discovery session ${completionEvent.detail.sessionId} completed`);
 *   console.log(`Found ${completionEvent.detail.respondersFound} responders`);
 * });
 * ```
 *
 * @category Events
 * @since 0.5.0
 */
export interface DiscoveryCompleteEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:complete';

  /** Reason for completion */
  reason: 'timeout' | 'manual-stop' | 'max-responders';

  /** Number of qualified responders found */
  respondersFound: number;
}

/**
 * Event emitted when a discovery session encounters an error.
 *
 * This event is broadcast when a discovery session transitions to the ERROR state,
 * indicating that the discovery process has failed due to a security violation
 * or other error condition. The event provides error context for debugging.
 *
 * @example
 * ```typescript
 * // Listen for error events
 * eventTarget.addEventListener(DISCOVERY_EVENTS.ERROR, (event) => {
 *   const errorEvent = event as CustomEvent<DiscoveryErrorEvent>;
 *   console.error(`Discovery session ${errorEvent.detail.sessionId} failed`);
 *   console.error(`Error: ${errorEvent.detail.errorMessage}`);
 * });
 * ```
 *
 * @category Events
 * @since 0.5.0
 */
export interface DiscoveryErrorEvent extends BaseDiscoveryMessage {
  type: 'discovery:wallet:error';

  /** Error code for categorization */
  errorCode: number;

  /** Human-readable error message */
  errorMessage: string;

  /** Error category for handling */
  errorCategory: ErrorCategory;
}
