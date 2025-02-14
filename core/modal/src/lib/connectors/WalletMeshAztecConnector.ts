import type { WalletInfo, ConnectedWallet, WalletState } from '../../types.js';
import type { Connector, AztecConnectorOptions } from './types.js';
import { WalletError } from '../client/types.js';

/**
 * Interface for interacting with the Aztec protocol provider.
 *
 * @remarks
 * This is currently a mock implementation for development/testing.
 * Will be replaced with actual Aztec protocol integration.
 *
 * @property connect - Establishes connection with the wallet
 * @property disconnect - Terminates the wallet connection
 * @property getAccount - Retrieves the connected account address
 * @property sendMessage - Sends messages to the wallet
 */
interface AztecProvider {
  connect(sessionId?: string): Promise<{ address: string; sessionId: string }>;
  disconnect(): Promise<void>;
  getAccount(): Promise<string>;
  sendMessage(data: unknown): Promise<void>;
}

/**
 * Connector implementation for WalletMesh integration with Aztec protocol.
 *
 * Handles communication between the dApp and Aztec-compatible wallets,
 * managing connection state, session persistence, and message routing.
 *
 * @remarks
 * Currently implements a mock provider for development/testing.
 * Production implementation will integrate with actual Aztec protocol.
 *
 * @example
 * ```typescript
 * const connector = new WalletMeshAztecConnector({
 *   chainId: 'aztec:testnet',
 *   rpcUrl: 'https://testnet.aztec.network/rpc'
 * });
 *
 * const wallet = await connector.connect({
 *   id: 'aztec-wallet',
 *   name: 'Aztec Wallet',
 *   // ... other wallet info
 * });
 * ```
 */
export class WalletMeshAztecConnector implements Connector {
  private provider: AztecProvider | null = null;
  private connected = false;
  private readonly options: AztecConnectorOptions;

  /**
   * Creates a new WalletMeshAztecConnector instance.
   *
   * @param options - Configuration options for the connector
   *
   * @remarks
   * Default options are provided for development convenience:
   * - chainId: '1'
   * - rpcUrl: 'https://aztec.network/rpc'
   */
  constructor(options: AztecConnectorOptions = {}) {
    this.options = {
      chainId: '1',
      rpcUrl: 'https://aztec.network/rpc',
      ...options,
    };
  }

  /**
   * Establishes a new connection with an Aztec-compatible wallet.
   *
   * @param walletInfo - Information about the wallet to connect
   * @returns Promise resolving to the connected wallet details
   * @throws {WalletError} If already connected or connection fails
   *
   * @remarks
   * In the current mock implementation:
   * - Creates a simulated provider
   * - Generates a random wallet address
   * - Creates a new session ID
   *
   * @example
   * ```typescript
   * const wallet = await connector.connect({
   *   id: 'aztec-wallet',
   *   name: 'Aztec Wallet',
   *   icon: 'wallet-icon.png'
   * });
   * console.log('Connected to:', wallet.state.address);
   * ```
   */
  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'connector');
    }

    try {
      // Mock provider for now - will be replaced with actual backend implementation
      this.provider = this.createProvider();

      // Create new connection
      const connection = await this.provider.connect();
      this.connected = true;

      return {
        info: walletInfo,
        state: {
          chain: this.options.chainId || 'aztec-testnet',
          address: connection.address,
          sessionId: connection.sessionId,
        },
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  /**
   * Attempts to restore a previous wallet connection.
   *
   * @param walletInfo - Information about the wallet to reconnect
   * @param savedState - Previously saved session state
   * @returns Promise resolving to the reconnected wallet
   * @throws {WalletError} If already connected or restoration fails
   *
   * @remarks
   * Implements retry logic for connection restoration:
   * - Makes up to 3 attempts to reconnect
   * - Implements exponential backoff between attempts
   * - Validates restored connection matches saved state
   *
   * @example
   * ```typescript
   * const wallet = await connector.resume(
   *   walletInfo,
   *   {
   *     chain: 'aztec:testnet',
   *     address: '0x...',
   *     sessionId: 'previous-session'
   *   }
   * );
   * ```
   */
  async resume(walletInfo: WalletInfo, savedState: WalletState): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'connector');
    }

    // Validate saved state
    if (!savedState.address || !savedState.sessionId || !savedState.chain) {
      throw new WalletError('Incomplete session state', 'connector');
    }

    try {
      // Create provider with saved state
      this.provider = this.createProvider();

      // Attempt to restore the session
      console.log('[WalletMeshAztecConnector] Attempting to restore session:', {
        sessionId: savedState.sessionId,
        address: savedState.address,
        chain: savedState.chain,
      });

      // Try to reconnect with retries
      const maxRetries = 3;
      let lastError: Error | unknown;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const connection = await this.provider.connect(savedState.sessionId);

          // Validate restored connection matches saved state
          if (connection.address.toLowerCase() !== savedState.address.toLowerCase()) {
            throw new Error('Restored address does not match saved state');
          }

          this.connected = true;
          console.log('[WalletMeshAztecConnector] Session restored successfully');

          return {
            info: walletInfo,
            state: {
              chain: savedState.chain,
              address: connection.address,
              sessionId: connection.sessionId,
            },
          };
        } catch (err) {
          lastError = err;
          if (attempt < maxRetries) {
            console.log(`[WalletMeshAztecConnector] Restore attempt ${attempt} failed, retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      // If we get here, all retries failed
      throw lastError;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resume connection');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  /**
   * Terminates the current wallet connection.
   *
   * @returns Promise that resolves when disconnection is complete
   * @throws {WalletError} If disconnection fails
   *
   * @remarks
   * - Safely handles disconnection if already disconnected
   * - Cleans up provider instance
   * - Resets connection state
   */
  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.provider) {
        await this.provider.disconnect();
      }
      this.provider = null;
      this.connected = false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  /**
   * Retrieves the Aztec protocol provider instance.
   *
   * @returns Promise resolving to the provider instance
   * @throws {WalletError} If not connected or provider unavailable
   *
   * @remarks
   * The provider instance gives direct access to Aztec protocol
   * functionality. Should only be used by trusted internal code.
   */
  async getProvider(): Promise<AztecProvider> {
    if (!this.connected || !this.provider) {
      throw new WalletError('Not connected', 'connector');
    }
    return this.provider;
  }

  /**
   * Processes incoming messages from the transport layer.
   *
   * @param data - Message payload from the transport
   *
   * @remarks
   * - Safely handles messages when disconnected
   * - Forwards messages to provider when connected
   * - Logs errors without throwing
   */
  handleMessage(data: unknown): void {
    if (!this.connected || !this.provider) {
      console.warn('Received message while not connected');
      return;
    }

    // Forward message to provider
    this.provider.sendMessage(data).catch((err) => {
      console.error('Failed to send message to provider:', err);
    });
  }

  /**
   * Creates a mock Aztec protocol provider for testing.
   *
   * @returns Mock provider implementation
   *
   * @remarks
   * This is a temporary implementation for development/testing:
   * - Simulates connection delays
   * - Generates random addresses
   * - Creates mock sessions
   * - Simulates random connection failures
   *
   * @internal
   */
  private createProvider(): AztecProvider {
    return {
      connect: async (sessionId?: string) => {
        // For testing: Simulate connection failures sometimes during session restore
        if (sessionId && Math.random() < 0.3) {
          throw new Error('Simulated connection failure');
        }

        // Simulate backend validation and connection
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (sessionId) {
          console.log('[WalletMeshAztecConnector] Reconnecting with session:', sessionId);
          // Use sessionId to determine address (in real impl this would verify with wallet)
          const address = sessionId.includes('0x') ? sessionId.split('_')[0] : '0x1234567890abcdef';

          // Ensure we always have a valid address
          if (!address || !address.startsWith('0x')) {
            throw new Error('Invalid session: missing or invalid address');
          }

          return {
            address, // TypeScript now knows this is a non-null string
            sessionId,
          };
        }

        // New connection - generate new session with random address
        const randomAddress = `0x${Math.random().toString(16).slice(2, 12)}`;
        const newSession = {
          address: randomAddress as string, // Assert as string to satisfy TS
          sessionId: `${randomAddress}_${Date.now()}`,
        };
        console.log('[WalletMeshAztecConnector] Created new session:', newSession);
        return newSession;
      },

      disconnect: async () => {
        console.log('[WalletMeshAztecConnector] Disconnecting wallet');
        this.connected = false;
      },

      getAccount: async () => {
        if (!this.connected) {
          throw new WalletError('Wallet not connected', 'connector');
        }
        return '0x1234567890abcdef';
      },

      sendMessage: async (data) => {
        console.log('[WalletMeshAztecConnector] Sending message to wallet:', data);
      },
    };
  }
}
