import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { WalletConnection } from '../../../api/types/connection.js';
import type { WalletProvider } from '../../../api/types/providers.js';
import {
  ChainType,
  type Transport,
  type TransportEvent,
  type TransportMessageEvent,
} from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { getChainName } from '../../../utils/chainNameResolver.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';
import type {
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';

/**
 * Supported Aztec networks
 * These are the officially supported network identifiers
 *
 * @public
 */
export const SUPPORTED_AZTEC_NETWORKS = {
  MAINNET: 'aztec:mainnet',
  TESTNET: 'aztec:testnet',
  SANDBOX: 'aztec:31337',
} as const;

/**
 * Type representing a supported Aztec network identifier
 *
 * @public
 */
export type AztecNetwork = (typeof SUPPORTED_AZTEC_NETWORKS)[keyof typeof SUPPORTED_AZTEC_NETWORKS];

/**
 * Configuration for Aztec wallet adapter
 */
export interface AztecAdapterConfig {
  /** Custom adapter ID */
  id?: string;
  /** Wallet display name */
  name?: string;
  /** Wallet icon (data URI or URL) */
  icon?: string;
  /** Wallet description */
  description?: string;
  /** Pre-configured transport for the wallet */
  transport?: Transport;
  /**
   * Network to connect to (REQUIRED for security)
   *
   * For security reasons, no default network is provided. You must explicitly
   * configure the network to prevent accidental connections to the wrong network.
   *
   * Supported values:
   * - 'aztec:mainnet' - Aztec Mainnet (production)
   * - 'aztec:testnet' - Aztec Testnet (testing)
   * - 'aztec:31337' - Aztec Sandbox (local development)
   *
   * @example
   * ```typescript
   * // ✅ Correct - explicit network
   * new AztecAdapter({ network: 'aztec:testnet' })
   *
   * // ❌ Wrong - will throw error requiring explicit configuration
   * new AztecAdapter({})
   * ```
   */
  network?: string;
}

/**
 * Default Aztec permissions for typical dApp operations
 *
 * These permissions cover common use cases:
 * - Reading wallet state (address, chain ID, node info)
 * - Signing messages and transactions
 * - Sending transactions
 * - Managing authentication witnesses
 *
 * Applications requiring additional permissions should explicitly
 * request them via ConnectOptions aztecOptions.permissions.
 *
 * @public
 */
export const DEFAULT_AZTEC_PERMISSIONS = [
  // Read Operations
  'aztec_getAddress', // Get wallet address (required)
  'aztec_getChainId', // Get current chain ID
  'aztec_getNodeInfo', // Get node information

  // Signing Operations
  'aztec_signMessage', // Sign arbitrary messages

  // Transaction Operations
  'aztec_sendTransaction', // Send transactions
  'aztec_addAuthWitness', // Add authentication witnesses
] as const;

/**
 * Minimal permissions for read-only operations
 * Use this set when you only need to read wallet state
 *
 * @public
 */
export const MINIMAL_AZTEC_PERMISSIONS = ['aztec_getAddress', 'aztec_getChainId'] as const;

/**
 * Extended permissions for advanced dApp features
 * Includes contract deployment and advanced operations
 *
 * @public
 */
export const EXTENDED_AZTEC_PERMISSIONS = [
  ...DEFAULT_AZTEC_PERMISSIONS,
  'aztec_deployContract', // Deploy new contracts
  'aztec_callContract', // Call contract methods
  'aztec_registerAccount', // Register new accounts
] as const;

/**
 * Aztec address format validation patterns
 *
 * Aztec addresses can use different formats:
 * - Bech32-style: aztec1... (followed by base32 encoded data)
 * - Hex format: 0x... (64 hex characters, 32-byte address)
 *
 * Note: These patterns may need to be updated as Aztec address
 * standards evolve.
 *
 * @internal
 */
const AZTEC_ADDRESS_PATTERN = /^aztec1[a-z0-9]{38,}$/i;
const AZTEC_HEX_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{64}$/;

/**
 * Generic Aztec wallet adapter
 *
 * Provides integration with Aztec-compatible wallets using the AztecRouterProvider
 * from @walletmesh/aztec-rpc-wallet. This adapter acts as a thin wrapper that
 * bridges modal-core's adapter pattern with Aztec-specific wallet functionality.
 *
 * The adapter dynamically imports AztecRouterProvider to avoid requiring Aztec
 * dependencies when not needed, maintaining modal-core's chain-agnostic nature.
 *
 * ## Default Permissions
 *
 * By default, the adapter requests the following permissions:
 * - `aztec_getAddress` - Read wallet address
 * - `aztec_getChainId` - Read current chain
 * - `aztec_getNodeInfo` - Read node information
 * - `aztec_signMessage` - Sign messages
 * - `aztec_sendTransaction` - Send transactions
 * - `aztec_addAuthWitness` - Manage auth witnesses
 *
 * ## Custom Permissions
 *
 * To request different permissions, use the aztecOptions parameter:
 *
 * @example
 * ```typescript
 * // Basic usage with default permissions
 * const adapter = new AztecAdapter({
 *   transport: myTransport,
 *   network: 'aztec:testnet'
 * });
 * const connection = await adapter.connect();
 * // Can now: read address, sign messages, send transactions
 *
 * // Minimal permissions (read-only)
 * await adapter.connect({
 *   aztecOptions: {
 *     permissions: MINIMAL_AZTEC_PERMISSIONS
 *   }
 * });
 *
 * // Extended permissions (including deployment)
 * await adapter.connect({
 *   aztecOptions: {
 *     permissions: EXTENDED_AZTEC_PERMISSIONS
 *   }
 * });
 * ```
 *
 * @public
 */
export class AztecAdapter extends AbstractWalletAdapter {
  /**
   * Get wallet information without instantiating the adapter
   * Useful for wallet discovery and listing
   *
   * @returns Wallet metadata and capabilities
   * @public
   */
  static getWalletInfo(): {
    id: string;
    name: string;
    icon: string;
    description: string;
    homepage: string;
    chains: ChainType[];
    features: WalletFeature[];
  } {
    return {
      id: 'aztec-wallet',
      name: 'Aztec Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDAwMDAwIi8+CiAgPHBhdGggZD0iTTE2IDZMMjQgMjZIOEwxNiA2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=',
      description: 'Connect with Aztec privacy-preserving network',
      homepage: 'https://aztec.network',
      chains: [ChainType.Aztec],
      features: ['sign_message', 'encrypt', 'decrypt', 'multi_account'],
    };
  }

  /**
   * Unique identifier for the Aztec adapter
   */
  readonly id: string;

  /**
   * Metadata describing the Aztec wallet
   */
  readonly metadata: WalletAdapterMetadata;

  /**
   * Capabilities of the Aztec wallet adapter
   */
  readonly capabilities: WalletCapabilities = {
    chains: [
      { type: ChainType.Aztec, chainIds: '*' }, // Supports all Aztec networks
    ],
    features: new Set<WalletFeature>(['sign_message', 'encrypt', 'decrypt', 'multi_account']),
  };

  /**
   * Configuration for the adapter
   */
  private config: AztecAdapterConfig;

  /**
   * Cached AztecRouterProvider instance
   */
  private aztecProvider?: unknown;

  /**
   * Cleanup function for JSON-RPC transport subscriptions
   */
  private jsonrpcUnsubscribe: (() => void) | null = null;

  /**
   * Current session ID for connection reuse
   */
  private sessionId: string | null = null;

  constructor(config?: AztecAdapterConfig) {
    super();

    // Set ID from config or use default
    this.id = config?.id || 'aztec-wallet';

    // Set metadata from config or use defaults
    this.metadata = {
      name: config?.name || 'Aztec Wallet',
      icon:
        config?.icon ||
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDAwMDAwIi8+CiAgPHBhdGggZD0iTTE2IDZMMjQgMjZIOEwxNiA2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=',
      description: config?.description || 'Connect with Aztec privacy-preserving network',
      homepage: 'https://aztec.network',
    };

    this.config = config || {};

    // Set transport if provided
    if (config?.transport) {
      this.transport = config.transport;
    }
  }

  /**
   * Detect if Aztec wallet is available
   */
  async detect(): Promise<DetectionResult> {
    try {
      // For Aztec wallets, detection depends on transport availability
      const isAvailable = !!this.transport || !!this.config.transport;

      return {
        isInstalled: isAvailable,
        isReady: isAvailable,
        metadata: {
          type: 'aztec',
          transport: this.transport || this.config.transport,
        },
      };
    } catch (error) {
      this.log('error', 'Unexpected error during Aztec wallet detection', error);
      return {
        isInstalled: false,
        isReady: false,
        metadata: {
          type: 'aztec',
          error: error instanceof Error ? error.message : 'Unexpected detection error',
        },
      };
    }
  }

  /**
   * Categorize an error based on its characteristics for better error handling
   *
   * @param error - Error to categorize
   * @returns Error category information with retry and user messaging guidance
   * @private
   */
  private categorizeConnectionError(error: unknown): {
    category: 'configuration' | 'transport' | 'provider' | 'network' | 'unknown';
    shouldRetry: boolean;
    userMessage: string;
  } {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorLower = errorMessage.toLowerCase();

    // Configuration errors (don't retry - need code/config changes)
    if (
      errorLower.includes('transport required') ||
      errorLower.includes('network must be') ||
      errorLower.includes('configuration') ||
      (errorLower.includes('not found') && errorLower.includes('aztec-rpc-wallet'))
    ) {
      return {
        category: 'configuration',
        shouldRetry: false,
        userMessage: 'Wallet configuration is incorrect. Please check your setup.',
      };
    }

    // Transport errors (can retry - network issues)
    if (
      errorLower.includes('timeout') ||
      errorLower.includes('transport') ||
      (errorLower.includes('connection') && errorLower.includes('failed'))
    ) {
      return {
        category: 'transport',
        shouldRetry: true,
        userMessage: 'Connection to wallet failed. Please check your network and try again.',
      };
    }

    // Provider/Wallet errors (don't retry immediately - user action needed)
    if (
      errorLower.includes('rejected') ||
      errorLower.includes('denied') ||
      errorLower.includes('cancelled') ||
      errorLower.includes('permission')
    ) {
      return {
        category: 'provider',
        shouldRetry: false,
        userMessage: 'Wallet rejected the connection request.',
      };
    }

    // Network errors (can retry - Aztec network issues)
    if (errorLower.includes('network') || errorLower.includes('node') || errorLower.includes('rpc')) {
      return {
        category: 'network',
        shouldRetry: true,
        userMessage: 'Aztec network is unreachable. Please try again later.',
      };
    }

    // Unknown error
    return {
      category: 'unknown',
      shouldRetry: false,
      userMessage: 'An unexpected error occurred while connecting to the wallet.',
    };
  }

  /**
   * Connect to the Aztec wallet
   */
  async connect(_options?: ConnectOptions): Promise<WalletConnection> {
    try {
      // Ensure we have a transport
      if (!this.transport && !this.config.transport) {
        throw ErrorFactory.configurationError('Transport required for Aztec adapter', {
          adapterId: this.id,
        });
      }

      const transport = this.transport || this.config.transport;

      // Check if we have an existing connected provider that can be reused
      if (this.aztecProvider && this.sessionId && this.state.isConnected) {
        this.log('info', '🔄 Checking existing provider connection', {
          hasProvider: true,
          sessionId: this.sessionId,
        });

        try {
          // Verify connection is still active by making a test call
          const provider = this.aztecProvider as {
            call: <M extends string>(
              chainId: string,
              call: { method: M; params?: unknown[] },
            ) => Promise<unknown>;
          };

          // Determine network for the test call
          const network = this.normalizeNetworkId(_options);

          // Try to get the address to verify connection is still alive
          const addressResponse = await provider.call(network, {
            method: 'aztec_getAddress',
          });

          const address = this.normalizeAddress(addressResponse);
          const accounts = [address];

          this.log('info', '✅ Existing provider is still connected, reusing it', {
            sessionId: this.sessionId,
            network,
          });

          // Return connection with existing provider
          return {
            walletId: this.id,
            address,
            accounts,
            chain: {
              chainId: network,
              chainType: ChainType.Aztec,
              name: getChainName(network),
              required: false,
            },
            chainType: ChainType.Aztec,
            provider: this.aztecProvider as WalletProvider,
            walletInfo: {
              id: this.id,
              name: this.metadata.name,
              icon: this.metadata.icon,
              chains: [ChainType.Aztec],
            },
            sessionId: this.sessionId,
          };
        } catch (error) {
          this.log('warn', 'Existing provider is no longer connected, will create new connection', {
            error,
            sessionId: this.sessionId,
          });

          // Provider is no longer valid, clear it and continue with new connection
          this.aztecProvider = undefined;
          this.sessionId = null;
          this.providers.delete(ChainType.Aztec);

          // Clean up JSON-RPC subscription
          this.cleanupJsonRpcSubscription();
        }
      }

      // Dynamically import AztecRouterProvider to avoid hard dependency
      this.log('debug', 'Dynamically importing AztecRouterProvider');
      let AztecRouterProvider: new (
        transport: JSONRPCTransport,
        context?: Record<string, unknown>,
        sessionId?: string,
      ) => unknown;
      try {
        const aztecModule = await import('@walletmesh/aztec-rpc-wallet');
        AztecRouterProvider = aztecModule.AztecRouterProvider;
        this.log('debug', 'AztecRouterProvider loaded successfully');
      } catch (error) {
        this.log('error', 'Failed to load AztecRouterProvider module', error);
        throw ErrorFactory.configurationError(
          'Failed to load @walletmesh/aztec-rpc-wallet. Please install it to use Aztec wallets: npm install @walletmesh/aztec-rpc-wallet',
          { adapterId: this.id, originalError: error },
        );
      }

      this.log('debug', 'Creating JSON-RPC transport bridge');
      const jsonRpcTransport = this.ensureJSONRPCTransport(transport);

      // Create AztecRouterProvider instance
      this.log('info', 'Creating AztecRouterProvider instance');
      this.aztecProvider = new AztecRouterProvider(jsonRpcTransport);

      // Determine network to connect to
      this.log('debug', 'Resolving Aztec network from configuration');
      const network = this.normalizeNetworkId(_options);
      this.log('info', 'Aztec wallet configuration', {
        network,
        adapterId: this.id,
      });

      // Request permissions for Aztec operations (minimal set for connection)
      this.log('debug', 'Resolving requested permissions');
      const permissions = this.resolveRequestedPermissions(_options);
      this.log('info', 'Requesting Aztec wallet permissions', {
        network,
        permissionCount: permissions.length,
        permissions: permissions.slice(0, 5), // Log first 5 for brevity
      });

      // Establish session with the wallet router
      const provider = this.aztecProvider as {
        connect: (config: Record<string, string[]>) => Promise<{ sessionId: string }>;
        call: <M extends string>(
          chainId: string,
          call: { method: M; params?: unknown[] },
        ) => Promise<unknown>;
        disconnect?: () => Promise<void>;
      };

      // Stage 1: Connect to provider (categorize connection errors)
      this.log('info', 'Connecting to Aztec provider', {
        network,
        permissionCount: permissions.length,
      });
      let sessionId: string;
      try {
        const result = await provider.connect({
          [network]: permissions,
        });
        sessionId = result.sessionId;
        this.sessionId = sessionId; // Store for reuse
        this.log('info', 'Successfully connected to Aztec provider', {
          sessionId,
          network,
        });
      } catch (error) {
        const errorInfo = this.categorizeConnectionError(error);
        this.log('error', 'Provider connection failed', {
          category: errorInfo.category,
          shouldRetry: errorInfo.shouldRetry,
          userMessage: errorInfo.userMessage,
          originalError: error,
        });

        // Throw appropriate error type based on category
        // Configuration errors are fatal and should fail immediately
        if (errorInfo.category === 'configuration') {
          throw ErrorFactory.configurationError(errorInfo.userMessage, {
            originalError: error,
            adapterId: this.id,
            category: errorInfo.category,
          });
        }

        // All other errors during connection should be connectionFailed
        // with the categorized message for better UX
        throw ErrorFactory.connectionFailed(errorInfo.userMessage, {
          originalError: error,
          adapterId: this.id,
          shouldRetry: errorInfo.shouldRetry,
          category: errorInfo.category,
        });
      }

      // Stage 2: Retrieve wallet address (categorize RPC errors)
      this.log('info', 'Retrieving wallet address', { network });
      let addressResponse: unknown;
      try {
        addressResponse = await provider.call(network, {
          method: 'aztec_getAddress',
        });
        this.log('debug', 'Address response received', {
          hasResponse: !!addressResponse,
          responseType: typeof addressResponse,
        });
      } catch (error) {
        const errorInfo = this.categorizeConnectionError(error);
        this.log('error', 'Failed to retrieve wallet address', {
          category: errorInfo.category,
          shouldRetry: errorInfo.shouldRetry,
          userMessage: errorInfo.userMessage,
          originalError: error,
        });

        // Configuration errors are fatal
        if (errorInfo.category === 'configuration') {
          throw ErrorFactory.configurationError(errorInfo.userMessage, {
            originalError: error,
            adapterId: this.id,
            category: errorInfo.category,
          });
        }

        // All other errors treated as connection failures with categorization
        throw ErrorFactory.connectionFailed(errorInfo.userMessage, {
          originalError: error,
          adapterId: this.id,
          shouldRetry: errorInfo.shouldRetry,
          category: errorInfo.category,
        });
      }

      const address = this.normalizeAddress(addressResponse);
      const accounts = [address];

      // Store the provider reference for future calls
      this.providers.set(ChainType.Aztec, this.aztecProvider as WalletProvider);

      // Set up provider event listeners
      this.setupProviderListeners(this.aztecProvider);

      // Use base class method to create connection and manage state
      this.log('info', 'Creating wallet connection object', {
        network,
        sessionId,
        hasAddress: !!address,
        accountCount: accounts.length,
      });
      const walletConnection = await this.createConnection({
        address,
        accounts,
        chainId: network,
        chainType: ChainType.Aztec,
        provider: this.aztecProvider as WalletProvider,
        chainName: getChainName(network),
        chainRequired: false,
        sessionId,
      });

      this.log('info', '✅ Aztec wallet connection established successfully', {
        walletId: this.id,
        network,
        sessionId,
        address: `${address.substring(0, 10)}...`,
      });

      return walletConnection;
    } catch (error) {
      // Enhanced error recovery: clean up all partial state
      this.log('debug', 'Performing error recovery cleanup');

      // Clean up JSON-RPC subscriptions to prevent memory leaks
      this.cleanupJsonRpcSubscription();

      // Clean up partial state to prevent stale references
      try {
        // Clear provider reference
        if (this.aztecProvider) {
          this.log('debug', 'Clearing aztecProvider reference after connection error');
          this.aztecProvider = undefined;
        }

        // Clear session ID
        if (this.sessionId) {
          this.log('debug', 'Clearing sessionId after connection error');
          this.sessionId = null;
        }

        // Clear providers map
        if (this.providers.has(ChainType.Aztec)) {
          this.log('debug', 'Removing Aztec provider from providers map after connection error');
          this.providers.delete(ChainType.Aztec);
        }

        // Note: We don't clear the transport as it may be reused on retry
        // The transport cleanup is handled by the caller if needed
      } catch (cleanupError) {
        // Log cleanup errors but don't throw - preserve the original error
        this.log('warn', 'Error during connection failure cleanup', {
          cleanupError,
          originalError: error,
        });
      }

      // This catch is for errors from ensureJSONRPCTransport, normalizeNetworkId, normalizeAddress, etc.
      // These are already properly typed errors, so just re-throw them
      // Check if it's already a ModalError by checking the name property
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ModalError') {
        // This is already a properly categorized ModalError, re-throw it
        throw error;
      }

      // For any other unexpected errors, categorize them
      const errorInfo = this.categorizeConnectionError(error);
      this.log('error', 'Unexpected error during connection', {
        category: errorInfo.category,
        shouldRetry: errorInfo.shouldRetry,
        userMessage: errorInfo.userMessage,
        originalError: error,
      });

      throw ErrorFactory.connectionFailed(errorInfo.userMessage, {
        originalError: error,
        adapterId: this.id,
        shouldRetry: errorInfo.shouldRetry,
        category: errorInfo.category,
      });
    }
  }

  /**
   * Type guard to validate JSONRPCTransport interface
   * Checks both presence and signatures of required methods
   *
   * @param transport - Object to validate
   * @returns true if transport implements JSONRPCTransport correctly
   * @private
   */
  private isValidJSONRPCTransport(transport: unknown): transport is JSONRPCTransport {
    if (!transport || typeof transport !== 'object') {
      return false;
    }

    const candidate = transport as Partial<JSONRPCTransport>;

    // Check send method
    if (typeof candidate.send !== 'function') {
      this.log('debug', 'Transport missing send method', { transport });
      return false;
    }

    // Validate send signature by checking parameter count
    // send should accept at least 1 parameter (message)
    try {
      const sendParamCount = candidate.send.length;
      if (sendParamCount < 1) {
        this.log('debug', 'Transport send method has wrong signature (expects at least 1 parameter)', {
          paramCount: sendParamCount,
        });
        return false;
      }
    } catch {
      // If we can't check parameter count, assume it's okay
    }

    // Check onMessage method
    if (typeof candidate.onMessage !== 'function') {
      this.log('debug', 'Transport missing onMessage method', { transport });
      return false;
    }

    // Validate onMessage signature
    // onMessage should accept exactly 1 parameter (callback function)
    try {
      const onMessageParams = candidate.onMessage.length;
      if (onMessageParams !== 1) {
        this.log('debug', 'Transport onMessage method has wrong signature (expects 1 parameter)', {
          paramCount: onMessageParams,
        });
        return false;
      }
    } catch {
      // If we can't check parameter count, assume it's okay
    }

    return true;
  }

  /**
   * Clean up JSON-RPC subscription
   * @private
   */
  private cleanupJsonRpcSubscription(): void {
    if (this.jsonrpcUnsubscribe) {
      try {
        this.jsonrpcUnsubscribe();
      } catch (error) {
        this.log('warn', 'Failed to cleanup JSON-RPC subscription', error);
      }
      this.jsonrpcUnsubscribe = null;
    }
  }

  private ensureJSONRPCTransport(transport: Transport | undefined): JSONRPCTransport {
    if (!transport) {
      throw ErrorFactory.configurationError('Transport required for Aztec adapter', {
        adapterId: this.id,
      });
    }

    // Validate if transport already implements JSONRPCTransport
    if (this.isValidJSONRPCTransport(transport)) {
      this.log('debug', 'Transport already implements JSONRPCTransport interface');
      return transport;
    }

    this.log('debug', 'Bridging Transport to JSONRPCTransport interface');

    // Bridge Transport events to JSON-RPC expectations
    return {
      send: async (message: unknown) => {
        try {
          // Inject sessionId into wm_call messages if we have one
          const processedMessage = this.injectSessionIdIfNeeded(message);
          await transport.send(processedMessage);
        } catch (error) {
          this.log('error', 'Failed to send message through transport', error);
          throw error;
        }
      },
      onMessage: (callback: (message: unknown) => void) => {
        // Validate callback
        if (typeof callback !== 'function') {
          throw ErrorFactory.configurationError('onMessage callback must be a function', {
            adapterId: this.id,
            callbackType: typeof callback,
          });
        }

        // Clean up existing subscription before creating a new one
        this.cleanupJsonRpcSubscription();

        // Create new subscription
        try {
          this.jsonrpcUnsubscribe = transport.on('message', (event: TransportEvent) => {
            const messageEvent = event as TransportMessageEvent;
            const message = messageEvent.data;

            // Filter and validate JSON-RPC messages
            if (!this.isValidJsonRpcMessage(message)) {
              this.log('warn', 'Received non-JSON-RPC message, filtering out', {
                messageType: typeof message,
                hasJsonrpc: message && typeof message === 'object' && 'jsonrpc' in message,
              });
              return; // Ignore non-JSON-RPC messages
            }

            // Extract sessionId from wm_connect response if available
            this.extractSessionIdFromMessage(message);

            // Handle wallet_ready message if present
            if (this.isWalletReadyMessage(message)) {
              this.log('debug', 'Received wallet_ready message');
              // Send acknowledgment for wallet_ready
              this.sendWalletReadyAck(message, transport);
            }

            // Pass validated message to callback
            callback(message);
          });
        } catch (error) {
          this.log('error', 'Failed to subscribe to transport messages', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw ErrorFactory.transportError(
            `Failed to subscribe to transport messages: ${errorMessage}`,
            'jsonrpc-bridge',
          );
        }

        // Return cleanup function for this specific subscription
        return () => this.cleanupJsonRpcSubscription();
      },
    };
  }

  /**
   * Inject sessionId into wm_call messages if we have a sessionId
   * @private
   */
  private injectSessionIdIfNeeded(message: unknown): unknown {
    // Only process if we have a sessionId
    if (!this.sessionId) {
      return message;
    }

    // Only process if message is an object
    if (!message || typeof message !== 'object') {
      return message;
    }

    const msg = message as Record<string, unknown>;

    // Only process wm_call messages
    if (msg['method'] !== 'wm_call') {
      return message;
    }

    // If params is undefined, no injection needed - return original
    if (!('params' in msg)) {
      return message;
    }

    // Clone the message to avoid mutating the original
    const clonedMsg = { ...msg };

    // Inject sessionId into params
    if (Array.isArray(clonedMsg['params'])) {
      // If params is an array, inject as first element (if not already present)
      const params = clonedMsg['params'] as unknown[];
      if (params.length > 0 && typeof params[0] === 'object' && params[0] !== null) {
        const firstParam = params[0] as Record<string, unknown>;
        if (!('sessionId' in firstParam)) {
          params[0] = { ...firstParam, sessionId: this.sessionId };
          this.log('debug', 'Injected sessionId into wm_call params (array format)', {
            sessionId: this.sessionId,
          });
        }
      }
    } else if (clonedMsg['params'] && typeof clonedMsg['params'] === 'object') {
      // If params is an object, inject as property
      const params = clonedMsg['params'] as Record<string, unknown>;
      if (!('sessionId' in params)) {
        clonedMsg['params'] = { ...params, sessionId: this.sessionId };
        this.log('debug', 'Injected sessionId into wm_call params (object format)', {
          sessionId: this.sessionId,
        });
      }
    }

    return clonedMsg;
  }

  /**
   * Validate if a message is a valid JSON-RPC message
   * @private
   */
  private isValidJsonRpcMessage(message: unknown): boolean {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const msg = message as Record<string, unknown>;

    // Must have jsonrpc: "2.0"
    if (msg['jsonrpc'] !== '2.0') {
      return false;
    }

    // Must have either method (request/notification) or id with result/error (response)
    const hasMethod = 'method' in msg;
    const hasId = 'id' in msg;
    const hasResult = 'result' in msg;
    const hasError = 'error' in msg;

    // Valid request/notification: has method
    // Valid response: has id and (result or error)
    return hasMethod || (hasId && (hasResult || hasError));
  }

  /**
   * Extract session ID from wm_connect response messages
   * @private
   */
  private extractSessionIdFromMessage(message: unknown): void {
    if (!message || typeof message !== 'object') {
      return;
    }

    const msg = message as Record<string, unknown>;

    // Check for sessionId at top level
    if ('sessionId' in msg && typeof msg['sessionId'] === 'string') {
      this.sessionId = msg['sessionId'];
      this.log('debug', 'Extracted sessionId from message top level', {
        sessionId: this.sessionId,
      });
      return;
    }

    // Check if this is a wm_connect response with result
    if ('result' in msg && msg['result'] && typeof msg['result'] === 'object') {
      const result = msg['result'] as Record<string, unknown>;
      if ('sessionId' in result && typeof result['sessionId'] === 'string') {
        this.sessionId = result['sessionId'];
        this.log('debug', 'Extracted sessionId from wm_connect response', {
          sessionId: this.sessionId,
        });
      }
    }
  }

  /**
   * Check if a message is a wallet_ready message
   * @private
   */
  private isWalletReadyMessage(message: unknown): boolean {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const msg = message as Record<string, unknown>;
    return msg['method'] === 'wallet_ready';
  }

  /**
   * Send acknowledgment for wallet_ready message
   * @private
   */
  private sendWalletReadyAck(message: unknown, transport: Transport): void {
    if (!message || typeof message !== 'object') {
      return;
    }

    const msg = message as Record<string, unknown>;
    const messageId = msg['id'];

    // Only send ack if the message has an id (indicating it expects a response)
    if (messageId) {
      const ackMessage = {
        jsonrpc: '2.0',
        id: messageId,
        result: {
          status: 'ready',
          acknowledged: true,
        },
      };

      this.log('debug', 'Sending wallet_ready acknowledgment', {
        messageId,
      });

      // Send acknowledgment asynchronously
      transport.send(ackMessage).catch((error) => {
        this.log('warn', 'Failed to send wallet_ready acknowledgment', error);
        // Don't throw - this is best effort
      });
    }
  }

  /**
   * Disconnect from the Aztec wallet
   */
  async disconnect(): Promise<void> {
    try {
      const provider = this.aztecProvider as { disconnect?: () => Promise<void> };
      if (provider?.disconnect) {
        await provider.disconnect();
      }

      // Clear provider reference
      this.aztecProvider = undefined;

      // Clear session ID
      this.sessionId = null;

      // Always cleanup subscription
      this.cleanupJsonRpcSubscription();

      // Use base class cleanup which handles state and providers
      await this.cleanup();
    } catch (error) {
      // Ensure cleanup even if error occurs
      this.cleanupJsonRpcSubscription();
      this.sessionId = null;

      throw ErrorFactory.connectionFailed('Failed to disconnect from Aztec wallet', {
        originalError: error,
        adapterId: this.id,
      });
    }
  }

  /**
   * Validate that the Aztec provider is in a usable state
   *
   * Performs comprehensive validation to prevent returning stale or invalid provider references:
   * - Checks provider reference exists
   * - Validates required methods (connect, call, disconnect)
   * - Verifies adapter is in connected state
   *
   * @returns true if provider is valid and connected
   * @private
   */
  private isProviderValid(): boolean {
    // Provider must exist
    if (!this.aztecProvider) {
      return false;
    }

    const provider = this.aztecProvider as {
      connect?: unknown;
      call?: unknown;
      disconnect?: unknown;
    };

    // Validate required methods exist and are functions
    if (
      typeof provider.connect !== 'function' ||
      typeof provider.call !== 'function' ||
      typeof provider.disconnect !== 'function'
    ) {
      this.log('warn', 'Provider missing required methods', {
        hasConnect: typeof provider.connect === 'function',
        hasCall: typeof provider.call === 'function',
        hasDisconnect: typeof provider.disconnect === 'function',
      });
      return false;
    }

    // Check adapter connection state to prevent stale references
    if (!this.state.isConnected) {
      this.log('warn', 'Provider exists but adapter not connected', {
        adapterState: this.state.status,
        hasProvider: !!this.aztecProvider,
      });
      return false;
    }

    return true;
  }

  /**
   * Set up provider event listeners to forward events to adapter
   * @override
   */
  protected override setupProviderListeners(provider: unknown): void {
    const aztecProvider = provider as {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
    };

    if (typeof aztecProvider.on !== 'function') {
      this.log('warn', 'Aztec provider does not support event listeners');
      return;
    }

    this.log('debug', 'Setting up Aztec provider event listeners');

    // Forward accountsChanged events
    aztecProvider.on('accountsChanged', (accounts: unknown) => {
      this.log('debug', 'Aztec accounts changed', { accounts });
      const accountArray = accounts as string[];
      this.emitBlockchainEvent('accountsChanged', {
        accounts: accountArray,
        chainType: ChainType.Aztec,
      });
    });

    // Forward chainChanged events
    aztecProvider.on('chainChanged', (chainId: unknown) => {
      this.log('debug', 'Aztec chain changed', { chainId });
      const chainIdString = chainId as string;
      this.emitBlockchainEvent('chainChanged', {
        chainId: chainIdString,
        chainType: ChainType.Aztec,
      });
    });

    // Forward disconnect events
    aztecProvider.on('disconnect', () => {
      this.log('debug', 'Aztec provider disconnected');
      this.emitBlockchainEvent('disconnected', { reason: 'Provider disconnected' });
    });
  }

  /**
   * Get the provider for the specified chain type
   */
  override getProvider(chainType: ChainType): WalletProvider {
    if (chainType !== ChainType.Aztec) {
      throw ErrorFactory.configurationError(`AztecAdapter does not support ${chainType}`, {
        adapterId: this.id,
        requestedChain: chainType,
        supportedChains: [ChainType.Aztec],
      });
    }

    // Use comprehensive validation to prevent stale or invalid providers
    if (!this.isProviderValid()) {
      throw ErrorFactory.configurationError(
        'Aztec provider is not initialized or not connected. Please call connect() first.',
        {
          walletId: this.id,
          chainType,
          hasProvider: !!this.aztecProvider,
          isConnected: this.state.isConnected,
          connectionStatus: this.state.status,
        },
      );
    }

    return this.aztecProvider as WalletProvider;
  }

  /**
   * Set transport for the adapter
   * Useful when transport is discovered after adapter creation
   */
  setTransport(transport: Transport): void {
    this.transport = transport;
    this.log('debug', 'Set transport for Aztec adapter');
  }

  /**
   * Normalize and validate the Aztec network identifier
   *
   * Attempts to determine the network from multiple sources:
   * 1. Adapter configuration (this.config.network)
   * 2. Connect options (options.chains)
   * 3. Adapter capabilities (this.capabilities.chains)
   *
   * For security, no default network is provided. Explicit configuration is required.
   *
   * @param options - Optional connect options that may contain chain information
   * @returns Normalized network identifier (e.g., 'aztec:testnet')
   * @throws {ModalError} If no network is configured (security requirement)
   * @private
   */
  private normalizeNetworkId(options?: ConnectOptions): string {
    let network = this.config.network;

    // Try to get network from connect options
    if (!network && options?.chains) {
      const aztecChain = options.chains.find((chain) => chain.type === ChainType.Aztec && chain.chainId);
      if (aztecChain?.chainId) {
        network = aztecChain.chainId;
      }
    }

    // Try to get from adapter capabilities
    if (!network && this.capabilities.chains.length > 0) {
      const firstChain = this.capabilities.chains[0];
      if (typeof firstChain === 'object' && 'chainIds' in firstChain) {
        const chainIds = firstChain.chainIds;
        if (typeof chainIds === 'string' && chainIds !== '*') {
          network = chainIds;
        } else if (Array.isArray(chainIds) && chainIds.length > 0) {
          network = chainIds[0];
        }
      }
    }

    // No default fallback - require explicit configuration for security
    if (!network) {
      throw ErrorFactory.configurationError(
        'Aztec network must be explicitly configured. No default network is provided for security.',
        {
          adapterId: this.id,
          supportedNetworks: Object.values(SUPPORTED_AZTEC_NETWORKS),
          configurationHint: 'Set network in AztecAdapter config or pass in ConnectOptions.chains',
          example: `new AztecAdapter({ network: 'aztec:testnet' })`,
        },
      );
    }

    // Normalize network format
    if (!network.startsWith('aztec:')) {
      network = `aztec:${network}`;
    }

    // Validate against supported networks
    const supportedNetworkValues = Object.values(SUPPORTED_AZTEC_NETWORKS);
    if (!supportedNetworkValues.includes(network as AztecNetwork)) {
      this.log('warn', 'Connecting to non-standard Aztec network', {
        network,
        supportedNetworks: supportedNetworkValues,
        warning: 'This network may not be officially supported',
      });
    }

    return network;
  }

  /**
   * Resolve requested permissions for Aztec wallet connection
   *
   * Priority order:
   * 1. Explicit permissions in ConnectOptions (aztecOptions.permissions)
   * 2. DEFAULT_AZTEC_PERMISSIONS (covers typical dApp needs)
   *
   * @param options - Optional connect options
   * @returns Array of permission strings to request
   * @private
   */
  private resolveRequestedPermissions(options?: ConnectOptions): string[] {
    // Check for explicit permissions in options
    const aztecOptions = (options as Record<string, unknown> | undefined)?.['aztecOptions'] as
      | { permissions?: string[] }
      | undefined;

    const fromOptions = aztecOptions?.permissions;
    if (Array.isArray(fromOptions) && fromOptions.length > 0) {
      this.log('debug', 'Using explicit permissions from options', {
        permissions: fromOptions,
        count: fromOptions.length,
      });
      return fromOptions;
    }

    // Use comprehensive defaults for better developer experience
    this.log('debug', 'Using default Aztec permissions', {
      permissions: DEFAULT_AZTEC_PERMISSIONS,
      count: DEFAULT_AZTEC_PERMISSIONS.length,
      note: 'Covers typical dApp operations (read, sign, send)',
    });

    return [...DEFAULT_AZTEC_PERMISSIONS];
  }

  /**
   * Validate if a string is a valid Aztec address
   *
   * Aztec addresses can use two formats:
   * - Bech32-style: aztec1... (followed by base32 encoded data)
   * - Hex format: 0x... (64 hex characters, 32-byte address)
   *
   * @param address - Address string to validate
   * @returns true if address is valid Aztec format
   * @private
   */
  private isValidAztecAddress(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Trim whitespace
    const trimmed = address.trim();

    // Check minimum length
    if (trimmed.length < 10) {
      this.log('debug', 'Address too short to be valid', {
        address: trimmed,
        length: trimmed.length,
      });
      return false;
    }

    // Check for Bech32-style format (aztec1...)
    if (AZTEC_ADDRESS_PATTERN.test(trimmed)) {
      return true;
    }

    // Check for hex format (0x...)
    if (AZTEC_HEX_ADDRESS_PATTERN.test(trimmed)) {
      return true;
    }

    // If neither format matches
    this.log('debug', 'Address does not match known Aztec formats', {
      address: trimmed,
      checkedPatterns: ['bech32', 'hex'],
    });

    return false;
  }

  private normalizeAddress(addressResponse: unknown): string {
    this.log('debug', 'Processing address response', {
      type: typeof addressResponse,
      isArray: Array.isArray(addressResponse),
      hasToString: addressResponse && typeof addressResponse === 'object' && 'toString' in addressResponse,
      keys: addressResponse && typeof addressResponse === 'object' ? Object.keys(addressResponse) : null,
    });

    let addressString: string;

    if (typeof addressResponse === 'object' && addressResponse !== null) {
      // First try: Check if it has a working toString method
      if ('toString' in addressResponse && typeof addressResponse.toString === 'function') {
        try {
          addressString = addressResponse.toString();
          // Validate toString result before accepting it
          if (
            addressString &&
            addressString !== '[object Object]' &&
            addressString !== '{}' &&
            addressString !== 'null'
          ) {
            this.log('debug', 'Successfully converted address using toString()', {
              addressString,
            });
            // Validate and return
            addressString = addressString.trim();
            if (this.isValidAztecAddress(addressString)) {
              this.log('debug', 'Address from toString() is valid', {
                address: addressString,
                length: addressString.length,
                format: addressString.startsWith('aztec1') ? 'bech32' : 'hex',
              });
              return addressString;
            }
          }
        } catch (toStringError) {
          this.log('warn', 'toString() method failed, trying alternatives', toStringError);
        }
      }

      // Second try: Enhanced fallback extraction
      addressString = this.fallbackAddressExtraction(addressResponse);
    } else if (typeof addressResponse === 'string') {
      addressString = addressResponse;
      this.log('debug', 'Address already a string', { addressString });
    } else {
      this.log('error', 'Invalid address response type', {
        type: typeof addressResponse,
        value: addressResponse,
      });
      throw ErrorFactory.connectionFailed('Failed to parse Aztec address from wallet response', {
        originalError: new Error(`Unsupported address format: ${typeof addressResponse}`),
        addressType: typeof addressResponse,
        addressValue: String(addressResponse),
      });
    }

    // Trim whitespace
    addressString = addressString.trim();

    // Final validation
    if (
      !addressString ||
      addressString === '[object Object]' ||
      addressString === '{}' ||
      addressString === 'null' ||
      addressString === 'undefined'
    ) {
      throw ErrorFactory.connectionFailed('Failed to serialize Aztec address to string', {
        originalError: new Error('Address serialization produced invalid result'),
        receivedValue: addressString,
      });
    }

    // Validate address format
    if (!this.isValidAztecAddress(addressString)) {
      throw ErrorFactory.connectionFailed('Wallet returned invalid Aztec address format', {
        originalError: new Error('Invalid address format'),
        receivedAddress: addressString,
        addressLength: addressString.length,
        expectedFormats: ['Bech32-style: aztec1...', 'Hex format: 0x...'],
        hint: 'Address may be from wrong network or wallet is misconfigured',
      });
    }

    this.log('debug', 'Successfully validated and normalized Aztec address', {
      address: addressString,
      length: addressString.length,
      format: addressString.startsWith('aztec1') ? 'bech32' : 'hex',
    });

    return addressString;
  }

  /**
   * Fallback method for extracting address when toString() fails or doesn't exist
   * Tries multiple strategies to extract a usable address string from complex objects
   *
   * @param addressResponse - Address object to extract from
   * @returns Extracted address string
   * @private
   */
  private fallbackAddressExtraction(addressResponse: unknown): string {
    if (addressResponse && typeof addressResponse === 'object') {
      const addressObj = addressResponse as Record<string, unknown>;

      // Check for common address string properties (including wrapper)
      const stringProperties = ['value', 'address', 'inner', '_value', 'data', 'hex', 'wrapper'];
      for (const prop of stringProperties) {
        if (prop in addressObj) {
          const propValue = addressObj[prop];
          // Check if it's a string
          if (typeof propValue === 'string') {
            const stringValue = propValue;
            if (stringValue && stringValue !== 'null' && stringValue !== 'undefined') {
              this.log('debug', `Using '${prop}' property for address`, { [prop]: stringValue });
              return stringValue;
            }
          }
          // Check if it's a nested object with address data
          if (propValue && typeof propValue === 'object') {
            const nestedObj = propValue as Record<string, unknown>;
            for (const nestedProp of stringProperties) {
              if (nestedProp in nestedObj) {
                const nestedValue = nestedObj[nestedProp];
                // Check if the nested value is a string
                if (
                  typeof nestedValue === 'string' &&
                  nestedValue &&
                  nestedValue !== 'null' &&
                  nestedValue !== 'undefined'
                ) {
                  this.log('debug', `Using nested '${prop}.${nestedProp}' property for address`, {
                    [`${prop}.${nestedProp}`]: nestedValue,
                  });
                  return nestedValue;
                }
                // Check if it's a deeply nested object (one more level)
                if (nestedValue && typeof nestedValue === 'object') {
                  const deepNestedObj = nestedValue as Record<string, unknown>;
                  for (const deepProp of stringProperties) {
                    if (deepProp in deepNestedObj && typeof deepNestedObj[deepProp] === 'string') {
                      const deepValue = deepNestedObj[deepProp] as string;
                      if (deepValue && deepValue !== 'null' && deepValue !== 'undefined') {
                        this.log(
                          'debug',
                          `Using deeply nested '${prop}.${nestedProp}.${deepProp}' property for address`,
                          {
                            [`${prop}.${nestedProp}.${deepProp}`]: deepValue,
                          },
                        );
                        return deepValue;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Check for bytes array property
      if ('bytes' in addressObj && Array.isArray(addressObj['bytes'])) {
        const bytesArray = addressObj['bytes'] as unknown[];
        if (bytesArray.length > 0 && bytesArray.every((b) => typeof b === 'number')) {
          try {
            // Convert byte array to hex string
            const hexString = `0x${bytesArray
              .map((b: unknown) => {
                const num = b as number;
                return num.toString(16).padStart(2, '0');
              })
              .join('')}`;
            this.log('debug', 'Converted bytes array to hex string', {
              bytesLength: bytesArray.length,
              hexString,
            });
            return hexString;
          } catch (bytesError) {
            this.log('warn', 'Failed to convert bytes array', bytesError);
          }
        }
      }

      // Try to find any string property that looks like an address
      for (const [key, value] of Object.entries(addressObj)) {
        if (typeof value === 'string' && value.startsWith('0x') && value.length >= 40) {
          this.log('debug', `Using '${key}' property as hex address`, { [key]: value });
          return value;
        }
        if (typeof value === 'string' && value.startsWith('aztec1') && value.length >= 40) {
          this.log('debug', `Using '${key}' property as bech32 address`, { [key]: value });
          return value;
        }
      }

      // Last resort: JSON stringify
      this.log('warn', 'No suitable address property found, using JSON.stringify as last resort', {
        availableKeys: Object.keys(addressObj),
      });
      return JSON.stringify(addressResponse);
    }

    return String(addressResponse);
  }

  // Note: getChainName() has been consolidated to src/utils/chainNameResolver.ts
}
