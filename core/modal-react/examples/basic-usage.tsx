/**
 * Basic Usage Example for WalletMesh React
 *
 * This example demonstrates the simplest way to integrate WalletMesh
 * into a React application with minimal configuration.
 */

import { ConnectButton, WalletMeshProvider } from '@walletmesh/modal-react';

/**
 * Example 1: Minimal Setup
 * The simplest way to add wallet connection to your app
 */
export function MinimalExample() {
  return (
    <WalletMeshProvider config={{ appName: 'My DApp' }}>
      <div style={{ padding: '20px' }}>
        <h1>Welcome to My DApp</h1>
        <ConnectButton />
      </div>
    </WalletMeshProvider>
  );
}

/**
 * Example 2: With Chain Configuration
 * Configure specific blockchain networks
 */
export function WithChainsExample() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Multi-Chain DApp',
        chains: ['evm', 'solana'], // Support EVM and Solana chains
      }}
    >
      <div style={{ padding: '20px' }}>
        <h1>Multi-Chain DApp</h1>
        <ConnectButton showChain /> {/* Show current chain */}
      </div>
    </WalletMeshProvider>
  );
}

/**
 * Example 3: Custom Connect Button
 * Customize the appearance and behavior of the connect button
 */
export function CustomButtonExample() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Custom Styled DApp',
        appDescription: 'A beautifully styled decentralized application',
      }}
    >
      <div style={{ padding: '20px' }}>
        <h1>Custom Styled DApp</h1>

        {/* Primary large button with address display */}
        <ConnectButton
          size="lg"
          variant="primary"
          showAddress
          showChain
          label="Connect Your Wallet"
          disconnectLabel="Sign Out"
        />

        <div style={{ marginTop: '10px' }}>
          {/* Secondary outline button */}
          <ConnectButton size="md" variant="outline" label="Link Wallet" />
        </div>
      </div>
    </WalletMeshProvider>
  );
}

/**
 * Example 4: With App Metadata
 * Provide full app metadata for better wallet integration
 */
export function WithMetadataExample() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'DeFi Protocol',
        appDescription: 'The next generation DeFi protocol',
        appUrl: 'https://mydefi.app',
        appIcon:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzRGNDZFNSIvPgogIDxwYXRoIGQ9Ik0xMiA5SDE0VjE3SDEyVjlaTTEyIDE5SDE0VjIxSDEyVjE5WiIgZmlsbD0id2hpdGUiLz4KICA8cGF0aCBkPSJNMTggOUgyMFYxN0gxOFY5Wk0xOCAxOUgyMFYyMUgxOFYxOVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        projectId: 'your-project-id', // Optional WalletConnect project ID
      }}
    >
      <div style={{ padding: '20px' }}>
        <h1>DeFi Protocol</h1>
        <p>Your wallet will see our app metadata for a better experience</p>
        <ConnectButton />
      </div>
    </WalletMeshProvider>
  );
}

/**
 * Example 5: Disable Auto-Injected Modal
 * Use your own modal UI instead of the built-in one
 */
export function CustomModalExample() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Custom UI DApp',
        autoInjectModal: false, // Don't inject the default modal
      }}
    >
      <div style={{ padding: '20px' }}>
        <h1>Custom Modal UI</h1>
        <p>This example uses a custom modal (not shown)</p>
        <ConnectButton />
        {/* You would implement your own modal here */}
      </div>
    </WalletMeshProvider>
  );
}

/**
 * Example 6: Debug Mode
 * Enable debug logging for development
 */
export function DebugModeExample() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Debug DApp',
        debug: true, // Enable debug logging
      }}
    >
      <div style={{ padding: '20px' }}>
        <h1>Debug Mode Enabled</h1>
        <p>Check the console for detailed logs</p>
        <ConnectButton />
      </div>
    </WalletMeshProvider>
  );
}
