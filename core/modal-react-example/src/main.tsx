// Clear any old persisted wallet data from localStorage
// This ensures we start fresh without phantom wallets
if (window?.localStorage) {
  const storeKey = 'walletmesh-store';
  if (localStorage.getItem(storeKey)) {
    localStorage.removeItem(storeKey);
  }
}

import { formatError } from '@walletmesh/modal-core';
import {
  arbitrumOne,
  baseMainnet,
  ethereumMainnet,
  ethereumSepolia,
  optimismMainnet,
  polygonMainnet,
  solanaDevnet,
  solanaMainnet,
  WalletMeshErrorBoundary,
  WalletMeshProvider,
} from '@walletmesh/modal-react/all';
// Import test wallets from testing module
// Note: AztecExampleWalletAdapter removed temporarily to fix build
import { DebugWallet } from '@walletmesh/modal-react/testing';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';

// Example custom chain (commented out)
// const myCustomChain = {
//   chainId: 'eip155:999999',
//   required: false,
//   label: 'My Custom Layer 2',
//   interfaces: ['eip1193'],
//   group: 'custom'
// };

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <WalletMeshErrorBoundary
      onError={(error, errorInfo) => {
        // In a real app, you might send this to an error tracking service
        console.error('WalletMesh Error Boundary:', {
          message: formatError(error).message,
          stack: error instanceof Error ? error.stack : undefined,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <WalletMeshProvider
        config={{
          appName: 'WalletMesh Example',
          appDescription: 'Example app demonstrating WalletMesh React integration',
          appUrl: 'http://localhost:1234',
          // Explicitly declare supported chains (wagmi-style)
          chains: [
            // EVM chains the dApp supports
            ethereumMainnet,
            ethereumSepolia,
            polygonMainnet,
            arbitrumOne,
            optimismMainnet,
            baseMainnet,
            // Solana chains
            solanaMainnet,
            solanaDevnet,
          ],
          // Use wallet configuration with test wallet info
          wallets: [
            // Include test wallets for development
            DebugWallet.getWalletInfo(),
            // AztecExampleWalletAdapter temporarily removed to fix build
          ],
          autoInjectModal: true,
          debug: true, // Enable debug logging
          theme: {
            mode: 'system', // Default to system preference
            persist: true, // Save theme preference in localStorage
            storageKey: 'walletmesh-example-theme',
            customization: {
              // Example customizations - users can see these in the demo
              colors: {
                primary: '#4f46e5', // Indigo
                accent: '#06b6d4', // Cyan
              },
              animation: {
                duration: {
                  fast: '150ms',
                  normal: '250ms',
                  slow: '400ms',
                },
              },
            },
          },
        }}
      >
        <App />
      </WalletMeshProvider>
    </WalletMeshErrorBoundary>
  </StrictMode>,
);
