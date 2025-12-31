[**@walletmesh/modal-react v0.1.2**](README.md)

***

# @walletmesh/modal-react v0.1.2

WalletMesh React Integration - Simplified Web3 Connection Library

A streamlined React library for integrating Web3 wallet connections.
Built on top of @walletmesh/modal-core with React-specific enhancements.

## Architecture Overview

- ✨ **10 Core Hooks**: Simplified from 20+ hooks for easier usage
- 🏗️ **Production Ready**: Error boundaries, automatic recovery, robust session management
- 🔄 **Session-Based**: Built on modern SessionState architecture
- 📦 **Single Import**: All modal-core functionality re-exported
- 🌐 **SSR-Ready**: Full server-side rendering support
- 🎨 **Customizable**: CSS modules, themes, and custom components
- 🔒 **Secure**: Sandboxed icons and CSP-compliant

## Quick Start

```tsx
import { WalletMeshProvider, useAccount, useConnect, useTheme } from '@walletmesh/modal-react';

function App() {
  const { isConnected, address, wallet } = useAccount();
  const { connect, disconnect } = useConnect();
  const { theme, toggleTheme } = useTheme();

  return (
    <WalletMeshProvider config={{
      appName: 'My DApp',
      chains: ['evm', 'solana'],
      wallets: { order: ['metamask', 'phantom'] },
      theme: {
        mode: 'system',
        persist: true
      }
    }}>
      <button onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'} Toggle Theme
      </button>
      {isConnected ? (
        <div>
          <p>Connected to {wallet?.name}</p>
          <p>Address: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </WalletMeshProvider>
  );
}
```

## Core Hooks (10)

### Connection & Account Management
- `useAccount` - Account state, wallet selection, and connection info
- `useConnect` - Connection and disconnection management
- `usePublicProvider` - dApp RPC provider for read operations
- `useWalletProvider` - Wallet RPC provider for write operations

### Chain & Transaction Management
- `useSwitchChain` - Chain switching with validation and ensurance
- `useBalance` - Token balance queries
- `useTransaction` - Multi-chain transactions

### UI & Configuration
- `useConfig` - Modal control and configuration
- `useTheme` - Theme management
- `useWalletEvents` - Event subscriptions
- `useSSR` - Server-side rendering utilities

## API

- [createWalletMesh](functions/createWalletMesh.md)

## Components

- [WalletMeshErrorBoundary](classes/WalletMeshErrorBoundary.md)
- [WalletMeshConnectButton](functions/WalletMeshConnectButton.md)
- [WalletMeshProvider](functions/WalletMeshProvider.md)

## Hooks

- [useErrorBoundary](functions/useErrorBoundary.md)

## Other

### CoreSessionStatus

Renames and re-exports [SessionStatus](type-aliases/SessionStatus.md)

***

### TransactionResult

Renames and re-exports [CoreTransactionResult](interfaces/CoreTransactionResult.md)

## Types

- [ChromeExtensionConfig](interfaces/ChromeExtensionConfig.md)
- [ConnectionInfo](interfaces/ConnectionInfo.md)
- [Disposable](interfaces/Disposable.md)
- [PopupConfig](interfaces/PopupConfig.md)
- [TransportConfig](interfaces/TransportConfig.md)
- [WalletMetadata](interfaces/WalletMetadata.md)
- [SupportedChainsConfig](type-aliases/SupportedChainsConfig.md)

## Utilities

- [deserializeState](variables/deserializeState.md)
- [serializeState](variables/serializeState.md)
- [createComponentLogger](functions/createComponentLogger.md)
- [getReactLogger](functions/getReactLogger.md)
- [isSessionError](functions/isSessionError.md)
