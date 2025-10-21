/**
 * Mock WalletMeshProvider for Testing
 *
 * This is a lightweight mock provider that provides WalletMesh context
 * without initializing the heavy modal-core client. Used in tests to
 * prevent out-of-memory issues while still providing the necessary
 * context for hooks to function.
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../theme/ThemeContext.js';
import { WalletMeshContext } from '../WalletMeshContext.js';
import type { WalletMeshReactConfig } from '../types.js';

// Import the client type for proper typing
type WalletMeshClient = Awaited<ReturnType<typeof import('@walletmesh/modal-core').createWalletMesh>>;

export interface MockWalletMeshProviderProps {
  children: ReactNode;
  config?: Partial<WalletMeshReactConfig>;
  mockClient?: WalletMeshClient;
}

/**
 * Mock provider that provides WalletMesh context without heavy initialization
 *
 * This component:
 * - Provides the WalletMeshContext with a mock client
 * - Skips all heavy initialization (createWalletMesh, chain providers, etc.)
 * - Uses the global test client if available
 * - Wraps children in QueryClientProvider and ThemeProvider
 * - Zero memory overhead compared to real provider
 *
 * @param props - Component props
 * @param props.children - React children to render
 * @param props.config - Optional config override (merged with defaults)
 * @param props.mockClient - Optional mock client override
 */
export function MockWalletMeshProvider({
  children,
  config = {},
  mockClient,
}: MockWalletMeshProviderProps) {
  // Use provided mock client or get from global test scope
  const client = useMemo((): WalletMeshClient | null => {
    if (mockClient) {
      return mockClient;
    }

    // Check for global test client
    if (typeof global !== 'undefined' && '__TEST_WALLET_MESH_CLIENT__' in global) {
      return (global as { __TEST_WALLET_MESH_CLIENT__: WalletMeshClient }).__TEST_WALLET_MESH_CLIENT__;
    }

    // Return null if no mock client available
    return null;
  }, [mockClient]);

  // Create minimal config with defaults
  const normalizedConfig: WalletMeshReactConfig = useMemo(
    () => ({
      appName: 'Test App',
      appDescription: 'Test Application',
      autoInjectModal: false, // Never inject modal in tests
      chains: [],
      wallets: [],
      debug: false,
      ...config,
    }),
    [config],
  );

  // Create a lightweight query client for tests
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false, // Disable retries in tests
            gcTime: 0, // Disable garbage collection time
            staleTime: 0,
          },
          mutations: {
            retry: false,
          },
        },
      }),
    [],
  );

  // Provide context value matching the real provider's interface
  const contextValue = useMemo(
    () => ({
      client,
      config: normalizedConfig,
      isInitializing: false,
      initializationError: null,
    }),
    [client, normalizedConfig],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        mode={normalizedConfig.theme?.mode || 'system'}
        persist={normalizedConfig.theme?.persist !== false}
        customization={normalizedConfig.theme?.customization || {}}
      >
        <WalletMeshContext.Provider value={contextValue}>{children}</WalletMeshContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
