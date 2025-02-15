import type { WalletInfo, ConnectedWallet, WalletState } from '../../../types.js';
import type { Connector } from '../types.js';
import type { Transport } from '../../transports/types.js';
import { WalletError } from '../../client/types.js';

/**
 * Abstract base class for wallet connectors.
 *
 * Provides common functionality and enforces consistent patterns across
 * different connector implementations. Each blockchain-specific connector
 * should extend this class and implement its abstract methods.
 */
export abstract class BaseConnector implements Connector {
  protected transport: Transport | null = null;
  protected connectedWallet: ConnectedWallet | null = null;
  protected messageHandlers: Array<(data: unknown) => void> = [];

  /**
   * Creates and initializes transport for the connector.
   *
   * @param walletInfo - Wallet information for transport configuration
   * @returns Promise resolving to configured transport instance
   * @throws {WalletError} If transport creation fails
   *
   * @remarks
   * Each connector implementation should:
   * - Select appropriate transport type
   * - Configure transport with wallet-specific options
   * - Handle transport initialization errors
   *
   * @example
   * ```typescript
   * protected async createTransport(walletInfo: WalletInfo): Promise<Transport> {
   *   // Create and configure transport for specific protocol
   *   const transport = new PostMessageTransport({
   *     origin: walletInfo.url,
   *     timeout: 30000
   *   });
   *   return transport;
   * }
   * ```
   */
  protected abstract createTransport(walletInfo: WalletInfo): Promise<Transport>;

  /**
   * Validates and initializes a successful wallet connection.
   * Must be implemented by each connector to verify connection.
   *
   * @param wallet - Wallet to validate
   * @throws {WalletError} If validation fails
   *
   * @remarks
   * Validation should check:
   * - Required state fields
   * - Protocol-specific requirements
   * - Security constraints
   */
  protected abstract validateConnection(wallet: ConnectedWallet): Promise<void>;

  /**
   * Gets the chain-specific provider instance.
   */
  protected abstract getChainProvider(): Promise<unknown>;

  /**
   * Establishes a new wallet connection.
   *
   * @param walletInfo - Information about the wallet to connect
   * @returns Promise resolving to connected wallet details
   * @throws {WalletError} If connection fails at any stage
   *
   * @remarks
   * Connection flow:
   * 1. Creates and initializes transport
   * 2. Establishes protocol connection
   * 3. Validates connection state
   * 4. Sets up message handlers
   *
   * Error handling:
   * - Transport creation failures
   * - Connection timeouts
   * - Protocol errors
   * - State validation errors
   */
  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    try {
      this.transport = await this.createTransport(walletInfo);

      this.transport.onMessage((data) => {
        try {
          this.handleMessage(data);
        } catch (error) {
          console.error('[BaseConnector] Message handler error:', error);
        }
      });

      await this.transport.connect();

      this.connectedWallet = {
        info: walletInfo,
        state: {}, // Will be populated during validation
      };

      await this.validateConnection(this.connectedWallet);

      if (!this.connectedWallet) {
        throw new Error('Connection state lost during validation');
      }

      return this.connectedWallet;
    } catch (error) {
      await this.disconnect();
      throw new WalletError(
        `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'connector',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Resumes an existing wallet connection.
   *
   * @param walletInfo - Wallet configuration
   * @param savedState - Previously saved wallet state
   * @returns Promise resolving to reconnected wallet
   * @throws {WalletError} If session restoration fails
   *
   * @remarks
   * Restoration process:
   * 1. Recreates transport with saved config
   * 2. Reestablishes protocol connection
   * 3. Verifies state matches saved state
   * 4. Reinstates message handlers
   */
  async resume(walletInfo: WalletInfo, savedState: WalletState): Promise<ConnectedWallet> {
    try {
      this.transport = await this.createTransport(walletInfo);

      this.transport.onMessage((data) => {
        try {
          this.handleMessage(data);
        } catch (error) {
          console.error('[BaseConnector] Message handler error:', error);
        }
      });

      await this.transport.connect();

      this.connectedWallet = {
        info: walletInfo,
        state: savedState,
      };

      await this.validateConnection(this.connectedWallet);

      if (!this.connectedWallet) {
        throw new Error('Connection state lost during validation');
      }

      return this.connectedWallet;
    } catch (error) {
      await this.disconnect();
      throw new WalletError(
        `Session restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'connector',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Disconnects the wallet and cleans up resources.
   */
  async disconnect(): Promise<void> {
    try {
      if (this.transport) {
        await this.transport.disconnect();
        this.transport = null;
      }
      this.connectedWallet = null;
      this.messageHandlers = [];
    } catch (error) {
      throw new WalletError(
        `Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'connector',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Sends data to the connected wallet.
   */
  protected async send(data: unknown): Promise<void> {
    if (!this.transport) {
      throw new WalletError('Cannot send message: Not connected', 'connector');
    }

    try {
      await this.transport.send(data);
    } catch (error) {
      throw new WalletError(
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'connector',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Gets chain-specific provider instance.
   */
  async getProvider(): Promise<unknown> {
    if (!this.connectedWallet) {
      throw new WalletError('Cannot get provider: Not connected', 'connector');
    }

    try {
      return await this.getChainProvider();
    } catch (error) {
      throw new WalletError(
        `Failed to get provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'connector',
        error instanceof Error ? error : undefined,
      );
    }
  }

  /**
   * Handles incoming messages from transport.
   */
  handleMessage(data: unknown): void {
    for (const handler of this.messageHandlers) {
      try {
        handler(data);
      } catch (error) {
        console.error('[BaseConnector] Message handler error:', error);
      }
    }
  }

  /**
   * Registers a message handler.
   */
  protected addMessageHandler(handler: (data: unknown) => void): void {
    this.messageHandlers.push(handler);
  }
}
