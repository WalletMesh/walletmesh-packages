import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import type { WalletMeshProviderConfig } from "../lib/config/ModalConfig.js";
import { WalletErrorBoundary } from "./WalletErrorBoundary.js";
import { WalletContext } from "./WalletContext.js";
import { WalletSelectionDialog } from "./WalletModal/WalletSelectionDialog.js";
import { WalletConnectedDialog } from "./WalletModal/WalletConnectedDialog.js";
import { useWallet } from "../hooks/useWallet.js";

/**
 * Props for the WalletProvider component
 * @interface WalletProviderProps
 * @property {React.ReactNode} children - Child components to render inside the provider
 * @property {WalletMeshProviderConfig} config - WalletMesh configuration including wallet and dapp settings
 * @property {(error: Error) => void} [onError] - Optional error handler for wallet-related errors
 */
export interface WalletProviderProps {
  children: React.ReactNode;
  config: WalletMeshProviderConfig;
  onError?: (error: Error) => void;
}

/**
 * Provider component that enables wallet integration in a React application.
 * This component wraps your application and provides wallet connectivity features 
 * through React Context. It handles wallet connections, state management, and 
 * renders the wallet selection modal. Supports configurable timeouts for wallet 
 * operations.
 * 
 * @example
 * ```tsx
 * // Basic usage with timeouts
 * const config = WalletMeshConfig.create()
 *   .addWallet({
 *     id: "my_wallet",
 *     name: "My Wallet",
 *     adapter: { type: AdapterType.WalletMeshAztec },
 *     transport: { type: TransportType.PostMessage }
 *   })
 *   .setTimeout({
 *     connectionTimeout: 30000, // 30s for initial connections
 *     operationTimeout: 10000   // 10s for other operations
 *   })
 *   .setDappInfo({
 *     name: "My DApp",
 *     description: "A decentralized application",
 *     origin: "https://mydapp.com"
 *   })
 *   .build();
 * 
 * function App() {
 *   return (
 *     <WalletProvider config={config} onError={console.error}>
 *       <YourApp />
 *     </WalletProvider>
 *   );
 * }
 * ```
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  config,
  onError,
}) => {
  const { wallets, dappInfo, timeoutConfig } = config;
  
  // Initialize wallet connection logic with dappInfo
  const walletLogic = useWallet({
    dappInfo,
    ...(timeoutConfig && { timeoutConfig })
  });

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    ...walletLogic, // Wallet connection state and methods
    wallets,        // Available wallet configurations
    dappInfo,       // DApp information
  }), [walletLogic, wallets, dappInfo]);

  // Debug log for context updates
  useEffect(() => {
    console.log('[WalletProvider] Context value updated:', {
      isSelectModalOpen: contextValue.isSelectModalOpen,
      connectionStatus: contextValue.connectionStatus,
      hasConnectedWallet: !!contextValue.connectedWallet
    });
  }, [contextValue]);

  return (
    <WalletErrorBoundary onError={onError}>
      <WalletContext.Provider value={contextValue}>
        {children}
        <WalletSelectionDialog />
      <WalletConnectedDialog />
        <Toaster position="bottom-right" />
      </WalletContext.Provider>
    </WalletErrorBoundary>
  );
};

WalletProvider.displayName = "WalletProvider";
