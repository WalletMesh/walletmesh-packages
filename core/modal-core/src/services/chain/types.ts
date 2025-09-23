/**
 * Chain service types
 */

import type { ModalError } from '../../internal/core/errors/types.js';
import type { ChainType, SupportedChain } from '../../types.js';

/**
 * Chain information with metadata
 */
export interface ChainInfo extends SupportedChain {
  /** Native currency information */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** RPC URLs */
  rpcUrls: string[];
  /** Block explorer URLs */
  blockExplorerUrls?: string[];
  /** Whether this is a testnet */
  testnet?: boolean;
}

/**
 * Switch chain arguments
 */
export interface SwitchChainArgs {
  /** Chain to switch to */
  chain: SupportedChain;
  /** Optional chain addition data */
  addChainData?: {
    /** Chain to add */
    chain: SupportedChain;
    /** Native currency info */
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    /** RPC URLs */
    rpcUrls: string[];
    /** Block explorer URLs */
    blockExplorerUrls?: string[];
  };
}

/**
 * Switch chain result
 */
export interface SwitchChainResult {
  /** New chain */
  chain: SupportedChain;
  /** Previous chain */
  previousChain: SupportedChain;
  /** New provider instance */
  provider: unknown;
}

/**
 * Chain validation options
 */
export interface ChainValidationOptions {
  /** Whether to automatically switch chains if on wrong network */
  autoSwitch?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Chain validation result
 */
export interface ChainValidationResult {
  /** Whether the current chain is valid */
  isValid: boolean;
  /** Current chain */
  currentChain: SupportedChain | null;
  /** Required chain */
  requiredChain: SupportedChain;
  /** Validation error if any */
  error?: ModalError;
}

/**
 * Chain service configuration
 */
export interface ChainServiceConfig {
  /** Chains to support */
  chains?: ChainInfo[];
  /** Custom chain configurations */
  customChains?: Map<string, ChainInfo>;
  /** Whether to allow dynamic chain addition */
  allowDynamicChains?: boolean;
}

/**
 * Chain compatibility check options
 */
export interface ChainCompatibilityOptions {
  /** Wallet ID to check compatibility for */
  walletId: string;
  /** Chain to check */
  chain: SupportedChain;
}

/**
 * Chain compatibility result
 */
export interface ChainCompatibilityResult {
  /** Whether the chain is compatible */
  isCompatible: boolean;
  /** Reason for incompatibility */
  reason?: string;
  /** Chain type that would be required */
  requiredChainType?: ChainType;
}

/**
 * Chain switching event data
 */
export interface ChainSwitchingEventData {
  /** Chain being switched from */
  fromChain: SupportedChain;
  /** Chain being switched to */
  toChain: SupportedChain;
  /** Wallet performing the switch */
  walletId: string;
}

/**
 * Chain switch completed event data
 */
export interface ChainSwitchCompletedEventData extends ChainSwitchingEventData {
  /** New provider instance */
  provider: unknown;
  /** Switch duration in milliseconds */
  duration: number;
}

/**
 * Chain validation event data
 */
export interface ChainValidationEventData {
  /** Chain being validated */
  chain: SupportedChain;
  /** Whether validation passed */
  isValid: boolean;
  /** Error if validation failed */
  error?: Error;
  /** Validation type */
  validationType: 'single' | 'multi';
}

/**
 * Chain requirement validation result
 */
export interface ChainRequirementValidationResult {
  /** Whether the requirement is satisfied */
  isValid: boolean;
  /** Whether the user is on the correct chain */
  isCorrectChain: boolean;
  /** Whether user needs to connect wallet */
  needsConnection: boolean;
  /** Validation error if any */
  error?: Error;
}

/**
 * Chain service events
 */
export interface ChainServiceEvents {
  'chain:switching': ChainSwitchingEventData;
  'chain:switched': ChainSwitchCompletedEventData;
  'chain:switchFailed': ChainSwitchingEventData & { error: Error };
  'chain:validated': ChainValidationEventData;
  'chain:registered': ChainInfo;
  'chain:configUpdated': { chain: SupportedChain; config: ChainInfo };
}
