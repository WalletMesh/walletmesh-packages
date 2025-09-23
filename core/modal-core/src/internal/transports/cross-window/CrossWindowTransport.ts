/**
 * Cross-window transport implementation
 *
 * Implements a transport for cross-window communication that works reliably
 * in cross-origin scenarios. Unlike PopupWindowTransport which opens a popup,
 * this transport works with existing window references and uses origin-based
 * validation instead of window reference comparison.
 *
 * ## Features
 *
 * - **Cross-Origin Support**: Uses origin validation for security
 * - **Bidirectional Communication**: Works in both opener and popup contexts
 * - **Message Format Flexibility**: Handles wrapped and unwrapped messages
 * - **Connection Handshake**: Proper ready/wallet_ready message exchange
 * - **Resource Management**: Automatic cleanup of event listeners
 *
 * ## Security Considerations
 *
 * - Always validates message origin when not using wildcards
 * - Supports both wrapped (walletmesh_message) and raw JSON-RPC formats
 * - Uses structured data validation for message acceptance
 *
 * ## Usage Example
 *
 * ```typescript
 * // In dApp (opener context)
 * const transport = new CrossWindowTransport({
 *   targetWindow: popupWindow,
 *   targetOrigin: 'https://wallet.example.com',
 *   sendMessageId: 'dapp-to-wallet',
 *   receiveMessageId: 'wallet-to-dapp'
 * }, logger, errorHandler);
 *
 * // In wallet (popup context)
 * const transport = new CrossWindowTransport({
 *   targetWindow: window.opener,
 *   targetOrigin: 'https://dapp.example.com',
 *   sendMessageId: 'wallet-to-dapp',
 *   receiveMessageId: 'dapp-to-wallet'
 * }, logger, errorHandler);
 * ```
 *
 * @internal
 */

import type {
  TransportConfig,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
  TransportMessageEvent,
} from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import { AbstractTransport } from '../AbstractTransport.js';

/**
 * Configuration for CrossWindowTransport
 */
export interface CrossWindowConfig extends TransportConfig {
  /**
   * The target window to communicate with
   * For dApp: the popup window
   * For wallet: window.opener
   */
  targetWindow?: Window | null;

  /**
   * The expected origin of the target window
   * Use '*' for any origin (less secure)
   */
  targetOrigin?: string;

  /**
   * ID to use when SENDING messages
   * This ID is included in outgoing wrapped messages
   */
  sendMessageId: string;

  /**
   * ID to accept when RECEIVING messages
   * Only messages with this ID will be processed
   */
  receiveMessageId: string;

  /**
   * Timeout for connection handshake
   */
  timeout?: number;
}

/**
 * Message wrapper format for cross-window communication
 * Used for wrapping messages sent from dApp to wallet
 */
interface WalletMeshMessage {
  type: 'walletmesh_message';
  origin: string;
  data: unknown;
  id: string;
}

/**
 * Cross-window transport implementation
 *
 * Provides reliable cross-origin communication between windows
 * using postMessage API with origin-based validation.
 */
export class CrossWindowTransport extends AbstractTransport {
  private targetWindow: Window | null = null;
  private targetOrigin: string;
  private sendMessageId: string;
  private receiveMessageId: string;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private isConnecting = false;
  private instanceId: string;
  private isWalletContext = false;

  protected override connected = false;
  protected override config: CrossWindowConfig;

  constructor(config: CrossWindowConfig, logger: Logger, errorHandler: ErrorHandler) {
    super(config, logger, errorHandler);
    this.config = config;

    const typedConfig = config as CrossWindowConfig;
    this.targetWindow = typedConfig.targetWindow || null;

    // Require explicit targetOrigin - no wildcards allowed for security
    if (!typedConfig.targetOrigin) {
      throw ErrorFactory.configurationError(
        'targetOrigin is required for secure cross-window communication',
        {
          transport: 'cross-window',
        },
      );
    }
    this.targetOrigin = typedConfig.targetOrigin;

    // Validate required message IDs
    if (!typedConfig.sendMessageId || !typedConfig.receiveMessageId) {
      throw ErrorFactory.configurationError(
        'sendMessageId and receiveMessageId are required for CrossWindowTransport',
        {
          transport: 'cross-window',
        },
      );
    }

    this.sendMessageId = typedConfig.sendMessageId;
    this.receiveMessageId = typedConfig.receiveMessageId;

    // Add unique instance ID for debugging
    this.instanceId = `${this.sendMessageId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Auto-detect if we're in a popup context (wallet)
    if (!this.targetWindow && typeof window !== 'undefined' && window.opener) {
      this.targetWindow = window.opener;
      this.isWalletContext = true;
      this.log('debug', 'Auto-detected popup context, using window.opener');
    }

    this.log('debug', 'CrossWindowTransport initialized', {
      hasTargetWindow: !!this.targetWindow,
      targetOrigin: this.targetOrigin,
      sendMessageId: this.sendMessageId,
      receiveMessageId: this.receiveMessageId,
      instanceId: this.instanceId,
      ownOrigin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
      isWalletContext: this.isWalletContext,
    });
  }

  /**
   * Internal implementation of connect method
   */
  protected async connectInternal(): Promise<void> {
    if (this.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      const timeoutMs = (this.config as CrossWindowConfig).timeout || 30000;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let readyHandler: ((event: MessageEvent) => void) | null = null;

      const cleanup = () => {
        this.isConnecting = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (readyHandler) {
          window.removeEventListener('message', readyHandler);
          readyHandler = null;
        }
      };

      try {
        if (!this.targetWindow) {
          throw ErrorFactory.configurationError('Target window is required', {
            transport: 'cross-window',
          });
        }

        // Set up message listener first
        this.setupMessageListener();

        // If we're in a wallet context (popup), immediately send ready
        if (this.isWalletContext) {
          this.connected = true;
          this.isConnecting = false;

          // Send wallet_ready to the opener
          this.targetWindow.postMessage({ type: 'wallet_ready' }, this.targetOrigin);
          this.log('debug', 'Sent wallet_ready message to opener');

          this.emit({
            type: 'connected',
          } as TransportConnectedEvent);

          resolve();
          return;
        }

        // For dApp side, wait for wallet_ready message
        timeoutId = setTimeout(() => {
          cleanup();
          reject(
            ErrorFactory.connectionFailed('Connection timeout waiting for wallet', {
              transport: 'cross-window',
              timeout: timeoutMs,
            }),
          );
        }, timeoutMs);

        // Listen for ready message
        readyHandler = (event: MessageEvent) => {
          // Use same validation logic as main message handler
          // Validate origin - must match exactly (no wildcards for security)
          if (event.origin !== this.targetOrigin) {
            return;
          }

          // Also validate window source if we have a target window
          // NOTE: In cross-origin scenarios, this check can be unreliable
          // The origin validation is the primary security mechanism
          if (this.targetWindow && event.source !== this.targetWindow) {
            // Log but don't reject - cross-origin window comparisons are unreliable
            this.log('debug', 'Window source mismatch (may be cross-origin)', {
              hasTargetWindow: true,
              sourceMatchesTarget: false,
              crossOrigin: event.origin !== window.location.origin,
            });
            // Continue processing - origin validation is the primary security check
          }

          let data = event.data;

          // Unwrap if needed
          if (data?.type === 'walletmesh_message') {
            data = data.data;
          }

          // Check for ready message
          if (data?.type === 'wallet_ready' || data?.type === 'ready') {
            this.log(
              'info',
              '🔗 CrossWindowTransport received wallet ready message - setting connected=true',
              {
                instanceId: this.instanceId,
                previousConnected: this.connected,
                targetOrigin: this.targetOrigin,
              },
            );
            cleanup();
            this.connected = true;

            this.emit({
              type: 'connected',
            } as TransportConnectedEvent);

            resolve();
          }
        };

        window.addEventListener('message', readyHandler);
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  /**
   * Set up the message event listener
   */
  private setupMessageListener(): void {
    this.messageHandler = (event: MessageEvent) => {
      // Special handling for wallet_ready handshake messages
      // These are sent directly via postMessage and should be processed regardless of source
      if (event.data?.type === 'wallet_ready' || event.data?.type === 'wallet_ready_ack') {
        // Validate origin for security
        if (event.origin === this.targetOrigin) {
          this.log('debug', `Processing handshake message: ${event.data.type}`, {
            origin: event.origin,
            expectedOrigin: this.targetOrigin,
            messageType: event.data.type,
          });
          // Emit handshake messages to listeners
          this.emit({ type: 'message', data: event.data } as TransportMessageEvent);
        }
        return; // Don't process handshake messages as regular transport messages
      }

      // Validate origin - must match exactly (no wildcards for security)
      if (event.origin !== this.targetOrigin) {
        this.log('debug', 'Ignoring message from unexpected origin', {
          expected: this.targetOrigin,
          received: event.origin,
        });
        return;
      }

      this.log('info', '📨 CrossWindowTransport received message from wallet', {
        instanceId: this.instanceId,
        origin: event.origin,
        targetOrigin: this.targetOrigin,
        sendMessageId: this.sendMessageId,
        receiveMessageId: this.receiveMessageId,
        dataType: typeof event.data,
        isWrapped: !!(event.data?.type === 'walletmesh_message'),
        messageId: event.data?.id,
        fullEventData: event.data,
      });

      let messageData = event.data;

      // Handle wrapped messages
      if (messageData?.type === 'walletmesh_message') {
        // Check message ID if specified - use receiveMessageId for filtering
        if (messageData.id && messageData.id !== this.receiveMessageId) {
          this.log('warn', '🚫 FILTERING OUT message with wrong ID', {
            expected: this.receiveMessageId,
            received: messageData.id,
            instanceId: this.instanceId,
            messageStructure: messageData,
          });
          return;
        }
        messageData = messageData.data;
        this.log('debug', 'Unwrapped walletmesh_message', { data: messageData });
      }

      // Check if it's a valid message to process
      if (messageData?.type === 'wallet_ready' || messageData?.type === 'ready') {
        // Ready messages are handled in connectInternal
        this.log('debug', 'Received ready message (handled by connection logic)');
        return;
      }

      if (
        messageData &&
        typeof messageData === 'object' &&
        messageData.jsonrpc === '2.0' &&
        (messageData.method || messageData.id)
      ) {
        // Valid JSON-RPC message
        this.log('debug', 'Processing JSON-RPC message', {
          method: messageData.method,
          id: messageData.id,
        });
      } else {
        this.log('debug', 'Ignoring non-JSON-RPC message', { data: messageData });
        return;
      }

      // Emit the message
      try {
        this.log('info', '🚀 CrossWindowTransport emitting message event', {
          messageType: typeof messageData,
          hasJsonRpc: !!(messageData as unknown as { jsonrpc?: unknown })?.jsonrpc,
          jsonRpcVersion: (messageData as unknown as { jsonrpc?: unknown })?.jsonrpc,
          method: (messageData as unknown as { method?: unknown })?.method,
          id: (messageData as unknown as { id?: unknown })?.id,
          hasResult: !!(messageData as unknown as { result?: unknown })?.result,
          hasError: !!(messageData as unknown as { error?: unknown })?.error,
          messageStructure: messageData && typeof messageData === 'object' ? Object.keys(messageData) : [],
        });
        this.emit({
          type: 'message',
          data: messageData,
        } as TransportMessageEvent);
      } catch (error) {
        this.emit({
          type: 'error',
          error: ErrorFactory.messageFailed('Failed to process message', {
            transport: 'cross-window',
            originalError: error,
          }),
        } as TransportErrorEvent);
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Internal implementation of disconnect method
   */
  protected async disconnectInternal(): Promise<void> {
    this.log('info', '🔌 CrossWindowTransport.disconnectInternal called - setting connected=false', {
      instanceId: this.instanceId,
      previousConnected: this.connected,
      hasMessageHandler: !!this.messageHandler,
      targetOrigin: this.targetOrigin,
      timestamp: new Date().toISOString(),
    });

    this.connected = false;

    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }

    this.emit({
      type: 'disconnected',
      reason: 'Transport disconnected',
    } as TransportDisconnectedEvent);

    this.log('info', '✅ CrossWindowTransport disconnected successfully', {
      instanceId: this.instanceId,
      connected: this.connected,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Internal implementation of send method
   */
  protected async sendInternal(data: unknown): Promise<void> {
    this.log('info', '🚀 CrossWindowTransport.sendInternal called', {
      instanceId: this.instanceId,
      connected: this.connected,
      hasTargetWindow: !!this.targetWindow,
      targetWindowClosed: this.targetWindow ? (this.targetWindow as Window).closed : null,
      targetOrigin: this.targetOrigin,
      sendMessageId: this.sendMessageId,
      receiveMessageId: this.receiveMessageId,
      dataType: typeof data,
      timestamp: new Date().toISOString(),
    });

    if (!this.connected) {
      this.log('error', '❌ CrossWindowTransport.sendInternal failed: Not connected', {
        instanceId: this.instanceId,
        connected: this.connected,
        hasTargetWindow: !!this.targetWindow,
        targetWindowClosed: this.targetWindow ? (this.targetWindow as Window).closed : null,
        connectionState: {
          connected: this.connected,
          isConnecting: this.isConnecting,
          isWalletContext: this.isWalletContext,
        },
      });
      throw ErrorFactory.transportError('Not connected', 'cross-window');
    }

    if (!this.targetWindow || (this.targetWindow as Window).closed) {
      this.log('error', '❌ CrossWindowTransport.sendInternal failed: Target window closed', {
        instanceId: this.instanceId,
        hasTargetWindow: !!this.targetWindow,
        targetWindowClosed: this.targetWindow ? (this.targetWindow as Window).closed : null,
        targetOrigin: this.targetOrigin,
        windowState: this.targetWindow ? 'exists' : 'null',
      });
      throw ErrorFactory.transportDisconnected('Target window closed', 'cross-window');
    }

    try {
      // Check if this is a wallet_ready_ack message - send it directly without wrapping
      if (
        data &&
        typeof data === 'object' &&
        (data as unknown as { type?: string }).type === 'wallet_ready_ack'
      ) {
        this.log('info', '📤 CrossWindowTransport sending wallet_ready_ack directly', {
          instanceId: this.instanceId,
          targetOrigin: this.targetOrigin,
          data: data,
          timestamp: new Date().toISOString(),
        });
        this.targetWindow.postMessage(data, this.targetOrigin);
      } else {
        // Wrap normal messages with sendMessageId for proper routing
        const wrappedMessage: WalletMeshMessage = {
          type: 'walletmesh_message',
          origin: window.location.origin,
          data: data,
          id: this.sendMessageId,
        };

        this.log('info', '📤 CrossWindowTransport sending wrapped message', {
          instanceId: this.instanceId,
          targetOrigin: this.targetOrigin,
          currentOrigin: window.location.origin,
          sendMessageId: this.sendMessageId,
          receiveMessageId: this.receiveMessageId,
          dataType: typeof data,
          messageStructure: Object.keys(wrappedMessage),
          hasData: !!data,
          timestamp: new Date().toISOString(),
        });

        this.targetWindow.postMessage(wrappedMessage, this.targetOrigin);
      }

      this.log('info', '✅ CrossWindowTransport message sent successfully', {
        instanceId: this.instanceId,
        targetOrigin: this.targetOrigin,
        sendMessageId: this.sendMessageId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.log('error', '❌ CrossWindowTransport.sendInternal failed during postMessage', {
        instanceId: this.instanceId,
        targetOrigin: this.targetOrigin,
        sendMessageId: this.sendMessageId,
        error: error instanceof Error ? error.message : error,
        errorType: typeof error,
        targetWindowState: this.targetWindow ? 'exists' : 'null',
        connected: this.connected,
        timestamp: new Date().toISOString(),
      });
      throw ErrorFactory.messageFailed('Failed to send message', {
        transport: 'cross-window',
        originalError: error,
      });
    }
  }

  /**
   * Destroy the transport and clean up resources
   */
  override async destroy(): Promise<void> {
    await this.disconnect();
    this.targetWindow = null;
    super.destroy();
  }
}
