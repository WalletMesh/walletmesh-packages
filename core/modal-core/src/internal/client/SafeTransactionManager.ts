/**
 * Safe transaction manager for multi-wallet/multi-chain operations
 */

import type {
  SafeTransactionRequest,
  TransactionContext,
  TransactionManager,
  TransactionResult,
} from '../../api/types/transaction.js';
import type { SessionState } from '../../api/types/sessionState.js';
import { useStore } from '../../state/store.js';
import type { SupportedChain } from '../../types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { WalletMeshClient } from './WalletMeshClientImpl.js';

export class SafeTransactionManager implements TransactionManager {
  constructor(private client: WalletMeshClient) {}

  /**
   * Helper to get session by wallet ID
   * @private
   */
  private getSessionByWalletId(walletId: string): SessionState | null {
    const state = useStore.getState();
    const sessions = Object.values(state.entities.sessions).filter(
      (s) => s.walletId === walletId && s.status === 'connected',
    );
    return sessions[0] || null;
  }

  async executeWithContext<T = unknown>(request: SafeTransactionRequest<T>): Promise<TransactionResult<T>> {
    const { context, params } = request;

    // Validate context first
    const validation = await this.validateContext(context);
    if (!validation.valid) {
      throw ErrorFactory.configurationError(`Invalid transaction context: ${validation.reason}`, {
        suggestedAction: validation.suggestedAction,
      });
    }

    // Get session for this wallet instead of adapter
    const session = this.getSessionByWalletId(context.walletId);
    if (!session) {
      throw ErrorFactory.walletNotFound(context.walletId);
    }

    // Check if we need to switch chains
    let chainSwitched = false;
    const currentChainId = String(session.chain.chainId);
    const targetChainId = String(context.chain.chainId);

    if (currentChainId !== targetChainId) {
      if (context.autoSwitchChain) {
        // Auto switch chain
        await this.client.switchChain(context.chain.chainId, context.walletId);
        chainSwitched = true;
      } else {
        throw ErrorFactory.configurationError(
          `Wrong chain. Expected ${targetChainId}, but wallet is on ${currentChainId}`,
          { currentChain: currentChainId, targetChain: targetChainId },
        );
      }
    }

    // Get provider from session after potential chain switch
    const updatedSession = this.getSessionByWalletId(context.walletId);
    const provider = updatedSession?.provider?.instance;
    if (!provider) {
      throw ErrorFactory.connectionFailed('No provider available');
    }

    // Execute the transaction
    try {
      const result = await this.executeTransaction(provider, params);

      return {
        result: result as T,
        context,
        chainSwitched,
        providerVersion: this.client.getProviderVersion(context.walletId),
      };
    } catch (error) {
      throw ErrorFactory.connectionFailed(`Transaction failed: ${(error as Error).message}`, {
        walletId: context.walletId,
        chain: context.chain,
      });
    }
  }

  async validateContext(context: TransactionContext): Promise<{
    valid: boolean;
    reason?: string;
    suggestedAction?: 'connect-wallet' | 'switch-chain' | 'switch-wallet';
  }> {
    // Check if wallet is connected using session state
    const session = this.getSessionByWalletId(context.walletId);
    if (!session) {
      return {
        valid: false,
        reason: 'Wallet not connected',
        suggestedAction: 'connect-wallet',
      };
    }

    // Get adapter to check capabilities
    const adapter = this.client.getConnection(context.walletId);
    if (!adapter) {
      return {
        valid: false,
        reason: 'Wallet adapter not found',
        suggestedAction: 'connect-wallet',
      };
    }

    // Check if wallet supports the target chain
    const supportedChains = adapter.capabilities.chains;
    const targetChainType = context.chainType || context.chain.chainType;

    const supportsChain = supportedChains.some((chain) => {
      if (context.chainType) {
        return chain.type === context.chainType;
      }
      // For now, assume same type can switch
      return chain.type === session.chain.chainType;
    });

    if (!supportsChain) {
      return {
        valid: false,
        reason: `Wallet does not support chain type ${targetChainType}`,
        suggestedAction: 'switch-wallet',
      };
    }

    // Check if on correct chain (unless auto-switch is enabled)
    const currentChainId = String(session.chain.chainId);
    const targetChainId = String(context.chain.chainId);

    if (currentChainId !== targetChainId && !context.autoSwitchChain) {
      return {
        valid: false,
        reason: `Wrong chain. On ${currentChainId}, need ${targetChainId}`,
        suggestedAction: 'switch-chain',
      };
    }

    return { valid: true };
  }

  getBestWalletForChain(chain: SupportedChain): string | null {
    const wallets = this.getWalletsForChain(chain);
    if (wallets.length === 0) return null;

    // Prefer the active wallet if it supports the chain
    const activeWallet = this.client.getActiveWallet();
    if (activeWallet && wallets.includes(activeWallet)) {
      return activeWallet;
    }

    // Otherwise return the first connected wallet that supports it
    return wallets[0] || null;
  }

  getWalletsForChain(chain: SupportedChain): string[] {
    const connections = this.client.getConnections();
    const chainType = chain.chainType;

    return connections
      .filter((adapter) => {
        // Check if connected using session state
        const session = this.getSessionByWalletId(adapter.id);
        if (!session) return false;

        // Check if supports the chain type
        return adapter.capabilities.chains.some(
          (chain) => chain.type === chainType || chain.type === session.chain.chainType,
        );
      })
      .map((adapter) => {
        const adapterWithId = adapter as { id?: string };
        return adapterWithId.id || adapter.metadata.name;
      });
  }

  private async executeTransaction(provider: unknown, params: unknown): Promise<unknown> {
    // This is a simplified implementation
    // In reality, this would handle different provider types
    const evmProvider = provider as { request?: (params: unknown) => Promise<unknown> };

    if (evmProvider.request) {
      return evmProvider.request(params);
    }

    throw ErrorFactory.configurationError('Unsupported provider type');
  }
}
