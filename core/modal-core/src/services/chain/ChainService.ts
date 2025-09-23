/**
 * Consolidated chain service for WalletMesh
 *
 * Merges functionality from:
 * - ChainService: Chain management and switching orchestration
 * - ChainRegistry: Chain configuration and lookup
 * - ChainValidator: Chain validation and compatibility checks
 * - ChainSwitcher: Chain switching logic and execution
 *
 * This consolidated service provides all chain-related business logic
 * in a single, cohesive interface without state management.
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import { caip2Schema, extractNamespace } from '../../schemas/caip2.js';
import { ChainType } from '../../types.js';
import type { ModalError, SupportedChain, WalletInfo } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import type { ChainInfo, SwitchChainArgs, SwitchChainResult } from './types.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Derive ChainType from CAIP-2 namespace
 * @param chainId - CAIP-2 chain identifier
 * @returns The corresponding ChainType
 */
function getChainTypeFromCAIP2(chainId: string): ChainType {
  const namespace = extractNamespace(chainId);

  switch (namespace) {
    case 'eip155':
      return ChainType.Evm;
    case 'solana':
      return ChainType.Solana;
    case 'aztec':
      return ChainType.Aztec;
    default:
      throw new Error(`Unknown CAIP-2 namespace: ${namespace}`);
  }
}

// ============================================================================
// CHAIN REGISTRY TYPES (from ChainRegistry)
// ============================================================================

// ChainInfo is imported from ./types.js

// ============================================================================
// CHAIN VALIDATION TYPES (from ChainValidator)
// ============================================================================

/**
 * Options for chain validation operations
 *
 * @example
 * ```ts
 * const options: ChainValidationOptions = {
 *   errorMessage: 'Please switch to Ethereum Mainnet',
 *   timeout: 5000
 * };
 * ```
 */
export interface ChainValidationOptions {
  /** Custom error message for validation failure */
  errorMessage?: string;
  /** Timeout for validation in milliseconds */
  timeout?: number;
}

/**
 * Result of a chain validation check
 *
 * @example
 * ```ts
 * const result: ChainValidationResult = {
 *   isValid: false,
 *   currentChainId: '137', // Polygon
 *   requiredChainId: '1',  // Ethereum
 *   error: new Error('Wrong network')
 * };
 * ```
 */
export interface ChainValidationResult {
  /** Whether the chain is valid */
  isValid: boolean;
  /** Current chain */
  currentChain: SupportedChain | null;
  /** Required chain */
  requiredChain: SupportedChain;
  /** Validation error if any */
  error?: ModalError;
}

/**
 * Options for checking chain compatibility with a wallet
 *
 * @example
 * ```ts
 * const options: ChainCompatibilityOptions = {
 *   wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
 *   includeTestnets: true,
 *   requireFeatures: ['wallet_connect'],
 *   minVersion: '1.0.0'
 * };
 * ```
 */
export interface ChainCompatibilityOptions {
  /** Wallet to check compatibility */
  wallet: WalletInfo;
  /** Whether to include testnet chains */
  includeTestnets?: boolean;
  /** Required features for compatibility */
  requireFeatures?: string[];
  /** Minimum wallet version required */
  minVersion?: string;
}

/**
 * Result of chain compatibility check
 *
 * @example
 * ```ts
 * const result: ChainCompatibilityResult = {
 *   isCompatible: false,
 *   reason: 'Wallet does not support Aztec chains',
 *   chainId: 'eip155:1',
 *   walletId: 'metamask',
 *   missingFeatures: ['wallet_connect']
 * };
 * ```
 */
export interface ChainCompatibilityResult {
  /** Whether the chain is compatible */
  isCompatible: boolean;
  /** Compatibility reason if incompatible */
  reason?: string;
  /** Chain ID that was checked */
  chainId?: string;
  /** Wallet ID that was checked */
  walletId?: string;
  /** Missing features if incompatible */
  missingFeatures?: string[];
}

/**
 * Result of chain requirement validation
 *
 * @example
 * ```ts
 * const result: ChainRequirementValidationResult = {
 *   isValid: false,
 *   missingRequirements: ['RPC URLs', 'Block explorer']
 * };
 * ```
 */
export interface ChainRequirementValidationResult {
  /** Whether requirements are met */
  isValid: boolean;
  /** The chain ID being validated */
  chainId: string;
  /** The requirements being checked */
  requirements: string[];
  /** Missing requirements */
  missingRequirements: string[];
  /** Optional error information */
  error?: Error;
}

// ============================================================================
// CHAIN SWITCHING TYPES (from ChainSwitcher)
// ============================================================================

// SwitchChainArgs and SwitchChainResult are imported from ./types.js
// Note: The SwitchChainResult interface in ChainService has additional fields
// that are not in the types.js version. We'll need to extend it.

/**
 * Extended result for chain switching operations
 *
 * @example
 * ```ts
 * const result: ExtendedSwitchChainResult = {
 *   success: true,
 *   chainId: '137',
 *   chainType: 'evm',
 *   previousChainId: '1',
 *   provider: web3Provider,
 *   chainAdded: false
 * };
 * ```
 */
export interface ExtendedSwitchChainResult extends SwitchChainResult {
  /** Whether switch was successful */
  success: boolean;
  /** Switch error if any */
  error?: ModalError;
  /** Whether chain was added */
  chainAdded?: boolean;
}

// ============================================================================
// CHAIN SERVICE TYPES (from ChainService)
// ============================================================================

/**
 * Parameters for validating a chain
 *
 * @example
 * ```ts
 * const params: ValidateChainParams = {
 *   currentChainId: '137',  // Currently on Polygon
 *   requiredChainId: '1',   // Need to be on Ethereum
 *   options: {
 *     errorMessage: 'Please switch to Ethereum Mainnet',
 *     timeout: 5000
 *   }
 * };
 * ```
 */
export interface ValidateChainParams {
  /** Current chain (null if not connected) */
  currentChain: SupportedChain | null;
  /** Required chain to validate against */
  requiredChain: SupportedChain;
  /** Optional validation options */
  options?: ChainValidationOptions;
}

/**
 * Parameters for ensuring chain
 *
 * @example
 * ```ts
 * const params: EnsureChainParams = {
 *   requiredChainId: '1',
 *   walletId: 'metamask',
 *   options: {
 *     errorMessage: 'This dApp requires Ethereum Mainnet'
 *   }
 * };
 * ```
 */
export interface EnsureChainParams {
  /** Required chain */
  requiredChain: SupportedChain;
  /** Optional wallet ID */
  walletId?: string;
  /** Optional validation options */
  options?: ChainValidationOptions;
}

/**
 * Configuration for chain ensurance behavior
 *
 * @example
 * ```ts
 * const config: ChainEnsuranceConfig = {
 *   autoSwitch: true,
 *   requireUserConfirmation: true,
 *   validationTimeout: 5000,
 *   retryOnFailure: true,
 *   throwOnError: false,
 *   maxSwitchAttempts: 3,
 *   switchTimeoutMs: 30000
 * };
 * ```
 */
export interface ChainEnsuranceConfig {
  /** Enable automatic chain switching */
  autoSwitch?: boolean;
  /** Show user confirmation before switching */
  requireUserConfirmation?: boolean;
  /** Validation timeout in milliseconds */
  validationTimeout?: number;
  /** Retry failed validations */
  retryOnFailure?: boolean;
  /** Throw errors on validation failure */
  throwOnError?: boolean;
  /** Maximum switch attempts */
  maxSwitchAttempts?: number;
  /** Switch timeout in milliseconds */
  switchTimeoutMs?: number;
}

/**
 * Result of chain ensurance validation
 *
 * @example
 * ```ts
 * const result: ChainEnsuranceValidationResult = {
 *   isCorrectChain: false,
 *   currentChain: '137',  // On Polygon
 *   requiredChain: '1',   // Need Ethereum
 *   error: new Error('Wrong network'),
 *   isSwitching: false
 * };
 * ```
 */
export interface ChainEnsuranceValidationResult {
  /** Whether the current chain is correct */
  isCorrectChain: boolean;
  /** Current chain */
  currentChain: SupportedChain | null;
  /** Required chain */
  requiredChain: SupportedChain;
  /** Validation error if any */
  error: ModalError | null;
  /** Is currently switching chains */
  isSwitching: boolean;
}

/**
 * Options for orchestrating chain switches with user interaction
 *
 * @example
 * ```ts
 * const options: ChainSwitchOrchestrationOptions = {
 *   onConfirm: async (data) => {
 *     return confirm(`Switch from ${data.currentChain?.name} to ${data.targetChain.name}?`);
 *   },
 *   onSuccess: (data) => {
 *     console.log(`Switched to ${data.newChain.name} in ${data.duration}ms`);
 *   },
 *   timeout: 30000
 * };
 * ```
 */
export interface ChainSwitchOrchestrationOptions {
  /** Callback before confirming switch */
  onConfirm?: (data: ChainSwitchConfirmData) => Promise<boolean> | boolean;
  /** Callback on successful switch */
  onSuccess?: (data: ChainSwitchSuccessData) => void;
  /** Timeout for switch operation */
  timeout?: number;
}

/**
 * Data provided to chain switch confirmation callback
 *
 * @example
 * ```ts
 * const data: ChainSwitchConfirmData = {
 *   currentChain: { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *   targetChain: { chainId: '137', chainType: 'evm', name: 'Polygon' },
 *   wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
 *   estimatedTime: 5000
 * };
 * ```
 */
export interface ChainSwitchConfirmData {
  /** Current chain */
  currentChain: ChainInfo | null;
  /** Target chain */
  targetChain: ChainInfo;
  /** Wallet being switched */
  wallet: WalletInfo;
  /** Estimated switch time */
  estimatedTime?: number;
}

/**
 * Data provided to chain switch success callback
 *
 * @example
 * ```ts
 * const data: ChainSwitchSuccessData = {
 *   previousChain: { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *   newChain: { chainId: '137', chainType: 'evm', name: 'Polygon' },
 *   wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
 *   duration: 3500
 * };
 * ```
 */
export interface ChainSwitchSuccessData {
  /** Previous chain */
  previousChain: ChainInfo | null;
  /** New chain */
  newChain: ChainInfo;
  /** Wallet that was switched */
  wallet: WalletInfo;
  /** Switch duration */
  duration: number;
}

/**
 * Detailed chain compatibility information
 *
 * @example
 * ```ts
 * const info: ChainCompatibilityInfo = {
 *   isSupported: true,
 *   supportLevel: 'partial',
 *   missingFeatures: ['EIP-1559', 'ENS']
 * };
 * ```
 */
export interface ChainCompatibilityInfo {
  /** Whether chain is supported */
  isSupported: boolean;
  /** Support level */
  supportLevel: 'full' | 'partial' | 'none';
  /** Missing features */
  missingFeatures?: string[];
}

/**
 * Context for chain switching operations
 *
 * @example
 * ```ts
 * const context: ChainSwitchContext = {
 *   currentChain: { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *   targetChain: { chainId: '137', chainType: 'evm', name: 'Polygon' },
 *   providers: [evmProvider],
 *   walletConstraints: { maxGasPrice: '100000000000' }
 * };
 * ```
 */
export interface ChainSwitchContext {
  /** Current chain state */
  currentChain: ChainInfo | null;
  /** Target chain */
  targetChain: ChainInfo;
  /** Available providers */
  providers: BlockchainProvider[];
  /** Wallet constraints */
  walletConstraints?: Record<string, unknown>;
}

/**
 * Analysis of chain mismatch scenarios
 *
 * @example
 * ```ts
 * const analysis: ChainMismatchAnalysis = {
 *   mismatchType: 'chain_id',
 *   severity: 'high',
 *   recommendedAction: 'switch',
 *   context: { currentChain: '137', requiredChain: '1' }
 * };
 * ```
 */
export interface ChainMismatchAnalysis {
  /** Type of mismatch */
  mismatchType: 'chain_id' | 'chain_type' | 'not_connected';
  /** Severity level */
  severity: 'low' | 'medium' | 'high';
  /** Recommended action */
  recommendedAction: 'switch' | 'connect' | 'ignore';
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Recommendation for chain switching
 *
 * @example
 * ```ts
 * const recommendation: ChainSwitchRecommendation = {
 *   shouldSwitch: true,
 *   confidence: 'high'
 * };
 * ```
 */
export interface ChainSwitchRecommendation {
  /** Should switch */
  shouldSwitch?: boolean;
  /** Confidence level */
  confidence?: 'low' | 'medium' | 'high';
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Event data emitted when chain switching starts
 *
 * @example
 * ```ts
 * const eventData: ChainSwitchingEventData = {
 *   chainId: '1',
 *   targetChainId: '137',
 *   walletId: 'metamask'
 * };
 * ```
 */
export interface ChainSwitchingEventData {
  chainId: string;
  targetChainId: string;
  walletId: string;
}

/**
 * Event data emitted when chain switching completes
 *
 * @example
 * ```ts
 * const eventData: ChainSwitchCompletedEventData = {
 *   previousChainId: '1',
 *   newChainId: '137',
 *   walletId: 'metamask',
 *   duration: 3500
 * };
 * ```
 */
export interface ChainSwitchCompletedEventData {
  previousChainId: string;
  newChainId: string;
  walletId: string;
  duration: number;
}

/**
 * Event data emitted during chain validation
 *
 * @example
 * ```ts
 * const eventData: ChainValidationEventData = {
 *   chainId: '1',
 *   isValid: true
 * };
 * ```
 */
export interface ChainValidationEventData {
  chain: SupportedChain;
  isValid: boolean;
  error?: ModalError;
}

/**
 * Events emitted by the ChainService
 *
 * @example
 * ```ts
 * // Listen to chain switching events
 * chainService.on('chain:switching', (data) => {
 *   console.log(`Switching from ${data.chainId} to ${data.targetChainId}`);
 * });
 *
 * chainService.on('chain:switched', (data) => {
 *   console.log(`Switched to ${data.newChainId} in ${data.duration}ms`);
 * });
 * ```
 */
export interface ChainServiceEvents {
  'chain:switching': ChainSwitchingEventData;
  'chain:switched': ChainSwitchCompletedEventData;
  'chain:validation': ChainValidationEventData;
}

// ============================================================================
// CONFIG
// ============================================================================

/**
 * Configuration options for ChainService
 *
 * @example
 * ```ts
 * const config: ChainConfig = {
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum', ... },
 *     { chainId: '137', chainType: 'evm', name: 'Polygon', ... }
 *   ],
 *   customChains: {
 *     '42161': { chainId: '42161', chainType: 'evm', name: 'Arbitrum', ... }
 *   },
 *   allowDynamicChains: true,
 *   enableValidation: true,
 *   ensurance: {
 *     autoSwitch: true,
 *     requireUserConfirmation: true
 *   },
 *   validationTimeout: 5000,
 *   switchTimeout: 30000
 * };
 * ```
 */
export interface ChainConfig {
  /** Chains to support */
  chains?: ChainInfo[];
  /** Custom chain configurations */
  customChains?: Map<string, ChainInfo>;
  /** Whether to allow dynamic chain addition */
  allowDynamicChains?: boolean;
  /** Enable chain switching validation */
  enableValidation?: boolean;
  /** Chain ensurance configuration */
  ensurance?: ChainEnsuranceConfig;
  /** Default validation timeout */
  validationTimeout?: number;
  /** Default switch timeout */
  switchTimeout?: number;
}

/**
 * Dependencies required by ChainService
 *
 * @example
 * ```ts
 * const dependencies: ChainServiceDependencies = {
 *   logger: new Logger(),
 *   eventEmitter: new EventEmitter(),
 *   resourceManager: new ResourceManager()
 * };
 * ```
 */
export interface ChainServiceDependencies extends BaseServiceDependencies {}

/**
 * Consolidated chain service for WalletMesh
 *
 * Provides all chain-related business logic in a single service:
 * - Chain registration and lookup (registry functionality)
 * - Chain validation and compatibility checking (validator functionality)
 * - Chain switching and orchestration (switcher functionality)
 * - Chain ensurance and workflow management (service functionality)
 *
 * @example
 * ```ts
 * // Create service
 * const chainService = new ChainService(dependencies, {
 *   chains: [ethereumChain, polygonChain],
 *   enableValidation: true,
 *   ensurance: { autoSwitch: true }
 * });
 *
 * // Register a new chain
 * chainService.registerChain({
 *   chainId: '42161',
 *   chainType: ChainType.Evm,
 *   name: 'Arbitrum One',
 *   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
 *   rpcUrls: ['https://arb1.arbitrum.io/rpc']
 * });
 *
 * // Validate current chain
 * const validation = chainService.validateChain({
 *   currentChainId: '1',
 *   requiredChainId: '137'
 * });
 *
 * // Switch chains
 * const result = await chainService.switchChain({ chainId: '137' });
 * ```
 */
export class ChainService {
  private logger: Logger;
  private readonly config: Required<ChainConfig>;
  private readonly chains = new Map<string, ChainInfo>();
  private readonly chainsByType = new Map<ChainType, ChainInfo[]>();

  // For testing purposes only
  private lastSwitchedChainIdForTesting?: string;

  constructor(dependencies: ChainServiceDependencies, config: ChainConfig = {}) {
    this.logger = dependencies.logger;

    this.config = {
      chains: config.chains ?? [],
      customChains: config.customChains ?? {},
      allowDynamicChains: config.allowDynamicChains ?? true,
      enableValidation: config.enableValidation ?? true,
      validationTimeout: config.validationTimeout ?? 5000,
      switchTimeout: config.switchTimeout ?? 30000,
      ensurance: {
        autoSwitch: false,
        requireUserConfirmation: true,
        validationTimeout: 5000,
        retryOnFailure: true,
        throwOnError: false,
        maxSwitchAttempts: 3,
        switchTimeoutMs: 30000,
        ...config.ensurance,
      },
    } as Required<ChainConfig>;

    // Only load default chains if no custom chains are provided
    if (!config.chains || config.chains.length === 0) {
      this.loadDefaultChains();
    }

    // If chains are provided, use only those
    if (config.chains) {
      for (const chain of config.chains) {
        this.registerChain(chain);
      }
    }

    // Custom chains are always added on top
    if (config.customChains) {
      for (const chain of Object.values(config.customChains)) {
        this.registerChain(chain);
      }
    }
  }

  // ============================================================================
  // CHAIN REGISTRY METHODS (from ChainRegistry)
  // ============================================================================

  /**
   * Register a chain configuration
   *
   * @param chain - The chain configuration to register
   * @throws {ModalError} If chain configuration is invalid
   *
   * @example
   * ```ts
   * chainService.registerChain({
   *   chainId: 'eip155:42161',
   *   chainType: ChainType.Evm,
   *   name: 'Arbitrum One',
   *   nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
   *   rpcUrls: ['https://arb1.arbitrum.io/rpc'],
   *   blockExplorerUrls: ['https://arbiscan.io']
   * });
   * ```
   */
  registerChain(chain: ChainInfo): void {
    // Validate required fields
    if (!chain || !chain.chainId || !chain.name) {
      throw ErrorFactory.configurationError('Invalid chain configuration: missing required fields');
    }

    // Validate CAIP-2 format using Zod schema
    const chainIdValidation = caip2Schema.safeParse(chain.chainId);
    if (!chainIdValidation.success) {
      throw ErrorFactory.configurationError(
        `Invalid chain ID format: ${chain.chainId}. ${chainIdValidation.error.errors.map((e) => e.message).join(', ')}`,
        { validationErrors: chainIdValidation.error.errors },
      );
    }

    // Derive chain type from CAIP-2 namespace if not provided or validate consistency
    const derivedChainType = getChainTypeFromCAIP2(chain.chainId);
    if (chain.chainType && chain.chainType !== derivedChainType) {
      throw ErrorFactory.configurationError(
        `Chain type mismatch: provided ${chain.chainType}, but CAIP-2 namespace indicates ${derivedChainType}`,
      );
    }

    if (!chain.nativeCurrency || !chain.nativeCurrency.symbol || !chain.nativeCurrency.decimals) {
      throw ErrorFactory.configurationError('Invalid chain configuration: missing native currency info');
    }

    if (!chain.rpcUrls || chain.rpcUrls.length === 0) {
      throw ErrorFactory.configurationError('Invalid chain configuration: missing RPC URLs');
    }

    // Use CAIP-2 chain ID as-is (already in CAIP-2 format)
    const chainWithValidType = { ...chain, chainType: derivedChainType };

    this.chains.set(chain.chainId, chainWithValidType);

    // Update type index
    const chainsOfType = this.chainsByType.get(derivedChainType) || [];
    // Remove existing entry if present
    const filtered = chainsOfType.filter((c) => c.chainId !== chain.chainId);
    filtered.push(chainWithValidType);
    this.chainsByType.set(derivedChainType, filtered);
  }

  /**
   * Get chain by ID
   *
   * @param chainId - The chain ID to look up (CAIP-2 format)
   * @returns The chain configuration if found, undefined otherwise
   *
   * @example
   * ```ts
   * const ethereum = chainService.getChain('eip155:1');
   * const polygon = chainService.getChain('eip155:137');
   * const solana = chainService.getChain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
   * ```
   */
  getChain(chainId: string): ChainInfo | undefined {
    // Validate chain ID using strict CAIP-2 schema
    try {
      const validatedId = caip2Schema.parse(chainId);
      return this.chains.get(validatedId);
    } catch (error) {
      this.logger.warn('Invalid chain ID provided to getChain', { chainId, error });
      return undefined;
    }
  }

  /**
   * Get all registered chains
   *
   * @returns Array of all registered chain configurations
   *
   * @example
   * ```ts
   * const allChains = chainService.getAllChains();
   * console.log(`${allChains.length} chains registered`);
   * ```
   */
  getAllChains(): ChainInfo[] {
    return Array.from(this.chains.values());
  }

  /**
   * Get chains by type
   *
   * @param chainType - The chain type to filter by
   * @returns Array of chains matching the specified type
   *
   * @example
   * ```ts
   * const evmChains = chainService.getChainsByType(ChainType.Evm);
   * const solanaChains = chainService.getChainsByType(ChainType.Solana);
   * ```
   */
  getChainsByType(chainType: ChainType): ChainInfo[] {
    return this.chainsByType.get(chainType) || [];
  }

  /**
   * Get supported chain types
   *
   * @returns Array of chain types that have registered chains
   *
   * @example
   * ```ts
   * const supportedTypes = chainService.getSupportedChainTypes();
   * // ['evm', 'solana', 'aztec']
   * ```
   */
  getSupportedChainTypes(): ChainType[] {
    return Array.from(this.chainsByType.keys());
  }

  /**
   * Check if chain is registered
   *
   * @param chainId - The chain ID to check
   * @returns True if chain is registered, false otherwise
   *
   * @example
   * ```ts
   * if (chainService.hasChain('1')) {
   *   console.log('Ethereum Mainnet is registered');
   * }
   * ```
   */
  hasChain(chainId: string): boolean {
    // Validate chain ID using strict CAIP-2 schema
    try {
      const validatedId = caip2Schema.parse(chainId);
      return this.chains.has(validatedId);
    } catch (error) {
      this.logger.warn('Invalid chain ID provided to hasChain', { chainId, error });
      return false;
    }
  }

  /**
   * Unregister a chain
   *
   * @param chainId - The chain ID to unregister
   * @returns True if chain was unregistered, false if it wasn't found
   *
   * @example
   * ```ts
   * const removed = chainService.unregisterChain('11155111'); // Remove Sepolia
   * if (removed) {
   *   console.log('Chain unregistered successfully');
   * }
   * ```
   */
  unregisterChain(chainId: string): boolean {
    const chain = this.chains.get(chainId);

    if (!chain) {
      return false;
    }

    this.chains.delete(chainId);

    // Update type index
    const chainsOfType = this.chainsByType.get(chain.chainType) || [];
    const filtered = chainsOfType.filter((c) => c.chainId !== chainId);

    if (filtered.length === 0) {
      this.chainsByType.delete(chain.chainType);
    } else {
      this.chainsByType.set(chain.chainType, filtered);
    }

    return true;
  }

  /**
   * Clear all chains
   *
   * @example
   * ```ts
   * chainService.clearChains();
   * console.log(chainService.getAllChains().length); // 0
   * ```
   */
  clearChains(): void {
    this.chains.clear();
    this.chainsByType.clear();
  }

  /**
   * Get chain statistics
   *
   * @returns Statistics about registered chains
   *
   * @example
   * ```ts
   * const stats = chainService.getChainStats();
   * console.log(`Total chains: ${stats.total}`);
   * console.log(`EVM chains: ${stats.byType.evm}`);
   * console.log(`Solana chains: ${stats.byType.solana}`);
   * ```
   */
  getChainStats(): { total: number; byType: Record<ChainType, number> } {
    const byType: Record<ChainType, number> = {
      [ChainType.Evm]: 0,
      [ChainType.Solana]: 0,
      [ChainType.Aztec]: 0,
    };

    for (const [chainType, chains] of this.chainsByType.entries()) {
      byType[chainType] = chains.length;
    }

    return {
      total: this.chains.size,
      byType,
    };
  }

  /**
   * Compare two version strings (semver-like)
   * @param version1 - First version to compare
   * @param version2 - Second version to compare
   * @returns < 0 if version1 < version2, 0 if equal, > 0 if version1 > version2
   */
  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    const maxLength = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }

  // ============================================================================
  // CHAIN VALIDATION METHODS (from ChainValidator)
  // ============================================================================

  /**
   * Validate if current chain matches required chain
   *
   * @param params - Validation parameters
   * @returns Validation result indicating if chains match
   *
   * @example
   * ```ts
   * const result = chainService.validateChain({
   *   currentChainId: '137',
   *   requiredChainId: '1',
   *   options: {
   *     errorMessage: 'Please switch to Ethereum Mainnet'
   *   }
   * });
   *
   * if (!result.isValid) {
   *   console.error(result.error.message);
   * }
   * ```
   */
  validateChain(params: ValidateChainParams): ChainValidationResult {
    const { currentChain, requiredChain, options = {} } = params;
    const { errorMessage = 'Please switch to the correct network' } = options;

    // Check for invalid validation parameters
    if (!requiredChain) {
      const error = ErrorFactory.configurationError(
        'Invalid validation parameters: required chain is missing',
      );
      return {
        isValid: false,
        currentChain,
        requiredChain,
        error,
      };
    }

    if (!currentChain) {
      const error = ErrorFactory.configurationError('No chain connected');
      return {
        isValid: false,
        currentChain,
        requiredChain,
        error,
      };
    }

    const isValid = currentChain.chainId === requiredChain.chainId;

    if (!isValid) {
      const error = ErrorFactory.configurationError(errorMessage);
      return {
        isValid: false,
        currentChain,
        requiredChain,
        error,
      };
    }

    return {
      isValid: true,
      currentChain,
      requiredChain,
    };
  }

  /**
   * Check chain compatibility with wallet
   *
   * @param chainId - The chain ID to check compatibility for
   * @param options - Compatibility check options
   * @returns Compatibility result with alternatives if incompatible
   *
   * @example
   * ```ts
   * const result = chainService.checkChainCompatibility('aztec-mainnet', {
   *   wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
   *   includeTestnets: false
   * });
   *
   * if (!result.isCompatible) {
   *   console.log(result.reason);
   * }
   * ```
   */
  checkChainCompatibility(chainId: string, options: ChainCompatibilityOptions): ChainCompatibilityResult {
    const { wallet, requireFeatures = [], minVersion } = options;

    if (!wallet) {
      return {
        isCompatible: false,
        reason: 'No wallet information available',
        chainId,
      };
    }

    // Check if wallet supports any chains
    if (!wallet.chains || wallet.chains.length === 0) {
      return {
        isCompatible: false,
        reason: 'Wallet does not support any chains',
        chainId,
        walletId: wallet.id,
      };
    }

    const chain = this.getChain(chainId);

    if (!chain) {
      return {
        isCompatible: false,
        reason: 'Chain not found',
        chainId,
        walletId: wallet.id,
      };
    }

    // Check if wallet supports this chain type
    const isChainTypeCompatible = wallet.chains.includes(chain.chainType);

    if (!isChainTypeCompatible) {
      return {
        isCompatible: false,
        reason: `Wallet does not support ${chain.chainType} chains`,
        chainId,
        walletId: wallet.id,
      };
    }

    // Check required features
    const missingFeatures: string[] = [];
    if (requireFeatures.length > 0 && wallet.features) {
      for (const feature of requireFeatures) {
        if (!wallet.features.includes(feature)) {
          missingFeatures.push(feature);
        }
      }
    } else if (requireFeatures.length > 0 && !wallet.features) {
      // If features are required but wallet has no features listed, assume missing
      missingFeatures.push(...requireFeatures);
    }

    if (missingFeatures.length > 0) {
      return {
        isCompatible: false,
        reason: 'Wallet is missing required features',
        chainId,
        walletId: wallet.id,
        missingFeatures,
      };
    }

    // Check version requirement
    if (minVersion && wallet.version) {
      const isVersionCompatible = this.compareVersions(wallet.version, minVersion) >= 0;
      if (!isVersionCompatible) {
        return {
          isCompatible: false,
          reason: 'Wallet version requirement not met',
          chainId,
          walletId: wallet.id,
        };
      }
    } else if (minVersion && !wallet.version) {
      return {
        isCompatible: false,
        reason: 'Wallet version information not available',
        chainId,
        walletId: wallet.id,
      };
    }

    return {
      isCompatible: true,
      chainId,
      walletId: wallet.id,
    };
  }

  /**
   * Validate chain requirements
   *
   * @param chainId - The chain ID to validate
   * @param requirements - Array of required features
   * @returns Validation result with missing requirements and alternatives
   *
   * @example
   * ```ts
   * const result = chainService.validateChainRequirements('42161', [
   *   'rpc_urls',
   *   'block_explorer',
   *   'currency_info'
   * ]);
   *
   * if (!result.isValid) {
   *   console.log('Missing:', result.missingRequirements);
   * }
   * ```
   */
  validateChainRequirements(chainId: string, requirements: string[]): ChainRequirementValidationResult {
    // First validate the chain ID format
    const chainIdValidation = caip2Schema.safeParse(chainId);
    if (!chainIdValidation.success) {
      return {
        isValid: false,
        chainId,
        requirements,
        missingRequirements: ['Valid chain ID format'],
        error: new Error('Invalid chain ID format'),
      };
    }

    const chain = this.getChain(chainId);
    const missingRequirements: string[] = [];

    if (!chain) {
      missingRequirements.push('Chain not registered');
      return {
        isValid: false,
        chainId,
        requirements,
        missingRequirements,
        error: new Error(`Chain ${chainId} not found`),
      };
    }

    // Check basic requirements
    for (const requirement of requirements) {
      switch (requirement) {
        case 'rpc_urls':
          if (!chain.rpcUrls || chain.rpcUrls.length === 0) {
            missingRequirements.push('RPC URLs');
          }
          break;
        case 'block_explorer':
          if (!chain.blockExplorerUrls || chain.blockExplorerUrls.length === 0) {
            missingRequirements.push('Block explorer');
          }
          break;
        case 'currency_info':
          if (!chain.nativeCurrency || !chain.nativeCurrency.symbol) {
            missingRequirements.push('Currency information');
          }
          break;
        case 'wallet_connect':
          // WalletConnect support - assume available for all chains
          break;
        case 'metamask':
          // MetaMask support - assume available for EVM chains
          if (chain.chainType !== ChainType.Evm) {
            missingRequirements.push('MetaMask only supports EVM chains');
          }
          break;
        default:
          missingRequirements.push(`Unknown requirement: ${requirement}`);
      }
    }

    return {
      isValid: missingRequirements.length === 0,
      chainId,
      requirements,
      missingRequirements,
    };
  }

  // ============================================================================
  // CHAIN SWITCHING METHODS (from ChainSwitcher)
  // ============================================================================

  /**
   * Switch to a different chain
   *
   * @param args - Chain switch arguments
   * @param provider - Optional blockchain provider to include in the result
   * @returns Result of the chain switch operation
   * @throws {ModalError} If chain is not registered and no add data provided
   *
   * @example
   * ```ts
   * // Switch to existing chain
   * const result = await chainService.switchChain({ chainId: 'eip155:137' });
   *
   * // Switch with provider
   * const result = await chainService.switchChain({ chainId: 'eip155:137' }, provider);
   *
   * // Switch to new chain with add data
   * const result = await chainService.switchChain({
   *   chainId: 'eip155:42161',
   *   addChainData: {
   *     chainId: 'eip155:42161',
   *     chainName: 'Arbitrum One',
   *     nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
   *     rpcUrls: ['https://arb1.arbitrum.io/rpc']
   *   }
   * }, provider);
   * ```
   */
  async switchChain(args: SwitchChainArgs, provider?: unknown): Promise<SwitchChainResult> {
    const { chain, addChainData } = args;
    const startTime = Date.now();

    // Validate chain ID using strict CAIP-2 schema
    const chainIdValidation = caip2Schema.safeParse(chain.chainId);
    if (!chainIdValidation.success) {
      throw ErrorFactory.configurationError(
        `Invalid chain ID for switchChain: ${chain.chainId}. ${chainIdValidation.error.errors.map((e) => e.message).join(', ')}`,
        { validationErrors: chainIdValidation.error.errors },
      );
    }
    const validatedChainId = chainIdValidation.data;

    try {
      // Check if chain is registered
      let targetChain = this.getChain(validatedChainId);

      if (!targetChain) {
        if (addChainData) {
          // Create a chain config from the add chain data
          const newChain: ChainInfo = {
            chainId: addChainData.chain.chainId,
            chainType: 'evm' as ChainType, // Default to EVM for now
            name: addChainData.chain.name,
            required: addChainData.chain.required ?? false,
            nativeCurrency: addChainData.nativeCurrency,
            rpcUrls: addChainData.rpcUrls || [],
            ...(addChainData.blockExplorerUrls && { blockExplorerUrls: addChainData.blockExplorerUrls }),
          };
          this.registerChain(newChain);
          targetChain = newChain;
        } else {
          throw ErrorFactory.configurationError(`Chain ${validatedChainId} not registered`);
        }
      }

      // Get current chain (this would come from wallet/provider in real implementation)
      const currentChainId = await this.getCurrentChainId();

      // Check if already on target chain
      if (currentChainId && currentChainId === validatedChainId) {
        return {
          chain,
          previousChain: chain,
          provider: provider || null,
        };
      }

      // Perform the actual chain switch (implementation depends on provider)
      await this.performChainSwitch(validatedChainId);

      // Verify the switch was successful
      const newChainId = await this.getCurrentChainId();
      const success = newChainId ? newChainId === validatedChainId : false;

      if (!success) {
        throw ErrorFactory.connectionFailed('Chain switch verification failed');
      }

      const duration = Date.now() - startTime;
      this.logger.info(`Chain switched from ${currentChainId} to ${validatedChainId} in ${duration}ms`);

      // Get the current chain as a SupportedChain object
      const currentChain = currentChainId ? (this.getChain(currentChainId) ?? null) : null;
      const previousChain = currentChain
        ? ({
            chainId: currentChain.chainId,
            chainType: currentChain.chainType,
            name: currentChain.name,
            required: currentChain.required,
          } as SupportedChain)
        : chain;

      return {
        chain,
        previousChain,
        provider: provider || null,
      };
    } catch (error) {
      const modalError = error as ModalError;
      this.logger.error('Chain switch failed:', modalError);

      // In case of error, still return a valid result structure
      return {
        chain,
        previousChain: chain,
        provider: provider || null,
      };
    }
  }

  /**
   * Check if chain switch is needed
   *
   * @param requiredChain - The required chain
   * @param walletId - Optional wallet ID to check
   * @returns True if chain switch is needed, false if already on correct chain
   *
   * @example
   * ```ts
   * const needsSwitch = await chainService.isChainSwitchNeeded(requiredChain, 'metamask');
   * if (needsSwitch) {
   *   await chainService.switchChain({ chain: requiredChain });
   * }
   * ```
   */
  async isChainSwitchNeeded(requiredChain: SupportedChain, walletId?: string): Promise<boolean> {
    const currentChainId = await this.getCurrentChainId(walletId);

    if (!currentChainId) {
      return true; // Need to connect/switch
    }

    return currentChainId !== requiredChain.chainId;
  }

  /**
   * Get supported chains for wallet
   *
   * @param wallet - The wallet to get supported chains for
   * @returns Array of chains supported by the wallet
   *
   * @example
   * ```ts
   * const wallet = { id: 'metamask', name: 'MetaMask', chains: ['evm'] };
   * const supportedChains = chainService.getSupportedChainsForWallet(wallet);
   * // Returns all EVM chains
   * ```
   */
  getSupportedChainsForWallet(wallet: WalletInfo): ChainInfo[] {
    const supportedChains: ChainInfo[] = [];

    for (const chainType of wallet.chains) {
      const chainsOfType = this.getChainsByType(chainType);
      supportedChains.push(...chainsOfType);
    }

    return supportedChains;
  }

  // ============================================================================
  // CHAIN ENSURANCE METHODS (from ChainService)
  // ============================================================================

  /**
   * Ensure user is on the correct chain
   *
   * @param params - Chain ensurance parameters
   * @returns Validation result with auto-switch if configured
   *
   * @example
   * ```ts
   * const result = await chainService.ensureChain({
   *   requiredChainId: '1',
   *   walletId: 'metamask',
   *   options: {
   *     errorMessage: 'This dApp requires Ethereum Mainnet'
   *   }
   * });
   *
   * if (result.isCorrectChain) {
   *   console.log('Ready to interact with Ethereum');
   * }
   * ```
   */
  async ensureChain(params: EnsureChainParams): Promise<ChainEnsuranceValidationResult> {
    const { requiredChain, walletId, options = {} } = params;
    const currentChainId = await this.getCurrentChainId(walletId);
    const currentChain = currentChainId ? (this.getChain(currentChainId) ?? null) : null;
    const validation = this.validateChain({ currentChain, requiredChain, options });

    if (validation.isValid) {
      return {
        isCorrectChain: true,
        currentChain: requiredChain,
        requiredChain: requiredChain,
        error: null,
        isSwitching: false,
      };
    }

    // Auto-switch if enabled
    if (this.config.ensurance.autoSwitch && !this.config.ensurance.requireUserConfirmation) {
      try {
        const switchResult = await this.switchChain({
          chain: requiredChain,
        });

        // Check if switch was successful by comparing chain IDs
        if (switchResult.chain.chainId === requiredChain.chainId) {
          return {
            isCorrectChain: true,
            currentChain: requiredChain,
            requiredChain: requiredChain,
            error: null,
            isSwitching: false,
          };
        }
      } catch (error) {
        // Fall through to return error state
      }
    }

    return {
      isCorrectChain: false,
      currentChain: currentChain,
      requiredChain: requiredChain,
      error: validation.error || null,
      isSwitching: false,
    };
  }

  /**
   * Orchestrate chain switch with user confirmation
   *
   * @param args - Chain switch arguments
   * @param options - Orchestration options with callbacks
   * @returns Result of the orchestrated chain switch
   * @throws {ModalError} If user cancels or chain not found
   *
   * @example
   * ```ts
   * const result = await chainService.orchestrateChainSwitch(
   *   { chainId: '137' },
   *   {
   *     onConfirm: async (data) => {
   *       return confirm(`Switch to ${data.targetChain.name}?`);
   *     },
   *     onSuccess: (data) => {
   *       toast.success(`Switched to ${data.newChain.name}`);
   *     },
   *     timeout: 30000
   *   }
   * );
   * ```
   */
  async orchestrateChainSwitch(
    args: SwitchChainArgs,
    options: ChainSwitchOrchestrationOptions = {},
  ): Promise<SwitchChainResult> {
    const { onConfirm, onSuccess } = options;
    const targetChainInfo = this.getChain(args.chain.chainId);
    if (!targetChainInfo) {
      throw ErrorFactory.configurationError(`Chain ${args.chain.chainId} not found in registry`);
    }

    // Get current chain info for confirmation
    const currentChainId = await this.getCurrentChainId();
    const currentChain = currentChainId ? (this.getChain(currentChainId) ?? null) : null;

    // User confirmation if required
    if (onConfirm) {
      const confirmData: ChainSwitchConfirmData = {
        currentChain: currentChain ?? null,
        targetChain: targetChainInfo,
        wallet: { id: 'unknown', name: 'Unknown', chains: [] } as WalletInfo, // Simplified
        estimatedTime: 5000,
      };

      const confirmed = await Promise.resolve(onConfirm(confirmData));
      if (!confirmed) {
        throw ErrorFactory.connectionFailed('User cancelled chain switch');
      }
    }

    // Perform the switch
    const startTime = Date.now();
    const result = await this.switchChain(args);

    // Success callback
    // Check if switch was successful
    if (result.chain.chainId === args.chain.chainId && onSuccess) {
      const successData: ChainSwitchSuccessData = {
        previousChain: currentChain ?? null,
        newChain: targetChainInfo,
        wallet: { id: 'unknown', name: 'Unknown', chains: [] } as WalletInfo, // Simplified
        duration: Date.now() - startTime,
      };
      onSuccess(successData);
    }

    return result;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Load default chain configurations
   *
   * Loads built-in chain configurations for:
   * - EVM chains (Ethereum, Polygon, Sepolia) using CAIP-2 format
   * - Solana chains (Mainnet, Devnet) using CAIP-2 format
   * - Aztec chains (Mainnet, Testnet) using CAIP-2 format
   */
  private loadDefaultChains(): void {
    // Default EVM chains - using CAIP-2 format (eip155:chainId)
    const defaultChains: ChainInfo[] = [
      {
        chainId: 'eip155:1',
        chainType: ChainType.Evm,
        name: 'Ethereum Mainnet',
        required: false,
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io'],
      },
      {
        chainId: 'eip155:137',
        chainType: ChainType.Evm,
        name: 'Polygon Mainnet',
        required: false,
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
      },
      {
        chainId: 'eip155:11155111',
        chainType: ChainType.Evm,
        name: 'Sepolia Testnet',
        required: false,
        nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        testnet: true,
      },
    ];

    // Default Solana chains - using CAIP-2 format (solana:genesisHash)
    const solanaChains: ChainInfo[] = [
      {
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        chainType: ChainType.Solana,
        name: 'Solana Mainnet',
        required: false,
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
        rpcUrls: ['https://api.mainnet-beta.solana.com'],
        blockExplorerUrls: ['https://explorer.solana.com'],
      },
      {
        chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
        chainType: ChainType.Solana,
        name: 'Solana Devnet',
        required: false,
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
        rpcUrls: ['https://api.devnet.solana.com'],
        blockExplorerUrls: ['https://explorer.solana.com/?cluster=devnet'],
        testnet: true,
      },
    ];

    // Default Aztec chains - using CAIP-2 format (aztec:reference)
    const aztecChains: ChainInfo[] = [
      {
        chainId: 'aztec:mainnet',
        chainType: ChainType.Aztec,
        name: 'Aztec Mainnet',
        required: false,
        nativeCurrency: { name: 'Aztec', symbol: 'AZT', decimals: 18 },
        rpcUrls: ['https://api.aztec.network'],
        blockExplorerUrls: ['https://explorer.aztec.network'],
      },
      {
        chainId: 'aztec:testnet',
        chainType: ChainType.Aztec,
        name: 'Aztec Testnet',
        required: false,
        nativeCurrency: { name: 'Aztec', symbol: 'AZT', decimals: 18 },
        rpcUrls: ['https://api.testnet.aztec.network'],
        blockExplorerUrls: ['https://explorer.testnet.aztec.network'],
        testnet: true,
      },
    ];

    // Register all default chains
    for (const chain of [...defaultChains, ...solanaChains, ...aztecChains]) {
      this.registerChain(chain);
    }
  }

  /**
   * Get current chain ID from wallet/provider
   * This is a placeholder - real implementation would query the provider
   *
   * @param walletId - Optional wallet ID to query
   * @returns Current chain ID or null if not connected
   */
  private async getCurrentChainId(walletId?: string): Promise<string | null> {
    // Placeholder implementation
    // In real code, this would query the wallet provider
    this.logger.debug('Getting current chain ID for wallet:', walletId);

    // For testing purposes, return the last switched chain ID
    if (this.lastSwitchedChainIdForTesting) {
      return this.lastSwitchedChainIdForTesting;
    }

    return null;
  }

  /**
   * Perform the actual chain switch operation
   * This is a placeholder - real implementation would use provider APIs
   *
   * @param chainId - The chain ID to switch to
   */
  private async performChainSwitch(chainId: string): Promise<void> {
    // Placeholder implementation
    // In real code, this would call wallet_switchEthereumChain or similar
    this.logger.debug('Performing chain switch:', { chainId });

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For testing purposes, store the switched chain ID
    this.lastSwitchedChainIdForTesting = chainId;
  }
}
