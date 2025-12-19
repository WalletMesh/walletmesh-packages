/**
 * Aztec Example Wallet Adapter
 *
 * Example implementation of an Aztec wallet adapter that demonstrates
 * how to integrate a hosted wallet with the WalletMesh modal system
 * using the provider-agnostic architecture with lazy loading.
 *
 * This adapter implements the popup-based communication pattern for
 * wallets that are hosted on separate domains and need cross-origin
 * communication. It only supports Aztec blockchain.
 *
 * @module wallets/aztec/AztecExampleWalletAdapter
 * @packageDocumentation
 */

import type { WalletConnection } from '../../../api/types/connection.js';
import type { WalletProvider } from '../../../api/types/providers.js';
import { ChainType, type Transport } from '../../../types.js';
import type { WalletInfo } from '../../../types.js';
import { getChainName } from '../../../utils/chainNameResolver.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { ErrorHandler } from '../../core/errors/errorHandler.js';
import { modalLogger } from '../../core/logger/globalLogger.js';
import { createDebugLogger } from '../../core/logger/logger.js';
import { CrossWindowTransport } from '../../transports/cross-window/CrossWindowTransport.js';
import { LazyAztecRouterProvider } from '../../../providers/aztec/lazy.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';
import type {
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';

/**
 * Configuration for the Aztec Example Wallet
 */
export interface AztecExampleWalletConfig {
  /** URL of the hosted wallet */
  walletUrl?: string;
  /** Window features for popup */
  windowFeatures?: string;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
}

/**
 * Aztec Example Wallet Adapter
 *
 * Demonstrates the provider-agnostic adapter pattern with lazy loading.
 * This wallet ONLY supports Aztec blockchain, demonstrating a chain-specific
 * wallet implementation.
 *
 * Features:
 * - Popup-based wallet communication
 * - Lazy loading of Aztec libraries (only loaded when connected)
 * - Automatic state management via AbstractWalletAdapter
 * - Event forwarding for account/chain changes
 * - Resource cleanup and lifecycle management
 * - Type-safe error handling with ErrorFactory
 *
 * @public
 */
/**
 * Interface for AztecRouterProvider methods we use
 * Defined locally to avoid static import dependency
 */
interface AztecRouterProviderInterface {
  call: <M extends string>(
    chainId: string,
    call: { method: M; params?: unknown[] },
    timeout?: number,
  ) => Promise<unknown>;
  connect: (
    permissions: Record<string, string[]>,
    timeout?: number,
  ) => Promise<{ sessionId: string; permissions: unknown }>;
  reconnect: (sessionId: string, timeout?: number) => Promise<{ sessionId: string; permissions: unknown }>;
  disconnect: () => Promise<void>;
  ensureReady: () => Promise<void>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  sessionId: string | undefined; // Session ID property available after connection
}

export class AztecExampleWalletAdapter extends AbstractWalletAdapter {
  readonly id = 'aztec-example-wallet';

  private routerProvider: AztecRouterProviderInterface | null = null;
  protected override transport: Transport | null = null;
  private sessionId: string | null = null;

  readonly metadata: WalletAdapterMetadata = {
    name: 'Aztec Example Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0RjQ2RTUiLz4KPHBhdGggZD0iTTIyIDEwTDE2IDIyTDEwIDEwSDE0TDE2IDE0TDE4IDEwSDIyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
    description: 'Sandbox hosted Aztec wallet for demonstration',
    homepage: 'https://sandbox-example-wallet.aztec.walletmesh.com',
  };

  /**
   * Capabilities of the Aztec Example Wallet
   * This wallet ONLY supports Aztec chains
   */
  readonly capabilities: WalletCapabilities = {
    chains: [
      {
        type: ChainType.Aztec,
        chainIds: '*',
      },
    ],
    features: new Set(['sign_message', 'sign_typed_data', 'multi_account'] as WalletFeature[]),
  };

  private walletConfig: AztecExampleWalletConfig = {
    walletUrl: 'http://127.0.0.1:5174',
    windowFeatures: 'width=500,height=700,resizable,scrollbars=yes',
    connectionTimeout: 30000,
  };

  /**
   * Constructor that accepts optional transport configuration for session restoration
   * @param config Optional configuration with transport settings and sessionId from persisted session
   */
  constructor(config?: {
    transportConfig?: {
      type: string;
      config: Record<string, unknown>;
    };
    sessionId?: string;
  }) {
    super();

    // If transport config is provided (from session restoration), use it
    if (config?.transportConfig) {
      const { config: transportConfigData } = config.transportConfig;

      // Extract walletUrl from various possible locations in transport config
      const walletUrl =
        (transportConfigData['walletUrl'] as string | undefined) ||
        (transportConfigData['targetOrigin'] as string | undefined) ||
        this.walletConfig.walletUrl; // Fallback to default

      if (walletUrl) {
        this.walletConfig.walletUrl = walletUrl;
      }

      this.log('debug', 'Adapter created with restored transport config', {
        walletUrl,
        hasSessionId: !!config.sessionId,
      });
    }

    // If sessionId is provided from persisted session, store it
    if (config?.sessionId) {
      this.sessionId = config.sessionId;
      this.log('debug', 'Adapter created with persisted sessionId', {
        sessionId: config.sessionId,
      });
    }
  }

  /**
   * Implement the abstract connect method from AbstractWalletAdapter
   */
  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    return this.doConnect(options);
  }

  /**
   * Get a display name for a chainId
   */
  // Note: getChainName() has been consolidated to src/utils/chainNameResolver.ts

  /**
   * Categorize a permission for better debugging
   */
  private categorizePermission(permission: string): string {
    if (permission.startsWith('aztec_get')) return 'Read';
    if (permission.startsWith('aztec_send') || permission.startsWith('aztec_prove')) return 'Transaction';
    if (permission.startsWith('aztec_simulate')) return 'Simulation';
    if (permission.startsWith('aztec_register') || permission.startsWith('aztec_deploy')) return 'Contract';
    if (permission.startsWith('aztec_create')) return 'Authorization';
    if (permission.startsWith('aztec_wm')) return 'WalletMesh';
    return 'Other';
  }

  /**
   * Get the required permissions for Aztec wallet
   * Reads from connection options if provided, otherwise uses defaults
   */
  private getRequiredPermissions(options?: ConnectOptions): string[] {
    // Check if permissions are provided in Aztec connection options
    const aztecOptions = options?.['aztecOptions'] as { permissions?: string[] } | undefined;
    if (aztecOptions?.permissions && aztecOptions.permissions.length > 0) {
      modalLogger.debug('Using permissions from connection options', {
        permissions: aztecOptions.permissions,
      });
      return aztecOptions.permissions;
    }

    // Default permissions if not specified by dApp
    modalLogger.debug('Using default permissions (no permissions specified in connection options)');
    return [
      // Account Methods (required for initialization)
      'aztec_getAddress',
      'aztec_getCompleteAddress',

      // Chain/Node Methods (required for initialization and queries)
      'aztec_getChainId',
      'aztec_getVersion',
      'aztec_getBlockNumber',
      'aztec_getCurrentBaseFees',
      'aztec_getNodeInfo',
      'aztec_getPXEInfo',

      // Transaction Methods (core functionality)
      'aztec_sendTx',
      'aztec_simulateTx',
      'aztec_getTxReceipt',
      'aztec_proveTx',

      // Contract Methods (deployment and interaction)
      'aztec_getContracts',
      'aztec_registerContract',
      'aztec_registerContractClass',

      // Auth Methods (authorization)
      'aztec_createAuthWit',

      // Event Methods (monitoring)
      'aztec_getPrivateEvents',
      'aztec_getPublicEvents',
    ];
  }

  /**
   * Get accounts from the wallet with address serialization
   */
  private async getAccounts(chainId: string): Promise<string[]> {
    try {
      // Use aztec_getAddress - Aztec wallets have a single address
      const addressResponse = await this.routerProvider?.call(chainId, { method: 'aztec_getAddress' }, 5000);

      // Convert AztecAddress to string using the helper
      const addressString = this.convertAztecAddressToString(addressResponse, 'getAccounts');

      // Return the single address as an array
      return [addressString];
    } catch (error) {
      modalLogger.error('Failed to get accounts', error);
      throw ErrorFactory.fromConnectorError('aztec-example-wallet', error, 'getAccounts');
    }
  }

  /**
   * Helper method to convert Aztec address objects to strings with enhanced debugging
   */
  private convertAztecAddressToString(addressResponse: unknown, context = 'unknown'): string {
    modalLogger.debug(`Processing address response in ${context}`, {
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
            modalLogger.debug(`Successfully converted address using toString() in ${context}`, {
              addressString,
            });
            return addressString;
          }
        } catch (toStringError) {
          modalLogger.warn(`toString() method failed in ${context}, trying alternatives`, toStringError);
        }
      }

      // Second try: Enhanced fallback extraction
      addressString = this.fallbackAddressExtraction(addressResponse, context);
    } else if (typeof addressResponse === 'string') {
      addressString = addressResponse;
      modalLogger.debug(`Address already a string in ${context}`, { addressString });
    } else {
      modalLogger.error(`Invalid address response type in ${context}`, {
        type: typeof addressResponse,
        value: addressResponse,
      });
      throw new Error(`Invalid address response type in ${context}: ${typeof addressResponse}`);
    }

    // Final validation
    if (
      !addressString ||
      addressString === '[object Object]' ||
      addressString === '{}' ||
      addressString === 'null' ||
      addressString === 'undefined'
    ) {
      throw new Error(`Failed to serialize Aztec address to string in ${context}`);
    }

    return addressString;
  }

  /**
   * Fallback method for extracting address when toString() fails or doesn't exist
   */
  private fallbackAddressExtraction(addressResponse: unknown, context = 'unknown'): string {
    if (addressResponse && typeof addressResponse === 'object') {
      const addressObj = addressResponse as Record<string, unknown>;

      // Check for common address string properties
      const stringProperties = ['value', 'address', 'inner', '_value', 'data', 'hex'];
      for (const prop of stringProperties) {
        if (prop in addressObj && typeof addressObj[prop] === 'string') {
          const stringValue = addressObj[prop] as string;
          if (stringValue && stringValue !== 'null' && stringValue !== 'undefined') {
            modalLogger.debug(`Using '${prop}' property in ${context}`, { [prop]: stringValue });
            return stringValue;
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
            modalLogger.debug(`Converted bytes array to hex string in ${context}`, {
              bytesLength: bytesArray.length,
              hexString,
            });
            return hexString;
          } catch (bytesError) {
            modalLogger.warn(`Failed to convert bytes array in ${context}`, bytesError);
          }
        }
      }

      // Try to find any string property that looks like an address
      for (const [key, value] of Object.entries(addressObj)) {
        if (typeof value === 'string' && value.startsWith('0x') && value.length >= 40) {
          modalLogger.debug(`Using '${key}' property as hex address in ${context}`, { [key]: value });
          return value;
        }
      }

      // Last resort: JSON stringify
      return JSON.stringify(addressResponse);
    }

    return String(addressResponse);
  }

  /**
   * Implement the abstract disconnect method from AbstractWalletAdapter
   */
  async disconnect(): Promise<void> {
    try {
      return await this.doDisconnect();
    } catch (error) {
      // Log the error but don't throw - this matches the expected behavior in tests
      if (this.logger) {
        this.logger.error('Disconnection error', error);
      } else {
        console.error('[AztecExampleWalletAdapter] Disconnection error:', error);
      }
    }
  }

  /**
   * CONNECTION HANDLER: Implement wallet-specific connection logic
   *
   * This method handles:
   * - Opening the popup window
   * - Waiting for wallet to be ready
   * - Establishing JSON-RPC communication
   * - Creating Aztec provider adapter with lazy loading
   * - Getting initial account and chain information
   *
   * The base class handles:
   * - State management (connecting/connected/disconnected)
   * - Event emission (connection:established, etc.)
   * - Error handling and recovery
   * - Resource cleanup
   */
  protected async doConnect(options?: ConnectOptions): Promise<WalletConnection> {
    const walletUrl = (options as { walletUrl?: string })?.walletUrl || this.walletConfig.walletUrl;
    const timeout = this.walletConfig.connectionTimeout;

    modalLogger.debug('Aztec wallet configuration', { walletUrl, timeout });

    // Check if we have an existing connected provider
    if (this.routerProvider && this.sessionId) {
      modalLogger.info('🔄 Checking existing provider connection', {
        hasProvider: true,
        sessionId: this.sessionId,
      });

      try {
        // Try to use the existing provider - verify it's still connected
        // by making a simple call to check the connection
        const optionsWithChain = options as { chain?: { chainId?: string } } | undefined;
        const chainIdStr = String(optionsWithChain?.chain?.chainId || 'aztec:31337');
        const chainId = await this.routerProvider.call(chainIdStr, { method: 'aztec_getChainId' }, 5000);
        modalLogger.info('✅ Existing provider is still connected, reusing it', {
          chainId,
          sessionId: this.sessionId,
        });

        // Get the current address to return in the connection
        const addressResponse = await this.routerProvider.call(
          chainIdStr,
          { method: 'aztec_getAddress' },
          5000,
        );
        const address = this.convertAztecAddressToString(addressResponse, 'provider reuse');
        const accounts = [address];

        // Return connection with existing provider
        return this.createConnection({
          address,
          accounts,
          chainId: String(chainId || chainIdStr),
          chainType: ChainType.Aztec,
          provider: this.routerProvider as unknown as WalletProvider,
          providerType: 'aztec-router',
          sessionId: this.sessionId,
          chainName: getChainName(String(chainId || chainIdStr)),
        });
      } catch (error) {
        modalLogger.warn('Existing provider is no longer connected, will create new connection', {
          error,
          sessionId: this.sessionId,
        });
        // Provider is no longer valid, clear it and continue with new connection
        this.routerProvider = null;
        this.sessionId = null;
        // Also clear the transport if it exists
        if (this.transport) {
          try {
            await (this.transport as CrossWindowTransport).disconnect();
          } catch {
            // Ignore errors during cleanup
          }
          this.transport = null;
        }
      }
    }

    // Pass the dApp's origin as a URL parameter so the wallet can dynamically detect it
    // Use appMetadata.origin if provided, otherwise fall back to window.location.origin
    const appMetadata = (options as { appMetadata?: { origin?: string } })?.appMetadata;
    const dappOrigin = appMetadata?.origin || window.location.origin;

    modalLogger.debug('Using dApp origin for wallet communication', {
      providedOrigin: appMetadata?.origin,
      detectedOrigin: window.location.origin,
      usedOrigin: dappOrigin,
      hasAppMetadata: !!appMetadata,
    });

    const walletUrlWithOrigin = `${walletUrl}?dappOrigin=${encodeURIComponent(dappOrigin)}`;

    // Open the popup window first
    const popupWindow = window.open(
      walletUrlWithOrigin,
      'walletMeshAztecWallet',
      this.walletConfig.windowFeatures,
    );

    if (!popupWindow) {
      throw ErrorFactory.connectionFailed('Failed to open wallet popup - it may have been blocked', {
        walletId: this.id,
      });
    }

    // Set target origin to the wallet's origin (where we expect to receive messages FROM)
    // The dApp expects to receive messages from the wallet popup
    // Security: Always require explicit origin - no wildcards
    let targetOrigin: string;
    try {
      const url = new URL(walletUrl as string);
      targetOrigin = url.origin;
      modalLogger.debug('Wallet origin determined', { targetOrigin });
    } catch (error) {
      // Fail securely if we cannot determine the wallet origin
      throw ErrorFactory.configurationError(
        'Invalid wallet URL - cannot determine target origin for secure communication',
        {
          walletUrl,
          walletId: this.id,
          error,
        },
      );
    }

    // Create a proper logger for the transport
    const transportLogger = createDebugLogger('AztecExampleWalletAdapter', true);

    // Create a proper error handler for the transport
    const errorHandler = new ErrorHandler(transportLogger);

    // Create CrossWindowTransport for reliable cross-origin communication
    // Using separate send and receive IDs for proper message routing
    this.transport = new CrossWindowTransport(
      {
        targetWindow: popupWindow,
        targetOrigin,
        sendMessageId: 'dapp_to_wallet', // dApp sends messages with this ID
        receiveMessageId: 'wallet_to_dapp', // dApp receives messages with this ID
        ...(timeout !== undefined && { timeout }),
      },
      transportLogger,
      errorHandler,
    );

    // Connect transport - this establishes communication with the wallet
    modalLogger.debug('Connecting to wallet via cross-window transport...');
    await this.transport.connect();
    modalLogger.debug('Popup transport connected');

    // Create a proper JSON-RPC transport adapter that handles the wallet router protocol
    // The wallet expects JSON-RPC messages, not raw method calls
    const jsonRpcTransport = {
      send: async (message: unknown): Promise<void> => {
        // The message should be a proper JSON-RPC request
        modalLogger.debug('Sending JSON-RPC message through transport', message);

        // Check if this is a wm_call message and add sessionId if we have one
        if (
          this.sessionId &&
          message &&
          typeof message === 'object' &&
          'method' in message &&
          (message as { method?: unknown }).method === 'wm_call'
        ) {
          const msg = message as { method: string; params?: unknown; [key: string]: unknown };

          modalLogger.debug('Processing wm_call message for sessionId injection', {
            hasParams: !!msg.params,
            paramsType: typeof msg.params,
            isArray: Array.isArray(msg.params),
            sessionId: this.sessionId,
            params: msg.params,
          });

          // Handle array-based params (most common case from provider)
          if (Array.isArray(msg.params) && msg.params.length > 0) {
            const wmCallRequest = msg.params[0];
            if (wmCallRequest && typeof wmCallRequest === 'object' && !Array.isArray(wmCallRequest)) {
              // Add sessionId to the wmCallRequest object inside the array
              const modifiedRequest = {
                ...wmCallRequest,
                sessionId: this.sessionId,
              };
              const modifiedMessage = {
                ...msg,
                params: [modifiedRequest, ...msg.params.slice(1)],
              };
              modalLogger.debug('✅ Added sessionId to wm_call array params', {
                sessionId: this.sessionId,
                originalRequest: wmCallRequest,
                modifiedRequest: modifiedRequest,
              });
              await this.transport?.send(modifiedMessage);
              return;
            }
          }
          // Handle object-based params (fallback for backward compatibility)
          else if (msg.params && typeof msg.params === 'object' && !Array.isArray(msg.params)) {
            // Add sessionId to the params object
            const modifiedMessage = {
              ...msg,
              params: {
                ...msg.params,
                sessionId: this.sessionId,
              },
            };
            modalLogger.debug('✅ Added sessionId to wm_call object params', {
              sessionId: this.sessionId,
              originalParams: msg.params,
              modifiedParams: modifiedMessage.params,
            });
            await this.transport?.send(modifiedMessage);
            return;
          } else {
            modalLogger.warn(
              '⚠️ Could not inject sessionId into wm_call message - unexpected params structure',
              {
                paramsType: typeof msg.params,
                isArray: Array.isArray(msg.params),
                params: msg.params,
              },
            );
          }
        }

        // For all other messages, pass through as-is
        await this.transport?.send(message);
      },
      onMessage: (callback: (message: unknown) => void): void => {
        // Register a message handler for JSON-RPC responses
        // This is called once by JSONRPCNode during construction
        // We need to set up a permanent listener that forwards only valid JSON-RPC messages
        const messageHandler = async (event: { type: string; data?: unknown }) => {
          modalLogger.debug('🔍 AztecExampleWalletAdapter received event', {
            eventType: event.type,
            hasData: !!event.data,
            dataType: typeof event.data,
            isMessage: event.type === 'message',
          });

          if (event.type === 'message' && event.data) {
            const data = event.data as Record<string, unknown>;

            modalLogger.debug('🔍 Processing message event data', {
              dataKeys: Object.keys(data),
              hasJsonRpc: !!data['jsonrpc'],
              jsonRpcVersion: data['jsonrpc'],
              hasMethod: !!data['method'],
              method: data['method'],
              hasId: !!data['id'],
              id: data['id'],
              hasResult: !!data['result'],
              hasError: !!data['error'],
            });

            // Filter out non-JSON-RPC messages
            // Valid JSON-RPC messages must have jsonrpc: "2.0" and either method, event, or id
            if (data && typeof data === 'object' && data['jsonrpc'] === '2.0') {
              // Check if this is a wm_connect response with sessionId
              if (data['id'] && data['result'] && typeof data['result'] === 'object') {
                const result = data['result'] as Record<string, unknown>;
                if (result['sessionId'] && typeof result['sessionId'] === 'string') {
                  this.sessionId = result['sessionId'];
                  modalLogger.info('Intercepted and stored sessionId from wm_connect response', {
                    sessionId: this.sessionId,
                  });
                }
              }
              // This is a valid JSON-RPC message, forward it to the node
              modalLogger.info('✅ Forwarding valid JSON-RPC message to JSONRPCNode', {
                method: data['method'],
                id: data['id'],
                hasResult: !!data['result'],
                hasError: !!data['error'],
                dataStructure: Object.keys(data),
              });
              callback(data);
            } else if (data && data['type'] === 'wallet_ready') {
              // wallet_ready messages are expected but not JSON-RPC, just log them
              modalLogger.debug('Received wallet_ready message (not forwarding to JSONRPCNode)', data);

              // Send acknowledgment back to wallet
              // The wallet_ready message bypasses the normal transport wrapping,
              // so we send the ack the same way
              try {
                const ackMessage = {
                  type: 'wallet_ready_ack',
                  origin: window.location.origin,
                  timestamp: Date.now(),
                };

                modalLogger.debug('Sending wallet_ready_ack to confirm receipt', ackMessage);
                // Send through transport - it will be handled specially
                await this.transport?.send(ackMessage);
              } catch (ackError) {
                modalLogger.warn('Failed to send wallet_ready acknowledgment', ackError);
                // Non-fatal error - continue with connection process
              }
            } else {
              // Other non-JSON-RPC messages, log for debugging but don't forward
              modalLogger.warn('❌ Received non-JSON-RPC message (not forwarding)', {
                dataType: typeof data,
                dataKeys: data ? Object.keys(data as Record<string, unknown>) : [],
                jsonRpcField: data ? (data as Record<string, unknown>)['jsonrpc'] : undefined,
                typeField: data ? (data as Record<string, unknown>)['type'] : undefined,
                fullData: data,
              });
            }
          } else {
            modalLogger.debug('🚫 Event is not a message type or has no data', {
              eventType: event.type,
              hasData: !!event.data,
              eventData: event.data,
            });
          }
        };

        // Register the handler with the transport
        this.transport?.on('message', messageHandler);

        // Note: We can't return a cleanup function here because the JSONRPCTransport
        // interface doesn't support it, but the transport will be cleaned up when
        // we call disconnect() on the adapter
      },
    };

    // Extract chainId from options - dApp MUST specify the chain
    if (!options?.chains || options.chains.length === 0) {
      throw ErrorFactory.configurationError(
        'No chains specified. The dApp must specify which chain to connect to.',
        { walletId: this.id },
      );
    }

    // Find the Aztec chain from the dApp's configuration
    const aztecChain = options.chains.find((c) => c.type === ChainType.Aztec);
    if (!aztecChain || !aztecChain.chainId) {
      throw ErrorFactory.configurationError(
        'No Aztec chain specified. The dApp must specify an Aztec chain.',
        { walletId: this.id, providedChains: options.chains },
      );
    }

    const chainId = aztecChain.chainId;

    // Create LazyAztecRouterProvider for Aztec wallet communication
    modalLogger.info('🚀 Creating LazyAztecRouterProvider with chainId', { chainId });
    console.log('[AztecExampleWalletAdapter] Creating router provider with chainId:', chainId);

    // LazyAztecRouterProvider handles:
    // - Lazy loading of @walletmesh/aztec-rpc-wallet
    // - Aztec serializer registration
    // - Session termination notifications
    this.routerProvider = new LazyAztecRouterProvider(jsonRpcTransport);

    // Wait for provider initialization to complete before proceeding
    // This prevents race condition where connect() is called before dynamic import finishes
    await this.routerProvider.ensureReady();

    modalLogger.info('✅ LazyAztecRouterProvider created and configured');
    console.log('[AztecExampleWalletAdapter] Router provider created successfully');

    // Check if we have a persisted session to restore
    const persistedSession = this.getPersistedSession();
    // Get adapterReconstruction from persisted session OR from options (reconnection scenario)
    // When reconnecting after page refresh, WalletMeshClientImpl passes adapterReconstruction in options
    const adapterReconstruction =
      persistedSession?.adapterReconstruction ||
      (options as { adapterReconstruction?: unknown })?.adapterReconstruction as
        | { sessionId?: string; transportConfig?: unknown }
        | undefined;
    // Use sessionId from adapterReconstruction, or fall back to constructor-provided sessionId
    const sessionIdToReconnect = adapterReconstruction?.sessionId || this.sessionId;
    const shouldReconnect = !!(sessionIdToReconnect && options?.isReconnection);

    console.log('🔍 [Adapter Session Debug] Session reconnection check:', {
      hasPersistedSession: !!persistedSession,
      hasAdapterReconstruction: !!adapterReconstruction,
      adapterReconstructionFromPersisted: !!persistedSession?.adapterReconstruction,
      adapterReconstructionFromOptions: !!(options as { adapterReconstruction?: unknown })
        ?.adapterReconstruction,
      sessionIdToReconnect,
      isReconnectionFlag: options?.isReconnection,
      shouldReconnect,
      persistedSessionKeys: persistedSession ? Object.keys(persistedSession) : [],
      adapterReconstructionKeys: adapterReconstruction ? Object.keys(adapterReconstruction) : [],
    });

    let connectResult: { sessionId: string; permissions: unknown };

    if (shouldReconnect && sessionIdToReconnect) {
      modalLogger.info('🔄 Attempting to reconnect to persisted session', {
        sessionId: sessionIdToReconnect,
        walletId: persistedSession?.walletId,
      });
      console.log('[AztecExampleWalletAdapter] 🔄 Reconnecting to existing session:', sessionIdToReconnect);

      try {
        // Use reconnect() instead of connect() to restore the existing session
        const reconnectResult = await this.routerProvider.reconnect(
          sessionIdToReconnect,
          30000, // 30 second timeout
        );

        connectResult = reconnectResult;
        // Try multiple sources to ensure we capture sessionId
        this.sessionId = reconnectResult.sessionId ?? this.routerProvider?.sessionId ?? null;

        modalLogger.info('🔍 [Session Capture] Successfully reconnected to existing session', {
          sessionIdFromResult: reconnectResult.sessionId,
          sessionIdFromProvider: this.routerProvider?.sessionId,
          finalSessionId: this.sessionId,
          hasSessionId: !!this.sessionId,
        });
        console.log('[AztecExampleWalletAdapter] Session reconnected successfully');
      } catch (error) {
        modalLogger.warn('⚠️ Reconnection failed, falling back to new connection', {
          error,
          sessionId: sessionIdToReconnect,
        });
        console.warn('[AztecExampleWalletAdapter] Reconnection failed, creating new session:', error);

        // Fall through to normal connect() flow
        const requestedPermissions = this.getRequiredPermissions(options);
        modalLogger.info('Creating new connection after reconnection failure', {
          chainId,
          requestedPermissions: requestedPermissions.length,
        });

        connectResult = await this.routerProvider.connect(
          { [chainId]: requestedPermissions },
          30000, // 30 second timeout
        );

        // Try multiple sources to ensure we capture sessionId
        this.sessionId = connectResult.sessionId ?? this.routerProvider?.sessionId ?? null;
        modalLogger.info('🔍 [Session Capture] New connection established after reconnection failure', {
          sessionIdFromResult: connectResult.sessionId,
          sessionIdFromProvider: this.routerProvider?.sessionId,
          finalSessionId: this.sessionId,
          hasSessionId: !!this.sessionId,
        });
      }
    } else {
      // Normal connection flow (new session)
      const requestedPermissions = this.getRequiredPermissions(options);
      modalLogger.info('Connecting to wallet through router provider', {
        chainId,
        requestedPermissions,
        totalPermissions: requestedPermissions.length,
        fromConnectionOptions: !!(options?.['aztecOptions'] as { permissions?: string[] })?.permissions,
      });

      // Log detailed permission information for debugging
      console.group('🔐 Aztec Wallet Permission Request');
      console.info(`Requesting ${requestedPermissions.length} permissions for chain: ${chainId}`);
      console.table(
        requestedPermissions.map((permission, index) => ({
          index: index + 1,
          permission,
          category: this.categorizePermission(permission),
        })),
      );
      console.info('ℹ️ These permissions will be sent to the wallet for approval');
      console.groupEnd();

      connectResult = await this.routerProvider.connect(
        { [chainId]: requestedPermissions },
        30000, // 30 second timeout
      );

      // Store the sessionId from the connection
      // Try multiple sources to ensure we capture it
      this.sessionId = connectResult.sessionId ?? this.routerProvider?.sessionId ?? null;

      modalLogger.info('🔍 [Session Capture] Connection established, extracting sessionId', {
        sessionIdFromResult: connectResult.sessionId,
        sessionIdFromProvider: this.routerProvider?.sessionId,
        finalSessionId: this.sessionId,
        hasSessionId: !!this.sessionId,
        sessionIdType: typeof this.sessionId,
        connectResultKeys: Object.keys(connectResult || {}),
      });
    }

    // Get the actual account information
    const accounts = await this.getAccounts(chainId);

    // Get the actual chainId from the wallet
    const chainIdResponse = await this.routerProvider.call(chainId, { method: 'aztec_getChainId' }, 5000);

    // Convert the chainId response to string - it might be a hex string, bigint, or object
    let actualChainId: string;
    if (typeof chainIdResponse === 'string') {
      actualChainId = chainIdResponse;
    } else if (typeof chainIdResponse === 'bigint') {
      actualChainId = chainIdResponse.toString();
    } else if (typeof chainIdResponse === 'number') {
      actualChainId = chainIdResponse.toString();
    } else if (chainIdResponse && typeof chainIdResponse === 'object' && 'toString' in chainIdResponse) {
      actualChainId = chainIdResponse.toString();
    } else {
      modalLogger.warn('Unexpected chainId response type, using default', {
        type: typeof chainIdResponse,
        value: chainIdResponse,
      });
      actualChainId = chainId;
    }

    // If it's a hex string like "0x7a69", convert to decimal and format as "aztec:31337"
    if (actualChainId.startsWith('0x')) {
      const decimalChainId = Number.parseInt(actualChainId, 16).toString();
      actualChainId = `aztec:${decimalChainId}`;
    } else if (!actualChainId.startsWith('aztec:')) {
      // Ensure it has the aztec: prefix
      actualChainId = `aztec:${actualChainId}`;
    }

    if (!accounts || accounts.length === 0) {
      throw ErrorFactory.connectorError(this.id, 'No accounts available', 'NO_ACCOUNTS');
    }

    modalLogger.info('Successfully connected to Aztec wallet', {
      address: accounts[0],
      chainId: actualChainId,
    });

    // Use the createConnection helper from AbstractWalletAdapter
    // This properly stores the connection in the adapter's internal state
    modalLogger.info('[DEBUG] Before createConnection', {
      sessionId: this.sessionId,
      hasSessionId: !!this.sessionId,
      sessionIdType: typeof this.sessionId,
    });

    const connection = await this.createConnection({
      address: accounts[0] as string,
      accounts,
      chainId: actualChainId,
      chainType: ChainType.Aztec,
      provider: this.routerProvider as unknown as import('../../../api/types/providers.js').WalletProvider,
      sessionId: this.sessionId ?? undefined,
      chainName: getChainName(actualChainId),
      chainRequired: false,
    });

    modalLogger.info('[DEBUG] After createConnection', {
      connectionSessionId: connection.sessionId,
      hasConnectionSessionId: !!connection.sessionId,
      connectionSessionIdType: typeof connection.sessionId,
    });

    return connection;
  }

  /**
   * Get the Aztec router provider
   * Returns the provider instance if connected
   */
  public async getAztecProvider(): Promise<unknown> {
    if (!this.routerProvider) {
      throw new Error('Aztec router provider not initialized. Connect wallet first.');
    }

    return this.routerProvider;
  }

  /**
   * DISCONNECT HANDLER: Clean up wallet-specific resources
   */
  protected async doDisconnect(): Promise<void> {
    modalLogger.debug('Disconnecting from Aztec wallet');

    // Disconnect through router provider if available
    if (this.routerProvider && this.sessionId) {
      try {
        await this.routerProvider.disconnect();
      } catch (error) {
        modalLogger.debug('Error disconnecting router provider', { error });
      }
    }

    // Clear the sessionId
    this.sessionId = null;

    // Clear the router provider
    this.routerProvider = null;

    // Disconnect and clean up transport (this closes the popup window)
    if (this.transport) {
      try {
        await this.transport.disconnect();
      } catch (error) {
        modalLogger.debug('Error disconnecting transport', { error });
      }
      this.transport = null;
    }

    modalLogger.info('Disconnected from Aztec wallet');
  }

  /**
   * PROVIDER SETUP: Configure provider event listeners
   * Called automatically when a provider is created
   */
  protected override setupProviderListeners(
    provider: import('../../../api/types/providers.js').WalletProvider,
  ): void {
    // Cast to Aztec router provider interface (type loaded dynamically at runtime)
    const aztecProvider = provider as unknown as AztecRouterProviderInterface;

    // Forward provider events to adapter events
    aztecProvider.on('accountsChanged', (accounts: unknown) => {
      modalLogger.debug('Aztec accounts changed', { accounts });
      const accountArray = accounts as string[];
      this.emitBlockchainEvent('accountsChanged', {
        accounts: accountArray,
        chainType: ChainType.Aztec,
      });
    });

    aztecProvider.on('chainChanged', (chainId: unknown) => {
      modalLogger.debug('Aztec chain changed', { chainId });
      const chainIdString = chainId as string;
      this.emitBlockchainEvent('chainChanged', {
        chainId: chainIdString,
        chainType: ChainType.Aztec,
      });
    });

    aztecProvider.on('disconnect', () => {
      modalLogger.debug('Provider disconnected');
      this.emitBlockchainEvent('disconnected', { reason: 'Provider disconnected' });
    });

    // Listen for session termination from wallet
    aztecProvider.on('wm_sessionTerminated', (data: unknown) => {
      const { sessionId, reason } = data as { sessionId: string; reason: string };
      modalLogger.info('Session terminated by wallet', { sessionId, reason });
      // Forward to WalletMeshClient via blockchain event
      this.emitBlockchainEvent('sessionTerminated', {
        sessionId,
        reason,
        chainType: ChainType.Aztec,
      });
    });
  }

  /**
   * DETECTION HANDLER: Check if wallet can be used
   */
  async detect(): Promise<DetectionResult> {
    // For a hosted wallet, it's always available but not "installed" in the traditional sense
    return {
      isInstalled: true, // We consider it "installed" since it's accessible via popup
      isReady: true, // Always ready since it's hosted
      version: '1.0.0', // Version of the adapter
      metadata: {
        type: 'hosted',
        url: this.walletConfig.walletUrl,
      },
    };
  }

  /**
   * Check if the wallet is available
   * For hosted wallets, this always returns true
   */
  async isAvailable(): Promise<boolean> {
    // Hosted wallets are always available via popup
    return true;
  }

  /**
   * Handle accounts changed event
   * Protected method for testing purposes
   */
  protected handleAccountsChanged(accounts: string[]): void {
    this.emitBlockchainEvent('accountsChanged', {
      accounts,
      chainType: ChainType.Aztec,
    });
  }

  /**
   * Handle chain changed event
   * Protected method for testing purposes
   */
  protected handleChainChanged(chainId: string): void {
    this.emitBlockchainEvent('chainChanged', {
      chainId,
      chainType: ChainType.Aztec,
    });
  }

  /**
   * Handle disconnected event
   * Protected method for testing purposes
   */
  protected handleDisconnected(reason?: string): void {
    this.emitBlockchainEvent('disconnected', { reason });
  }

  /**
   * Cleanup method for testing
   */
  protected override async cleanup(): Promise<void> {
    await this.doDisconnect();
  }

  /**
   * Static method to get wallet info without instantiation
   */
  static getWalletInfo(): WalletInfo {
    return {
      id: 'aztec-example-wallet',
      name: 'Aztec Example Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM0RjQ2RTUiLz4KPHBhdGggZD0iTTIyIDEwTDE2IDIyTDEwIDEwSDE0TDE2IDE0TDE4IDEwSDIyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
      chains: [ChainType.Aztec],
      description: 'Example Aztec wallet demonstrating popup-based communication',
    };
  }
}

/**
 * Example usage showing lazy loading benefits:
 *
 * ```typescript
 * // When adapter is imported, NO Aztec libraries are loaded
 * import { AztecExampleWalletAdapter } from '@walletmesh/modal-core';
 *
 * const wallet = new AztecExampleWalletAdapter();
 *
 * // Aztec libraries are still NOT loaded here
 * await wallet.connect();
 *
 * // Aztec libraries are loaded ONLY when you actually use the provider
 * const aztecProvider = await wallet.getAztecProvider();
 *
 * // Now @aztec/aztec.js and @walletmesh/aztec-rpc-wallet are loaded
 * await aztecProvider.deployContract(...);
 * ```
 *
 * This ensures:
 * - Smaller initial bundle size
 * - Faster page load
 * - Libraries only loaded when actually needed
 * - Better security (unused code is never loaded)
 */
