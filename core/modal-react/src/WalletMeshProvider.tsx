/**
 * WalletMesh Provider Component
 *
 * This module provides the root provider component that initializes and manages
 * the WalletMesh client instance for React applications. It handles SSR,
 * configuration transformation, and automatic modal injection.
 *
 * ## Architecture
 *
 * The provider follows a layered architecture:
 * 1. **Client Creation**: Creates and manages the modal-core client instance
 * 2. **Context Provision**: Provides client and config via React Context
 * 3. **Modal Injection**: Optionally renders the connection modal
 * 4. **SSR Safety**: Handles server-side rendering gracefully
 *
 * ## Configuration Transformation
 *
 * The provider automatically transforms simplified configurations:
 * - Chain strings (e.g., 'evm') → Full chain objects
 * - Wallet string arrays → Wallet configuration objects
 * - Missing defaults → Sensible default values
 *
 * ## State Management
 *
 * The provider manages several types of state:
 * - **Client State**: The modal-core client instance and its creation status
 * - **Initialization State**: Loading states and error handling during setup
 * - **Configuration State**: Transformed configuration for client consumption
 * - **Debug State**: Global debug flags for development
 *
 * @module WalletMeshProvider
 * @packageDocumentation
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorFactory, createWalletMesh } from '@walletmesh/modal-core';
import type { ChainType, QueryManager, WalletMeshConfig } from '@walletmesh/modal-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { WalletMeshModal } from './components/WalletMeshModal.js';

import { WalletMeshContext } from './WalletMeshContext.js';
import { ThemeProvider } from './theme/ThemeContext.js';
import type { WalletMeshProviderProps } from './types.js';
import { createComponentLogger } from './utils/logger.js';

/**
 * Provider component for WalletMesh functionality.
 *
 * Creates a headless WalletMesh instance and provides React-optimized state management.
 * Auto-injects the modal component by default with opt-out option.
 * Uses useSyncExternalStore for optimal React 18+ integration.
 *
 * ## Key Features
 *
 * - **SSR-Safe**: Handles server-side rendering without hydration mismatches
 * - **Auto-Configuration**: Transforms simplified configs to full formats
 * - **Modal Management**: Automatically renders connection modal unless disabled
 * - **Auto-Reconnection**: Automatically reconnects to previously connected wallets on page load
 * - **Debug Support**: Enables global debug mode for development
 * - **Error Boundaries**: Gracefully handles initialization failures
 * - **Theme Integration**: Seamlessly integrates with the theme system
 *
 * ## Configuration Options
 *
 * - `appName` (required): Your application's display name
 * - `appDescription`: Optional description for wallet prompts
 * - `appUrl`: Optional URL for your application (used in wallet prompts)
 * - `appIcon`: Optional icon URL for your application
 * - `chains`: Array of supported chains (simplified or full format)
 * - `wallets`: Wallet configuration (array, include/exclude object, or filter function)
 * - `autoInjectModal`: Whether to render modal (default: true)
 * - `debug`: Enable debug logging and development tools
 * - `projectId`: WalletConnect project ID for enhanced wallet support
 * - `theme`: Theme configuration including mode, persistence, and customization
 *
 * ## SSR Considerations
 *
 * The provider is designed to work seamlessly with SSR frameworks:
 * - Client instance creation is deferred until browser environment
 * - No hydration mismatches when rendering on server
 * - Graceful fallback for server-rendered content
 * - Compatible with Next.js, Remix, and other SSR frameworks
 * - Test environment detection for consistent testing
 *
 * @param props - Provider configuration and children
 * @param props.children - React children to render within the provider context
 * @param props.config - WalletMesh configuration options with React-specific extensions
 * @returns JSX.Element - Provider component wrapping children with WalletMesh context and theme
 *
 * @example
 * ```tsx
 * import { WalletMeshProvider } from '@walletmesh/modal-react';
 *
 * function App() {
 *   return (
 *     <WalletMeshProvider config={{
 *       appName: 'My DApp',
 *       appDescription: 'Decentralized application',
 *       chains: ['evm', 'solana'], // Simplified chain format
 *       wallets: {
 *         order: ['metamask', 'walletconnect'],
 *         exclude: ['trust']
 *       }
 *     }}>
 *       <YourApp />
 *     </WalletMeshProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With full chain configuration
 * <WalletMeshProvider config={{
 *   appName: 'Multi-Chain DApp',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *     { chainId: '137', chainType: 'evm', name: 'Polygon' },
 *     { chainId: 'mainnet-beta', chainType: 'solana', name: 'Solana' }
 *   ],
 *   wallets: { include: ['metamask', 'phantom'] },
 *   debug: process.env['NODE_ENV'] === 'development'
 * }}>
 *   <App />
 * </WalletMeshProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Disable auto-injected modal for custom UI
 * <WalletMeshProvider
 *   config={{
 *     appName: 'Custom UI DApp',
 *     autoInjectModal: false,
 *     wallets: [
 *       {
 *         id: 'custom-wallet',
 *         name: 'Custom Wallet',
 *         icon: 'data:image/svg+xml,...',
 *         chains: ['evm']
 *       }
 *     ]
 *   }}
 * >
 *   <CustomWalletModal />
 *   <App />
 * </WalletMeshProvider>
 * ```
 *
 * @example
 * ```tsx
 * // With theme configuration
 * <WalletMeshProvider
 *   config={{
 *     appName: 'Themed DApp',
 *     chains: ['evm', 'solana'],
 *     theme: {
 *       mode: 'dark',
 *       persist: true,
 *       customization: {
 *         colors: {
 *           primary: '#6366f1',
 *           background: '#0f172a'
 *         }
 *       }
 *     }
 *   }}
 * >
 *   <App />
 * </WalletMeshProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Configure auto-reconnection behavior
 * <WalletMeshProvider
 *   config={{
 *     appName: 'My DApp',
 *     chains: ['evm', 'solana']
 *   }}
 * >
 *   <App />
 * </WalletMeshProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Next.js App Router setup
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <WalletMeshProvider config={{
 *           appName: 'My Next.js DApp',
 *           appUrl: process.env.NEXT_PUBLIC_APP_URL,
 *           appIcon: '/icon.png',
 *           chains: ['evm', 'solana'],
 *           projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
 *         }}>
 *           {children}
 *         </WalletMeshProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Vite React setup with environment variables
 * import { WalletMeshProvider } from '@walletmesh/modal-react';
 *
 * const config = {
 *   appName: import.meta.env.VITE_APP_NAME || 'My Vite DApp',
 *   appDescription: 'Built with Vite and WalletMesh',
 *   appUrl: import.meta.env.VITE_APP_URL,
 *   chains: ['evm'],
 *   wallets: {
 *     include: ['metamask', 'walletconnect', 'coinbase'],
 *     order: ['metamask', 'coinbase', 'walletconnect']
 *   },
 *   debug: import.meta.env.DEV
 * };
 *
 * function App() {
 *   return (
 *     <WalletMeshProvider config={config}>
 *       <Router>
 *         <Routes>
 *           <Route path="/" element={<Home />} />
 *           <Route path="/dashboard" element={<Dashboard />} />
 *         </Routes>
 *       </Router>
 *     </WalletMeshProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With error boundary and custom error handling
 * import { WalletMeshProvider, WalletMeshErrorBoundary } from '@walletmesh/modal-react';
 *
 * export default function App() {
 *   return (
 *     <WalletMeshErrorBoundary
 *       onError={(error, errorInfo) => {
 *         // Log to error tracking service
 *       }}
 *       fallback={<ErrorFallback />}
 *     >
 *       <WalletMeshProvider config={{
 *         appName: 'Error-Safe DApp',
 *         chains: ['evm', 'solana', 'aztec'],
 *         wallets: {
 *           filter: (adapter) => adapter.readyState === 'installed'
 *         }
 *       }}>
 *         <MainApp />
 *       </WalletMeshProvider>
 *     </WalletMeshErrorBoundary>
 *   );
 * }
 * ```
 *
 * @remarks
 * This component serves as the entry point for WalletMesh integration in React applications.
 * It automatically handles the complex initialization process, including:
 *
 * - **Configuration Transformation**: Converts user-friendly config formats to internal formats
 * - **Environment Detection**: Handles SSR, browser, and test environments appropriately
 * - **State Management**: Provides centralized state management for wallet connections
 * - **Error Boundaries**: Gracefully handles and reports initialization failures
 * - **Theme Integration**: Seamlessly integrates with the theme system for consistent styling
 * - **Modal Management**: Automatically renders the connection modal unless explicitly disabled
 *
 * The provider uses a lazy loading strategy where the actual WalletMesh client is created
 * asynchronously after the component mounts. This prevents SSR hydration mismatches while
 * ensuring optimal performance in browser environments.
 *
 * For SSR applications, the provider renders immediately without the client, then initializes
 * the client during the first browser render. This pattern ensures consistent behavior across
 * different rendering environments.
 *
 * @see {@link useConnect} For connecting to wallets
 * @see {@link useAccount} For accessing account information
 * @see {@link useSwitchChain} For chain switching functionality
 * @see {@link useBalance} For balance tracking
 * @see {@link useTransaction} For transaction management
 * @see {@link WalletMeshModal} For the modal component
 * @see {@link ThemeProvider} For theme configuration
 * @see {@link WalletMeshContext} For the underlying context
 * @see {@link WalletMeshProviderProps} For configuration options
 *
 * @category Components
 * @since 1.0.0
 */
export function WalletMeshProvider({ children, config, queryClient }: WalletMeshProviderProps) {
  // Create store instance for this provider (currently unused but may be needed for future features)
  // const _store = useMemo(() => {
  //   return createWalletMeshStore();
  // }, [];

  /**
   * State for managing the async client creation process.
   *
   * Handles three key aspects:
   * 1. **Client Instance**: The actual WalletMesh client once created
   * 2. **Creation Status**: Whether client creation is in progress
   * 3. **Error Handling**: Any errors that occur during initialization
   *
   * The initial state check handles test environments where a pre-initialized
   * client may be available in the global scope for consistent testing.
   *
   * @internal
   */
  const [client, setClient] = useState<Awaited<ReturnType<typeof createWalletMesh>> | null>(() => {
    // Check for test client during initial state setup
    const isTestEnv = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test';
    if (isTestEnv && typeof global !== 'undefined' && '__TEST_WALLET_MESH_CLIENT__' in global) {
      return (
        global as typeof global & {
          __TEST_WALLET_MESH_CLIENT__: Awaited<ReturnType<typeof createWalletMesh>>;
        }
      ).__TEST_WALLET_MESH_CLIENT__;
    }

    // Return null for SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return null;
    }

    return null;
  });

  /**
   * Flag indicating whether client creation is currently in progress.
   * Used to prevent multiple simultaneous client creation attempts.
   *
   * @internal
   */
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  /**
   * Error state for client creation failures.
   * Captured during the async client creation process and exposed
   * to consumers via the context for error handling and debugging.
   *
   * @internal
   */
  const [clientError, setClientError] = useState<Error | null>(null);

  /**
   * Transforms the React configuration into the full modal-core client configuration.
   *
   * This transformation layer ensures the modal-core client receives the correct configuration
   * format while providing clean developer experience for React applications.
   *
   * ## Chain Configuration
   * - Uses explicit SupportedChain objects (no automatic chain type expansion)
   * - Supports built-in chains: ethereumMainnet, polygonMainnet, solanaMainnet, etc.
   * - Supports custom chains: { chainId: 'eip155:999999', required: false, label: 'My L2', interfaces: ['eip1193'], group: 'custom' }
   * - dApps must explicitly declare which chains they support
   *
   * ## Wallet Configuration
   * - Supports multiple wallet configuration formats:
   *   - String arrays: ['metamask', 'phantom'] → include configuration
   *   - WalletInfo arrays: Full wallet definition objects
   *   - WalletConfig objects: Include/exclude/order/filter configurations
   * - Handles TypeScript's exactOptionalPropertyTypes by cleaning undefined values
   *
   * ## Configuration Validation
   * - Ensures required fields have sensible defaults
   * - Handles optional properties correctly for TypeScript strict mode
   * - Enables rehydration for automatic wallet reconnection
   *
   * @returns Fully formed modal-core client configuration
   * @internal
   */
  // Helper function to detect chain type - memoized to prevent recreation
  const detectChainType = useCallback((supportedChain: unknown): ChainType => {
    const chain = supportedChain as { chainType?: ChainType; chainId?: string; group?: string };
    // If chainType is already defined, use it
    if (chain.chainType) {
      return chain.chainType;
    }

    // Otherwise, detect from chainId
    const chainId = String(chain.chainId || '');
    if (chainId.startsWith('eip155:')) {
      return 'evm' as ChainType;
    }
    if (chainId.includes('solana') || ['mainnet-beta', 'devnet', 'testnet'].includes(chainId)) {
      return 'solana' as ChainType;
    }
    if (chainId.includes('aztec') || chain.group === 'aztec') {
      return 'aztec' as ChainType;
    }
    // Default to evm for unknown chain formats
    return 'evm' as ChainType;
  }, []);

  const transformedConfig = useMemo(() => {
    // Transform SupportedChain[] to the format expected by modal-core
    // Convert from SupportedChain format to modal-core's internal chain format
    const transformedChains = (config.chains || []).map((supportedChain: unknown) => {
      const chain = supportedChain as { chainId?: string; label?: string; name?: string; required?: boolean };
      const chainType = detectChainType(supportedChain);

      return {
        chainId: String(chain.chainId),
        chainType,
        name: chain.label || chain.name || String(chain.chainId),
        required: chain.required || false,
      };
    });

    // Transform wallets config - only accept WalletInfo objects in arrays
    // Arrays must contain WalletInfo objects: [{id: 'metamask', name: 'MetaMask', ...}]
    let transformedWallets: WalletMeshConfig['wallets'];

    if (!config.wallets) {
      transformedWallets = undefined;
    } else if (Array.isArray(config.wallets)) {
      // Arrays should only contain WalletInfo objects
      // Pass them directly to createWalletMesh
      transformedWallets = config.wallets;
    } else {
      // Non-array wallet configurations are not supported in this context
      // This helps maintain a clean, consistent API
      transformedWallets = undefined;
    }

    // Auto-detect origin if not explicitly provided
    let detectedOrigin: string | undefined;
    if (typeof window !== 'undefined') {
      detectedOrigin = window.location.origin;
    }

    // Build appMetadata with auto-detected origin and explicit config
    const appMetadata = {
      // Use explicit origin if provided, otherwise auto-detect
      origin: config.appMetadata?.origin || detectedOrigin,
      // Use explicit name if provided, otherwise fall back to appName
      name: config.appMetadata?.name || config.appName,
      // Use explicit description if provided, otherwise fall back to appDescription
      description: config.appMetadata?.description || config.appDescription,
      // Pass through other metadata fields
      icon: config.appMetadata?.icon || config.appIcon,
      url: config.appMetadata?.url || config.appUrl,
      // Include any additional metadata fields
      ...(config.appMetadata &&
        Object.keys(config.appMetadata).reduce(
          (acc, key) => {
            if (!['origin', 'name', 'description', 'icon', 'url'].includes(key)) {
              acc[key] = config.appMetadata?.[key];
            }
            return acc;
          },
          {} as Record<string, unknown>,
        )),
    };

    // Create config object for createWalletMeshClient with exact optional property handling
    const clientConfig: {
      appName: string;
      appDescription?: string;
      appUrl?: string;
      appIcon?: string;
      appMetadata?: typeof appMetadata;
      chains: { chainId: string; chainType: ChainType; name: string; required: boolean }[];
      wallets?: Array<unknown>;
      debug?: boolean;
      projectId?: string;
      handleRehydration?: boolean;
      discovery?: typeof config.discovery;
      permissions?: typeof config.permissions;
    } = {
      appName: config['appName'] || 'DApp',
      chains: transformedChains,
      // Enable client-side rehydration for automatic wallet reconnection
      handleRehydration: true,
    };

    // Only add properties that are actually defined to satisfy exactOptionalPropertyTypes
    if (config['appDescription']) clientConfig.appDescription = config['appDescription'];
    if (config['appUrl']) clientConfig.appUrl = config['appUrl'];
    if (config['appIcon']) clientConfig.appIcon = config['appIcon'];
    if (
      appMetadata.origin ||
      appMetadata.name ||
      appMetadata.description ||
      appMetadata.icon ||
      appMetadata.url ||
      Object.keys(appMetadata).length > 5
    ) {
      clientConfig.appMetadata = appMetadata;
    }
    if (transformedWallets !== undefined) clientConfig.wallets = transformedWallets;
    if (config['debug'] !== undefined) clientConfig.debug = config['debug'];
    if (config['projectId']) clientConfig.projectId = config['projectId'];
    if (config['discovery']) clientConfig.discovery = config['discovery'];
    if (config['permissions']) clientConfig.permissions = config['permissions'];

    return clientConfig;
  }, [config, detectChainType]);

  /**
   * Creates the WalletMesh client instance asynchronously.
   *
   * This effect handles the complex client creation process with several considerations:
   *
   * ## Environment Detection
   * - **Browser Environment**: Normal client creation process
   * - **SSR Environment**: Skips creation to prevent server-side issues
   * - **Test Environment**: Uses pre-initialized test client if available
   *
   * ## Creation Safety
   * - Prevents multiple simultaneous creation attempts
   * - Handles creation errors gracefully with proper error state
   * - Logs errors in debug mode for development assistance
   *
   * ## Test Environment Support
   * - Checks for pre-initialized test clients in global scope
   * - Ensures consistent behavior across test suites
   * - Avoids unnecessary client recreation in test environments
   *
   * @internal
   */
  useEffect(() => {
    // Check if we're in a test environment - always create client for tests
    const isTestEnv = typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test';
    const hasWindow = typeof window !== 'undefined';

    if (!hasWindow && !isTestEnv) {
      // Skip client creation during SSR
      return;
    }

    // Avoid creating client multiple times
    if (client || isCreatingClient) {
      return;
    }

    // In test environment, check if we have a pre-initialized client
    if (isTestEnv && typeof global !== 'undefined' && '__TEST_WALLET_MESH_CLIENT__' in global) {
      const testClient = (
        global as typeof global & {
          __TEST_WALLET_MESH_CLIENT__: Awaited<ReturnType<typeof createWalletMesh>>;
        }
      ).__TEST_WALLET_MESH_CLIENT__;
      // Only set client if it hasn't been set during initialization
      if (!client) {
        setClient(testClient);
      }
      return;
    }

    /**
     * Internal client creation function.
     *
     * Handles the actual async creation of the WalletMesh client with proper
     * error handling and state management. This function:
     *
     * 1. **Sets Loading State**: Indicates creation is in progress
     * 2. **Clears Previous Errors**: Resets error state for retry attempts
     * 3. **Creates Client**: Calls modal-core's createWalletMesh with transformed config
     * 4. **Handles Success**: Updates client state and clears loading
     * 5. **Handles Errors**: Captures and logs errors, maintains error state
     *
     * @internal
     */
    const createClient = async () => {
      setIsCreatingClient(true);
      setClientError(null);

      try {
        const newClient = await createWalletMesh(transformedConfig as Parameters<typeof createWalletMesh>[0]);
        setClient(newClient);
      } catch (error) {
        const modalError = ErrorFactory.configurationError('Failed to create WalletMesh client');
        const clientError = error instanceof Error ? error : new Error(modalError.message);
        setClientError(clientError);

        // Log error if debug mode is enabled
        if (config['debug']) {
          const tempLogger = createComponentLogger('WalletMeshProvider', true);
          tempLogger.error('Failed to create client:', clientError);
        }
      } finally {
        setIsCreatingClient(false);
      }
    };

    createClient();
  }, [transformedConfig, client, isCreatingClient, config['debug']]);

  /**
   * Sets up global debug flag for development tools.
   *
   * When debug mode is enabled, this effect sets a global flag that enables
   * verbose logging throughout the entire WalletMesh library ecosystem. This
   * includes:
   *
   * - **Service Logging**: Detailed logs from all business logic services
   * - **State Changes**: Verbose logging of state transitions
   * - **Network Activity**: Logging of RPC calls and responses
   * - **Error Details**: Enhanced error information for debugging
   *
   * The flag is only set in browser environments to avoid SSR issues.
   *
   * @internal
   */
  useEffect(() => {
    if (config['debug'] && typeof window !== 'undefined') {
      (window as Window & { __WALLETMESH_DEBUG__?: boolean }).__WALLETMESH_DEBUG__ = true;
    }
  }, [config['debug']]);

  /**
   * Logs client creation errors for debugging purposes.
   *
   * This effect ensures that client creation failures are always logged to the
   * console, regardless of debug mode settings. This provides immediate feedback
   * to developers when initialization fails, helping with troubleshooting.
   *
   * @internal
   */
  useEffect(() => {
    if (clientError) {
      console.error('[WalletMeshProvider] Client creation failed:', clientError);
    }
  }, [clientError]);

  /**
   * Creates the React context value with client instance and normalized configuration.
   *
   * This value is memoized to prevent unnecessary re-renders of context consumers.
   * The context value includes:
   *
   * ## Client Access
   * - **client**: The initialized WalletMesh client instance (null during initialization)
   * - **config**: Normalized configuration object for consumer access
   *
   * ## Initialization State
   * - **isInitializing**: Boolean indicating whether client creation is in progress
   * - **initializationError**: Any error that occurred during client creation
   *
   * ## Configuration Normalization
   * The config provided to consumers is normalized to ensure consistent access patterns
   * regardless of the input configuration format. This includes transforming:
   * - Chain type strings to full chain objects
   * - Wallet configuration to consistent format
   * - Optional properties with proper defaults
   *
   * @returns React context value for WalletMesh consumers
   * @internal
   */
  const contextValue = useMemo(() => {
    // Transform chain configs for context
    const chainConfigs = (config.chains || []).map((chain: unknown) => {
      const chainObj = chain as {
        chainId?: string;
        name?: string;
        label?: string;
        required?: boolean;
        icon?: string;
      };
      const chainType = detectChainType(chain);

      return {
        chainId: String(chainObj.chainId || ''),
        chainType,
        name: chainObj.name || chainObj.label || String(chainObj.chainId || ''),
        required: chainObj.required || false,
        ...(chainObj.icon && { icon: chainObj.icon }),
      };
    });

    // Create core config compatible version for context consumers
    const clientConfig = {
      appName: config['appName'] || 'DApp',
      appDescription: config['appDescription'],
      appUrl: config['appUrl'],
      appIcon: config['appIcon'],
      chains: chainConfigs,
      wallets: config.wallets || [],
      debug: config['debug'],
      projectId: config['projectId'],
      permissions: config.permissions,
    };

    return {
      client,
      config: clientConfig,
      isInitializing: isCreatingClient,
      initializationError: clientError,
    };
  }, [client, config, isCreatingClient, clientError, detectChainType]);

  /**
   * State for managing QueryClient initialization.
   *
   * We need to store the QueryClient in state to handle async initialization
   * and prevent recreating it on every render during the loading phase.
   *
   * @internal
   */
  const [effectiveQueryClient, setEffectiveQueryClient] = useState<QueryClient | null>(() => {
    // If a custom QueryClient is provided, use it immediately
    if (queryClient) {
      return queryClient;
    }

    // Create a default QueryClient as initial value
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        },
        mutations: {
          retry: false, // Disable retries for tests
        },
      },
    });
  });

  /**
   * Update QueryClient when the modal-core client is ready.
   *
   * This effect attempts to get the QueryClient from the modal-core client's
   * QueryManager once initialization is complete. This ensures we use the
   * same QueryClient instance across the entire application.
   *
   * @internal
   */
  useEffect(() => {
    // Skip if using custom QueryClient
    if (queryClient) {
      if (effectiveQueryClient !== queryClient) {
        setEffectiveQueryClient(queryClient);
      }
      return;
    }

    // Skip if client not ready or has error
    if (!client || clientError || isCreatingClient) {
      return;
    }

    // Try to get QueryClient from modal-core
    try {
      const queryManager = client.getQueryManager() as QueryManager | undefined;
      const coreQueryClient = queryManager?.getQueryClient?.();

      if (coreQueryClient && coreQueryClient !== effectiveQueryClient) {
        setEffectiveQueryClient(coreQueryClient);
      }
    } catch (error) {
      if (config['debug']) {
        const tempLogger = createComponentLogger('WalletMeshProvider', true);
        tempLogger.error('Failed to get QueryClient from modal-core:', error);
      }
      // Keep using the default QueryClient on error
    }
  }, [queryClient, client, clientError, isCreatingClient, effectiveQueryClient, config['debug']]);

  /**
   * Render the provider tree with optional QueryClientProvider.
   *
   * If we have a QueryClient (either provided or from modal-core), wrap the children
   * with QueryClientProvider. Otherwise, render without it (graceful degradation).
   *
   * @internal
   */
  const renderProviders = () => {
    const content = (
      <WalletMeshContext.Provider value={contextValue}>
        {children}
        {config.autoInjectModal !== false && <WalletMeshModal />}
      </WalletMeshContext.Provider>
    );

    // Wrap with QueryClientProvider if we have a QueryClient
    if (effectiveQueryClient) {
      return <QueryClientProvider client={effectiveQueryClient}>{content}</QueryClientProvider>;
    }

    // Render without QueryClientProvider if no QueryClient available
    return content;
  };

  return (
    <ThemeProvider
      mode={config.theme?.mode || 'system'}
      persist={config.theme?.persist !== false}
      {...(config.theme?.customization && { customization: config.theme.customization })}
      {...(config.theme?.storageKey && { storageKey: config.theme.storageKey })}
      {...(config.theme?.cssPrefix && { cssPrefix: config.theme.cssPrefix })}
      disableTransitionsOnChange={config.theme?.disableTransitionsOnChange !== false}
    >
      {renderProviders()}
    </ThemeProvider>
  );
}

// Add display name for React DevTools
WalletMeshProvider.displayName = 'WalletMeshProvider';
