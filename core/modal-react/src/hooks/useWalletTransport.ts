/**
 * Wallet transport access hook for WalletMesh
 *
 * Provides direct access to the underlying wallet transport for advanced
 * JSON-RPC operations and custom protocol implementations.
 *
 * @module hooks/useWalletTransport
 */

import { ChainType } from '@walletmesh/modal-core';
import { useRef } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { shallowEqual, useStore } from './internal/useStore.js';

/**
 * Wallet transport interface for low-level communication
 *
 * @public
 */
export interface WalletTransport {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  request<T = unknown>(request: { method: string; params?: unknown }): Promise<T>;
  getCapabilities(): Promise<unknown>;
  isConnected(): boolean;
  getSessionId(): string | undefined;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
}

/**
 * Wallet transport information
 *
 * @public
 */
export interface WalletTransportInfo {
  /** The wallet transport instance */
  transport: WalletTransport | null;
  /** Whether transport is available */
  isAvailable: boolean;
  /** Whether currently connecting */
  isConnecting: boolean;
  /** Current session ID */
  sessionId: string | null;
  /** Wallet ID providing this transport */
  walletId: string | null;
  /** Connection error if any */
  error: Error | null;
}

/**
 * Hook for accessing the raw wallet transport
 *
 * Returns the underlying transport layer for direct JSON-RPC communication,
 * bypassing provider abstractions. This is useful for advanced use cases
 * where you need custom RPC methods or direct protocol access.
 *
 * @returns Wallet transport information
 *
 * @since 1.0.0
 *
 * @remarks
 * Direct transport access is for advanced users who need:
 * - Custom RPC methods not exposed by standard providers
 * - Direct protocol-level communication
 * - Custom serialization/deserialization
 * - Bypassing provider abstractions for performance
 *
 * For standard blockchain operations, use provider adapters instead.
 *
 * @example
 * ```tsx
 * import { useWalletTransport } from '@walletmesh/modal-react';
 *
 * function CustomRPCExample() {
 *   const { transport, isAvailable } = useWalletTransport();
 *
 *   const callCustomMethod = async () => {
 *     if (!transport) return;
 *
 *     // Direct RPC call with custom method
 *     const result = await transport.request({
 *       method: 'wallet_customMethod',
 *       params: { custom: 'data' },
 *       chainId: 'custom-chain',
 *     });
 *
 *     console.log('Custom result:', result);
 *   };
 *
 *   return (
 *     <button onClick={callCustomMethod} disabled={!isAvailable}>
 *       Call Custom Method
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Get wallet capabilities
 * function WalletCapabilities() {
 *   const { transport, isAvailable } = useWalletTransport();
 *   const [capabilities, setCapabilities] = useState(null);
 *
 *   useEffect(() => {
 *     if (!transport) return;
 *
 *     transport.getCapabilities().then(caps => {
 *       setCapabilities(caps);
 *       console.log('Supported methods:', caps.methods);
 *       console.log('Provider types:', caps.providerTypes);
 *       console.log('Chains:', caps.chains);
 *     });
 *   }, [transport]);
 *
 *   if (!isAvailable) {
 *     return <div>Connect wallet to see capabilities</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h3>Wallet Capabilities</h3>
 *       <pre>{JSON.stringify(capabilities, null, 2)}</pre>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Subscribe to transport events
 * function TransportEventListener() {
 *   const { transport } = useWalletTransport();
 *
 *   useEffect(() => {
 *     if (!transport) return;
 *
 *     const handleAccountsChanged = (accounts: string[]) => {
 *       console.log('Accounts changed:', accounts);
 *     };
 *
 *     const handleChainChanged = (chainId: string) => {
 *       console.log('Chain changed:', chainId);
 *     };
 *
 *     transport.on('accountsChanged', handleAccountsChanged);
 *     transport.on('chainChanged', handleChainChanged);
 *
 *     return () => {
 *       transport.off('accountsChanged', handleAccountsChanged);
 *       transport.off('chainChanged', handleChainChanged);
 *     };
 *   }, [transport]);
 *
 *   return <div>Listening to transport events...</div>;
 * }
 * ```
 *
 * @public
 */
export function useWalletTransport(): WalletTransportInfo {
  const { client } = useWalletMeshContext();
  const prevTransportRef = useRef<WalletTransport | null>(null);
  const prevWalletIdRef = useRef<string | null>(null);

  type ConnectionStateType = {
    sessionId: string | null;
    walletId: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: { message: string } | null;
  };

  const prevStateRef = useRef<ConnectionStateType | null>(null);

  // More selective state subscription
  const connectionState = useStore((state) => {
    const activeSession = state.active.sessionId ? state.entities.sessions[state.active.sessionId] : null;

    const newState: ConnectionStateType = {
      sessionId: activeSession?.sessionId || null,
      walletId: activeSession?.walletId || null,
      isConnected: activeSession?.status === 'connected',
      isConnecting: state.ui.currentView === 'connecting',
      // Only track first error for simplicity
      error: Object.values(state.ui.errors || {})[0] || null,
    };

    // Use shallow equality to prevent unnecessary re-renders
    if (prevStateRef.current && shallowEqual(prevStateRef.current, newState)) {
      return prevStateRef.current;
    }

    prevStateRef.current = newState;
    return newState;
  });

  // Return cached transport if wallet hasn't changed
  if (
    connectionState.walletId === prevWalletIdRef.current &&
    prevTransportRef.current &&
    connectionState.isConnected
  ) {
    return {
      transport: prevTransportRef.current,
      isAvailable: true,
      isConnecting: connectionState.isConnecting,
      sessionId: connectionState.sessionId,
      walletId: connectionState.walletId,
      error: connectionState.error ? new Error(connectionState.error.message) : null,
    };
  }

  // Only fetch new transport when wallet changes or on initial connection
  let transport: WalletTransport | null = null;
  let fetchError: Error | null = null;

  if (client && connectionState.walletId && connectionState.isConnected) {
    try {
      // Get the connected wallet adapter
      const walletAdapter = client.getWalletAdapter(connectionState.walletId);
      if (!walletAdapter) {
        fetchError = new Error('Wallet adapter not found');
      } else {
        // Get the JSON-RPC transport from the adapter
        // We'll use ChainType.Evm as default for now
        transport =
          (walletAdapter.getJSONRPCTransport?.(ChainType.Evm) as WalletTransport | undefined) || null;
      }
    } catch (error) {
      fetchError = error instanceof Error ? error : new Error('Failed to get transport');
    }
  }

  // Update cache
  if (transport !== prevTransportRef.current || connectionState.walletId !== prevWalletIdRef.current) {
    prevTransportRef.current = transport;
    prevWalletIdRef.current = connectionState.walletId;
  }

  return {
    transport,
    isAvailable: Boolean(transport),
    isConnecting: connectionState.isConnecting,
    sessionId: connectionState.sessionId,
    walletId: connectionState.walletId,
    error: fetchError || (connectionState.error ? new Error(connectionState.error.message) : null),
  };
}
