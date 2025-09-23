/**
 * Provider query utilities for executing RPC methods across different blockchain types
 *
 * Framework-agnostic utilities for querying blockchain providers with support
 * for EVM, Solana, and Aztec chains.
 *
 * @module utils/providerQuery
 * @packageDocumentation
 * @since 3.0.0
 */

import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import { modalLogger } from '../internal/core/logger/globalLogger.js';
import type { ChainType, SupportedChain } from '../types.js';

/**
 * Provider method execution options
 */
export interface ProviderQueryOptions {
  /** RPC method to call */
  method: string;
  /** Parameters for the RPC method */
  params?: unknown[];
  /** Chain information for context */
  chain?: SupportedChain;
  /** Chain type (if known) */
  chainType?: ChainType;
}

/**
 * Result from provider method execution
 */
export interface ProviderQueryResult<T = unknown> {
  /** The result data */
  data: T;
  /** Chain the query was executed on */
  chain?: SupportedChain | undefined;
  /** Method that was called */
  method: string;
}

/**
 * Execute a provider method across different blockchain types
 *
 * This function provides a unified interface for executing RPC methods
 * on different blockchain providers (EVM, Solana, Aztec). It handles
 * the differences in provider interfaces and method calling conventions.
 *
 * @param provider - The blockchain provider instance
 * @param options - Query options including method and params
 * @returns Promise resolving to the query result
 *
 * @example
 * ```typescript
 * // EVM provider - get block number
 * const result = await executeProviderMethod(provider, {
 *   method: 'eth_blockNumber',
 *   chainType: ChainType.Evm
 * });
 * console.log('Block:', parseInt(result.data as string, 16));
 * ```
 *
 * @example
 * ```typescript
 * // Solana provider - get balance
 * const result = await executeProviderMethod(provider, {
 *   method: 'getBalance',
 *   params: [publicKey],
 *   chainType: ChainType.Solana
 * });
 * console.log('Balance:', result.data);
 * ```
 *
 * @throws {Error} If provider is null or method execution fails
 *
 * @category Utilities
 * @public
 */
export async function executeProviderMethod<T = unknown>(
  provider: unknown,
  options: ProviderQueryOptions,
): Promise<ProviderQueryResult<T>> {
  const { method, params = [], chain, chainType } = options;

  if (!provider) {
    throw ErrorFactory.invalidParams('Provider is required for executing methods');
  }

  if (!method) {
    throw ErrorFactory.invalidParams('Method name is required');
  }

  modalLogger.debug('Executing provider method', {
    method,
    params,
    chainId: chain?.chainId,
    chainType,
  });

  try {
    let result: unknown;

    // Determine chain type from various sources
    const actualChainType = chainType || chain?.chainType || detectChainType(provider);

    switch (actualChainType) {
      case 'evm':
        result = await executeEvmMethod(provider, method, params);
        break;

      case 'solana':
        result = await executeSolanaMethod(provider, method, params);
        break;

      case 'aztec':
        result = await executeAztecMethod(provider, method, params);
        break;

      default:
        // Try generic execution as fallback
        result = await executeGenericMethod(provider, method, params);
    }

    return {
      data: result as T,
      chain,
      method,
    };
  } catch (error) {
    modalLogger.error('Provider method execution failed:', error);
    throw error instanceof Error ? error : new Error('Provider method execution failed');
  }
}

/**
 * Execute method on EVM provider (EIP-1193 compatible)
 */
async function executeEvmMethod(provider: unknown, method: string, params: unknown[]): Promise<unknown> {
  const evmProvider = provider as Record<string, unknown>;

  // Check for EIP-1193 request method
  if ('request' in evmProvider && typeof evmProvider['request'] === 'function') {
    return await (
      evmProvider['request'] as (params: { method: string; params: unknown[] }) => Promise<unknown>
    )({
      method,
      params,
    });
  }

  // Fallback to legacy send method
  if ('send' in evmProvider && typeof evmProvider['send'] === 'function') {
    return await (evmProvider['send'] as (method: string, params: unknown[]) => Promise<unknown>)(
      method,
      params,
    );
  }

  // Try ethereum.request for injected providers
  if ('ethereum' in evmProvider && evmProvider['ethereum']) {
    const ethereum = evmProvider['ethereum'] as Record<string, unknown>;
    if ('request' in ethereum && typeof ethereum['request'] === 'function') {
      return await (
        ethereum['request'] as (params: { method: string; params: unknown[] }) => Promise<unknown>
      )({
        method,
        params,
      });
    }
  }

  throw ErrorFactory.configurationError(`EVM provider does not support method execution: ${method}`);
}

/**
 * Execute method on Solana provider
 */
async function executeSolanaMethod(provider: unknown, method: string, params: unknown[]): Promise<unknown> {
  const solanaProvider = provider as Record<string, unknown>;

  // Check for connection object (common in Solana providers)
  if ('connection' in solanaProvider && solanaProvider['connection']) {
    const connection = solanaProvider['connection'] as Record<string, unknown>;

    // Map common Solana methods
    switch (method) {
      case 'getBalance':
        if (typeof connection['getBalance'] === 'function') {
          return await (connection['getBalance'] as (param: unknown) => Promise<unknown>)(params[0]);
        }
        break;

      case 'getBlockHeight':
        if (typeof connection['getBlockHeight'] === 'function') {
          return await (connection['getBlockHeight'] as () => Promise<unknown>)();
        }
        break;

      case 'getTransaction':
        if (typeof connection['getTransaction'] === 'function') {
          return await (connection['getTransaction'] as (param: unknown) => Promise<unknown>)(params[0]);
        }
        break;

      case 'getRecentBlockhash':
        if (typeof connection['getRecentBlockhash'] === 'function') {
          return await (connection['getRecentBlockhash'] as () => Promise<unknown>)();
        }
        break;

      case 'sendTransaction':
        if (typeof connection['sendTransaction'] === 'function') {
          return await (connection['sendTransaction'] as (...args: unknown[]) => Promise<unknown>)(...params);
        }
        break;

      default:
        // Try to call the method directly on connection
        if (typeof connection[method] === 'function') {
          return await (connection[method] as (...args: unknown[]) => Promise<unknown>)(...params);
        }
    }
  }

  // Try direct method call on provider
  if (typeof solanaProvider[method] === 'function') {
    return await (solanaProvider[method] as (...args: unknown[]) => Promise<unknown>)(...params);
  }

  // Special handling for Phantom/Solflare style providers
  if ('solana' in solanaProvider && solanaProvider['solana']) {
    const wallet = solanaProvider['solana'] as Record<string, unknown>;
    if (typeof wallet[method] === 'function') {
      return await (wallet[method] as (...args: unknown[]) => Promise<unknown>)(...params);
    }
  }

  throw ErrorFactory.configurationError(`Solana provider does not support method: ${method}`);
}

/**
 * Execute method on Aztec provider
 */
async function executeAztecMethod(provider: unknown, method: string, params: unknown[]): Promise<unknown> {
  const aztecProvider = provider as Record<string, unknown>;

  // Direct method call for Aztec providers
  if (typeof aztecProvider[method] === 'function') {
    return await (aztecProvider[method] as (...args: unknown[]) => Promise<unknown>)(...params);
  }

  // Check for nested wallet object
  if ('wallet' in aztecProvider && aztecProvider['wallet']) {
    const wallet = aztecProvider['wallet'] as Record<string, unknown>;
    if (typeof wallet[method] === 'function') {
      return await (wallet[method] as (...args: unknown[]) => Promise<unknown>)(...params);
    }
  }

  // Check for aztec property (some providers nest the interface)
  if ('aztec' in aztecProvider && aztecProvider['aztec']) {
    const aztec = aztecProvider['aztec'] as Record<string, unknown>;
    if (typeof aztec[method] === 'function') {
      return await (aztec[method] as (...args: unknown[]) => Promise<unknown>)(...params);
    }
  }

  throw ErrorFactory.configurationError(`Aztec provider does not support method: ${method}`);
}

/**
 * Execute method on generic provider (fallback)
 */
async function executeGenericMethod(provider: unknown, method: string, params: unknown[]): Promise<unknown> {
  const genericProvider = provider as Record<string, unknown>;

  // Try direct method call
  if (typeof genericProvider[method] === 'function') {
    return await (genericProvider[method] as (...args: unknown[]) => Promise<unknown>)(...params);
  }

  // Try request method (common pattern)
  if ('request' in genericProvider && typeof genericProvider['request'] === 'function') {
    return await (
      genericProvider['request'] as (params: { method: string; params: unknown[] }) => Promise<unknown>
    )({
      method,
      params,
    });
  }

  // Try send method (legacy pattern)
  if ('send' in genericProvider && typeof genericProvider['send'] === 'function') {
    return await (genericProvider['send'] as (method: string, params: unknown[]) => Promise<unknown>)(
      method,
      params,
    );
  }

  throw ErrorFactory.configurationError(`Provider does not support method: ${method}`);
}

/**
 * Detect chain type from provider object
 */
function detectChainType(provider: unknown): ChainType | undefined {
  if (!provider || typeof provider !== 'object') {
    return undefined;
  }

  const p = provider as Record<string, unknown>;

  // EVM detection
  if ('request' in p || 'send' in p || 'ethereum' in p || 'isMetaMask' in p) {
    return 'evm' as ChainType;
  }

  // Solana detection
  if ('connection' in p || 'solana' in p || 'isPhantom' in p || 'isSolflare' in p) {
    return 'solana' as ChainType;
  }

  // Aztec detection
  if ('aztec' in p || 'getAccounts' in p || 'addAuthWitness' in p) {
    return 'aztec' as ChainType;
  }

  return undefined;
}

/**
 * Create a query key for caching provider queries
 *
 * Generates a consistent cache key for provider queries that can be used
 * with caching libraries like TanStack Query.
 *
 * @param chainId - Chain ID
 * @param method - RPC method name
 * @param params - Method parameters
 * @returns Array suitable for use as a query key
 *
 * @example
 * ```typescript
 * const queryKey = createProviderQueryKey('1', 'eth_getBalance', ['0x123...', 'latest']);
 * // Returns: ['providerQuery', '1', 'eth_getBalance', '0x123...', 'latest']
 * ```
 *
 * @category Utilities
 * @public
 */
export function createProviderQueryKey(
  chainId: string | undefined,
  method: string,
  ...params: unknown[]
): unknown[] {
  const key: unknown[] = ['providerQuery'];

  if (chainId) {
    key.push(chainId);
  }

  key.push(method);

  if (params.length > 0) {
    // Ensure params are serializable for query key
    for (const param of params) {
      if (param === undefined) {
        key.push('undefined');
      } else if (param === null) {
        key.push('null');
      } else if (typeof param === 'object') {
        key.push(JSON.stringify(param));
      } else {
        key.push(param);
      }
    }
  }

  return key;
}

/**
 * Check if a provider supports a specific method
 *
 * @param provider - Provider to check
 * @param method - Method name to check for
 * @param chainType - Optional chain type for context
 * @returns True if the method is likely supported
 *
 * @example
 * ```typescript
 * if (isMethodSupported(provider, 'eth_requestAccounts', 'evm')) {
 *   await provider.request({ method: 'eth_requestAccounts' });
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export function isMethodSupported(provider: unknown, method: string, chainType?: ChainType): boolean {
  if (!provider || typeof provider !== 'object') {
    return false;
  }

  const p = provider as Record<string, unknown>;
  const actualChainType = chainType || detectChainType(provider);

  // Direct method check
  if (typeof p[method] === 'function') {
    return true;
  }

  // Chain-specific checks
  switch (actualChainType) {
    case 'evm': {
      const ethereum = p['ethereum'] as Record<string, unknown> | undefined;
      return !!(p['request'] || p['send'] || ethereum?.['request']);
    }

    case 'solana': {
      const connection = p['connection'] as Record<string, unknown> | undefined;
      if (connection && typeof connection[method] === 'function') {
        return true;
      }
      const solana = p['solana'] as Record<string, unknown> | undefined;
      return !!(solana && typeof solana[method] === 'function');
    }

    case 'aztec': {
      const wallet = p['wallet'] as Record<string, unknown> | undefined;
      const aztec = p['aztec'] as Record<string, unknown> | undefined;
      return (
        !!(wallet && typeof wallet[method] === 'function') || !!(aztec && typeof aztec[method] === 'function')
      );
    }

    default:
      return false;
  }
}
