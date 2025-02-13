import React from "react";
import { Toaster } from "react-hot-toast";
import type { WalletMeshProviderConfig } from "../lib/config/WalletMeshConfig.js";
import { WalletErrorBoundary } from "./WalletErrorBoundary.js";
import { WalletContext } from "./WalletContext.js";
import { WalletModal } from "./WalletModal/WalletModal.js";
import { useWalletLogic } from "../hooks/useWalletLogic.js";

/**
 * Props for the WalletProvider component
 * @interface WalletProviderProps
 * @property {React.ReactNode} children - Child components to render inside the provider
 * @property {WalletMeshProviderConfig} config - WalletMesh configuration including wallet and dapp settings
 * @property {(error: Error) => void} [onError] - Optional error handler for wallet-related errors
 */
interface WalletProviderProps {
  children: React.ReactNode;
  config: WalletMeshProviderConfig;
  onError?: (error: Error) => void;
}

/**
 * Provider component that enables wallet integration in a React application
 * @component WalletProvider
 * @description This component wraps your application and provides wallet
 * connectivity features through React Context. It handles wallet connections,
 * state management, and renders the wallet selection modal.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const config = WalletMeshConfig.create()
 *   .addWallet({
 *     id: "my_wallet",
 *     name: "My Wallet",
 *     adapter: { type: AdapterType.WalletMeshAztec },
 *     transport: { type: TransportType.PostMessage }
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
 * 
 * @param {WalletProviderProps} props - Component props
 * @returns {JSX.Element} Provider component with modal and error handling
 */
export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  config,
  onError,
}) => {
  // Extract configuration
  const { wallets, dappInfo } = config;
  
  // Initialize wallet connection logic
  const walletLogic = useWalletLogic();

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    ...walletLogic, // Wallet connection state and methods
    wallets,        // Available wallet configurations
    dappInfo,       // DApp information
  }), [walletLogic, wallets, dappInfo]);

  return (
    <WalletErrorBoundary onError={onError}>
      <WalletContext.Provider value={contextValue}>
        {children}
        <WalletModal />
        <Toaster position="bottom-right" />
      </WalletContext.Provider>
    </WalletErrorBoundary>
  );
};

WalletProvider.displayName = "WalletProvider";
