import type { Transport, TransportOptions } from './types.js';
import { messageValidation, errorMessages } from '../utils/validation.js';

/**
 * Structure for messages exchanged via postMessage.
 *
 * @property type - Message type identifier ('wallet_request' or 'wallet_response')
 * @property data - The actual message payload
 * @property origin - Optional source origin for security validation
 *
 * @internal
 */
interface PostMessageData {
  type: string;
  data: unknown;
  origin?: string;
}

/**
 * Transport implementation using Window.postMessage for communication.
 *
 * Provides secure cross-origin communication between the dApp and wallet
 * using the browser's postMessage mechanism. Includes origin validation
 * and message format verification.
 *
 * @implements {Transport}
 *
 * @example
 * ```typescript
 * const transport = new PostMessageTransport({
 *   origin: 'https://wallet.example.com'
 * });
 *
 * await transport.connect();
 * transport.onMessage((data) => {
 *   console.log('Received wallet message:', data);
 * });
 *
 * await transport.send({
 *   method: 'eth_requestAccounts',
 *   params: []
 * });
 * ```
 *
 * @remarks
 * Security considerations:
 * - Always validate message origins
 * - Verify message format and content
 * - Only process messages from trusted sources
 * - Use structured message types
 */
export class PostMessageTransport implements Transport {
  private messageHandler: ((data: unknown) => void) | null = null;
  private cleanup: (() => void) | null = null;
  private connected = false;
  private readonly options: TransportOptions;

  /**
   * Creates a new PostMessageTransport instance.
   *
   * @param options - Configuration options
   * @param options.origin - Allowed origin for messages (recommended for security)
   *
   * @remarks
   * If no origin is specified, messages will be accepted from any origin ('*').
   * For security, it's recommended to always specify an allowed origin.
   */
  constructor(options: TransportOptions = {}) {
    this.options = options;
  }

  /**
   * Sets up the postMessage event listener.
   *
   * @returns Promise that resolves when listener is established
   *
   * @remarks
   * Connection process:
   * 1. Checks if already connected
   * 2. Sets up message event listener
   * 3. Configures cleanup handler
   * 4. Marks transport as connected
   *
   * Message validation includes:
   * - Origin checking against allowed origin
   * - Source window validation
   * - Message type verification
   * - Payload format validation
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const receiveResponse = (event: MessageEvent) => {
      console.log('[PostMessageTransport] Received message:', event);

      // Validate origin if specified
      if (!messageValidation.isValidOrigin(event.origin, this.options.origin)) {
        console.warn(
          '[PostMessageTransport] Invalid origin:',
          event.origin,
          'expected:',
          this.options.origin,
        );
        return;
      }

      // Only handle messages from the same window
      if (event.source !== window) {
        console.warn('[PostMessageTransport] Invalid source:', event.source);
        return;
      }

      const message = event.data as PostMessageData;
      console.log('[PostMessageTransport] Message:', message);

      // Only handle wallet response messages
      if (message?.type !== 'wallet_response') {
        console.warn('[PostMessageTransport] Invalid message type:', message?.type);
        return;
      }

      // Validate message format
      if (!messageValidation.isValidMessage(message.data)) {
        console.warn('[PostMessageTransport] Invalid message format:', message.data);
        return;
      }

      // Pass message to handler
      if (this.messageHandler) {
        console.log('[PostMessageTransport] Handling message:', message.data);
        this.messageHandler(message.data);
      } else {
        console.warn('[PostMessageTransport] No message handler registered');
      }
    };

    window.addEventListener('message', receiveResponse);
    this.cleanup = () => window.removeEventListener('message', receiveResponse);
    this.connected = true;
  }

  /**
   * Removes event listeners and resets state.
   *
   * @returns Promise that resolves when cleanup is complete
   *
   * @remarks
   * Cleanup tasks:
   * - Removes message event listener
   * - Resets connection state
   * - Clears message handler
   * - Removes cleanup function
   */
  async disconnect(): Promise<void> {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.connected = false;
    this.messageHandler = null;
  }

  /**
   * Sends a message to the wallet window.
   *
   * @param data - Message payload to send
   * @returns Promise that resolves when message is sent
   * @throws {Error} If not connected or message format is invalid
   *
   * @remarks
   * Sending process:
   * 1. Validates connection state
   * 2. Verifies message format
   * 3. Wraps payload in wallet request format
   * 4. Posts message to target origin
   *
   * @example
   * ```typescript
   * await transport.send({
   *   id: '1',
   *   method: 'eth_accounts',
   *   params: []
   * });
   * ```
   */
  async send(data: unknown): Promise<void> {
    if (!this.connected) {
      throw new Error(errorMessages.notConnected);
    }

    if (!messageValidation.isValidMessage(data)) {
      throw new Error(errorMessages.invalidMessage);
    }

    const message: PostMessageData = {
      type: 'wallet_request',
      data,
      origin: window.location.origin,
    };

    console.log('[PostMessageTransport] Sending message:', message, 'to:', this.options.origin || '*');
    window.postMessage(message, this.options.origin || '*');
  }

  /**
   * Registers a callback for incoming messages.
   *
   * @param handler - Function to process received messages
   *
   * @remarks
   * Only one handler can be registered at a time.
   * New handler replaces any existing handler.
   * Set to null to stop receiving messages.
   *
   * @example
   * ```typescript
   * transport.onMessage((data) => {
   *   if (isWalletResponse(data)) {
   *     handleWalletResponse(data);
   *   }
   * });
   * ```
   */
  onMessage(handler: (data: unknown) => void): void {
    this.messageHandler = handler;
  }

  /**
   * Reports the current connection state.
   *
   * @returns True if event listener is set up, false otherwise
   *
   * @remarks
   * Connection state indicates if the transport is ready
   * to send and receive messages. Does not guarantee the
   * wallet window is actually available or responsive.
   */
  isConnected(): boolean {
    return this.connected;
  }
}
