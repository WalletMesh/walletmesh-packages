/**
 * Provider validation with support for lazy/async provider initialization
 *
 * This module provides validation for blockchain providers, ensuring they implement
 * the required interfaces for their respective chain types. It supports both
 * synchronously-initialized providers and lazy/async providers that initialize
 * asynchronously (like LazyAztecRouterProvider).
 *
 * @module internal/client/providerValidator
 * @packageDocumentation
 */

import type { BlockchainProvider } from '../../types.js';
import type { Logger } from '../core/logger/logger.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { ChainType } from '../../types.js';

/**
 * Interface for providers that support lazy initialization
 * Detected via duck typing
 */
interface LazyProvider {
  ensureReady(): Promise<void>;
  isInitialized: boolean;
}

/**
 * Validation context for provider validation
 */
export interface ProviderValidationContext {
  sessionId: string;
  walletId: string;
  chainType: ChainType;
}

/**
 * Provider validator with async initialization support
 *
 * Validates that blockchain providers implement the required interfaces for their
 * chain type. Automatically detects and handles lazy/async providers by awaiting
 * initialization before validation.
 *
 * @example
 * ```typescript
 * const validator = new ProviderValidator(logger);
 *
 * // Validate a provider (works with both sync and async providers)
 * await validator.validate(provider, {
 *   sessionId: 'session-123',
 *   walletId: 'metamask',
 *   chainType: ChainType.Evm
 * });
 * ```
 *
 * @public
 */
export class ProviderValidator {
  constructor(private readonly logger?: Logger) {}

  /**
   * Check if a provider supports lazy initialization
   * Uses duck typing to detect providers with ensureReady() method
   *
   * Note: Properly handles getter properties like `isInitialized` by accessing
   * the property directly (which triggers the getter) rather than using type
   * assertions that may not work correctly with getters.
   */
  private isLazyProvider(provider: BlockchainProvider): provider is BlockchainProvider & LazyProvider {
    // Check for ensureReady method
    const hasEnsureReady = 'ensureReady' in provider && typeof provider.ensureReady === 'function';

    // Check for isInitialized property (handles both direct properties and getters)
    const hasIsInitialized = 'isInitialized' in provider &&
      typeof (provider as { isInitialized?: boolean }).isInitialized === 'boolean';

    return hasEnsureReady && hasIsInitialized;
  }

  /**
   * Ensure a provider is ready for use
   * Automatically handles lazy providers by awaiting initialization
   *
   * @param provider - The provider to ensure is ready
   * @param context - Validation context for error reporting
   */
  private async ensureProviderReady(
    provider: BlockchainProvider,
    context: ProviderValidationContext,
  ): Promise<void> {
    if (this.isLazyProvider(provider)) {
      this.logger?.debug('Detected lazy provider, awaiting initialization', {
        sessionId: context.sessionId,
        walletId: context.walletId,
        isInitialized: provider.isInitialized,
      });

      try {
        await provider.ensureReady();
        this.logger?.debug('Lazy provider initialization complete', {
          sessionId: context.sessionId,
          walletId: context.walletId,
        });
      } catch (error) {
        this.logger?.error('Lazy provider initialization failed', {
          sessionId: context.sessionId,
          walletId: context.walletId,
          error,
        });
        throw ErrorFactory.connectionFailed('Provider initialization failed', {
          sessionId: context.sessionId,
          walletId: context.walletId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Validate Aztec provider interface
   * Aztec providers must have a call() method for RPC communication
   */
  private validateAztecProvider(provider: BlockchainProvider, context: ProviderValidationContext): void {
    if (!('call' in provider) || typeof provider.call !== 'function') {
      this.logger?.error('Provider missing required Aztec interface', {
        sessionId: context.sessionId,
        chainType: context.chainType,
        providerMethods: Object.keys(provider),
      });
      throw ErrorFactory.connectionFailed(
        'Provider does not implement required Aztec interface (missing call method)',
        {
          sessionId: context.sessionId,
          walletId: context.walletId,
          chainType: context.chainType,
        },
      );
    }
  }

  /**
   * Validate EVM provider interface
   * EVM providers must implement EIP-1193 with request() method
   */
  private validateEvmProvider(provider: BlockchainProvider, context: ProviderValidationContext): void {
    if (!('request' in provider) || typeof provider.request !== 'function') {
      this.logger?.error('Provider missing required EVM interface', {
        sessionId: context.sessionId,
        chainType: context.chainType,
        providerMethods: Object.keys(provider),
      });
      throw ErrorFactory.connectionFailed(
        'Provider does not implement required EVM interface (missing request method)',
        {
          sessionId: context.sessionId,
          walletId: context.walletId,
          chainType: context.chainType,
        },
      );
    }
  }

  /**
   * Validate Solana provider interface
   * Solana providers must have signAndSendTransaction() or sendTransaction() method
   */
  private validateSolanaProvider(provider: BlockchainProvider, context: ProviderValidationContext): void {
    const hasSignAndSend =
      'signAndSendTransaction' in provider && typeof provider.signAndSendTransaction === 'function';
    const hasSendTransaction = 'sendTransaction' in provider && typeof provider.sendTransaction === 'function';

    if (!hasSignAndSend && !hasSendTransaction) {
      this.logger?.error('Provider missing required Solana interface', {
        sessionId: context.sessionId,
        chainType: context.chainType,
        providerMethods: Object.keys(provider),
      });
      throw ErrorFactory.connectionFailed(
        'Provider does not implement required Solana interface (missing signAndSendTransaction or sendTransaction method)',
        {
          sessionId: context.sessionId,
          walletId: context.walletId,
          chainType: context.chainType,
        },
      );
    }
  }

  /**
   * Validate a provider implements the required interface for its chain type
   *
   * Automatically detects and handles lazy providers by awaiting initialization
   * before performing validation.
   *
   * @param provider - The provider to validate
   * @param context - Validation context with session/wallet/chain information
   * @throws {ModalError} If provider doesn't implement required interface
   *
   * @example
   * ```typescript
   * // Validate an EVM provider
   * await validator.validate(provider, {
   *   sessionId: 'session-123',
   *   walletId: 'metamask',
   *   chainType: ChainType.Evm
   * });
   * ```
   */
  public async validate(provider: BlockchainProvider, context: ProviderValidationContext): Promise<void> {
    this.logger?.debug('Validating provider interface', {
      sessionId: context.sessionId,
      walletId: context.walletId,
      chainType: context.chainType,
    });

    // Ensure provider is ready (handles lazy providers)
    await this.ensureProviderReady(provider, context);

    // Perform chain-specific validation
    switch (context.chainType) {
      case ChainType.Aztec:
        this.validateAztecProvider(provider, context);
        break;
      case ChainType.Evm:
        this.validateEvmProvider(provider, context);
        break;
      case ChainType.Solana:
        this.validateSolanaProvider(provider, context);
        break;
      default:
        this.logger?.warn('Unknown chain type, skipping validation', {
          sessionId: context.sessionId,
          chainType: context.chainType,
        });
    }

    this.logger?.debug('Provider validation successful', {
      sessionId: context.sessionId,
      walletId: context.walletId,
      chainType: context.chainType,
    });
  }
}
