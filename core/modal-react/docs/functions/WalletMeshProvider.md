[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshProvider

# Function: WalletMeshProvider()

> **WalletMeshProvider**(`props`): `Element`

Defined in: [core/modal-react/src/WalletMeshProvider.tsx:298](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/WalletMeshProvider.tsx#L298)

Provider component for WalletMesh functionality.

Creates a headless WalletMesh instance and provides React-optimized state management.
Auto-injects the modal component by default with opt-out option.
Uses useSyncExternalStore for optimal React 18+ integration.

## Key Features

- **SSR-Safe**: Handles server-side rendering without hydration mismatches
- **Auto-Configuration**: Transforms simplified configs to full formats
- **Modal Management**: Automatically renders connection modal unless disabled
- **Auto-Reconnection**: Automatically reconnects to previously connected wallets on page load
- **Debug Support**: Enables global debug mode for development
- **Error Boundaries**: Gracefully handles initialization failures
- **Theme Integration**: Seamlessly integrates with the theme system

## Configuration Options

- `appName` (required): Your application's display name
- `appDescription`: Optional description for wallet prompts
- `appUrl`: Optional URL for your application (used in wallet prompts)
- `appIcon`: Optional icon URL for your application
- `chains`: Array of supported chains (simplified or full format)
- `wallets`: Wallet configuration (array, include/exclude object, or filter function)
- `autoInjectModal`: Whether to render modal (default: true)
- `debug`: Enable debug logging and development tools
- `projectId`: WalletConnect project ID for enhanced wallet support
- `theme`: Theme configuration including mode, persistence, and customization

## SSR Considerations

The provider is designed to work seamlessly with SSR frameworks:
- Client instance creation is deferred until browser environment
- No hydration mismatches when rendering on server
- Graceful fallback for server-rendered content
- Compatible with Next.js, Remix, and other SSR frameworks
- Test environment detection for consistent testing

## Parameters

### props

[`WalletMeshProviderProps`](../interfaces/WalletMeshProviderProps.md)

Provider configuration and children

## Returns

`Element`

JSX.Element - Provider component wrapping children with WalletMesh context and theme

## Examples

```tsx
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{
      appName: 'My DApp',
      appDescription: 'Decentralized application',
      chains: ['evm', 'solana'], // Simplified chain format
      wallets: {
        order: ['metamask', 'walletconnect'],
        exclude: ['trust']
      }
    }}>
      <YourApp />
    </WalletMeshProvider>
  );
}
```

```tsx
// With full chain configuration
<WalletMeshProvider config={{
  appName: 'Multi-Chain DApp',
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' },
    { chainId: '137', chainType: 'evm', name: 'Polygon' },
    { chainId: 'mainnet-beta', chainType: 'solana', name: 'Solana' }
  ],
  wallets: { include: ['metamask', 'phantom'] },
  debug: process.env['NODE_ENV'] === 'development'
}}>
  <App />
</WalletMeshProvider>
```

```tsx
// Disable auto-injected modal for custom UI
<WalletMeshProvider
  config={{
    appName: 'Custom UI DApp',
    autoInjectModal: false,
    wallets: [
      {
        id: 'custom-wallet',
        name: 'Custom Wallet',
        icon: 'data:image/svg+xml,...',
        chains: ['evm']
      }
    ]
  }}
>
  <CustomWalletModal />
  <App />
</WalletMeshProvider>
```

```tsx
// With theme configuration
<WalletMeshProvider
  config={{
    appName: 'Themed DApp',
    chains: ['evm', 'solana'],
    theme: {
      mode: 'dark',
      persist: true,
      customization: {
        colors: {
          primary: '#6366f1',
          background: '#0f172a'
        }
      }
    }
  }}
>
  <App />
</WalletMeshProvider>
```

```tsx
// Configure auto-reconnection behavior
<WalletMeshProvider
  config={{
    appName: 'My DApp',
    chains: ['evm', 'solana']
  }}
>
  <App />
</WalletMeshProvider>
```

```tsx
// Next.js App Router setup
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <WalletMeshProvider config={{
          appName: 'My Next.js DApp',
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
          appIcon: '/icon.png',
          chains: ['evm', 'solana'],
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
        }}>
          {children}
        </WalletMeshProvider>
      </body>
    </html>
  );
}
```

```tsx
// Vite React setup with environment variables
import { WalletMeshProvider } from '@walletmesh/modal-react';

const config = {
  appName: import.meta.env.VITE_APP_NAME || 'My Vite DApp',
  appDescription: 'Built with Vite and WalletMesh',
  appUrl: import.meta.env.VITE_APP_URL,
  chains: ['evm'],
  wallets: {
    include: ['metamask', 'walletconnect', 'coinbase'],
    order: ['metamask', 'coinbase', 'walletconnect']
  },
  debug: import.meta.env.DEV
};

function App() {
  return (
    <WalletMeshProvider config={config}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </WalletMeshProvider>
  );
}
```

```tsx
// With error boundary and custom error handling
import { WalletMeshProvider, WalletMeshErrorBoundary } from '@walletmesh/modal-react';

export default function App() {
  return (
    <WalletMeshErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error tracking service
      }}
      fallback={<ErrorFallback />}
    >
      <WalletMeshProvider config={{
        appName: 'Error-Safe DApp',
        chains: ['evm', 'solana', 'aztec'],
        wallets: {
          filter: (adapter) => adapter.readyState === 'installed'
        }
      }}>
        <MainApp />
      </WalletMeshProvider>
    </WalletMeshErrorBoundary>
  );
}
```

## Remarks

This component serves as the entry point for WalletMesh integration in React applications.
It automatically handles the complex initialization process, including:

- **Configuration Transformation**: Converts user-friendly config formats to internal formats
- **Environment Detection**: Handles SSR, browser, and test environments appropriately
- **State Management**: Provides centralized state management for wallet connections
- **Error Boundaries**: Gracefully handles and reports initialization failures
- **Theme Integration**: Seamlessly integrates with the theme system for consistent styling
- **Modal Management**: Automatically renders the connection modal unless explicitly disabled

The provider uses a lazy loading strategy where the actual WalletMesh client is created
asynchronously after the component mounts. This prevents SSR hydration mismatches while
ensuring optimal performance in browser environments.

For SSR applications, the provider renders immediately without the client, then initializes
the client during the first browser render. This pattern ensures consistent behavior across
different rendering environments.

## See

 - [useConnect](useConnect.md) For connecting to wallets
 - [useAccount](useAccount.md) For accessing account information
 - [useSwitchChain](useSwitchChain.md) For chain switching functionality
 - [useBalance](useBalance.md) For balance tracking
 - [useTransaction](useTransaction.md) For transaction management
 - [WalletMeshModal](WalletMeshModal.md) For the modal component
 - [ThemeProvider](ThemeProvider.md) For theme configuration
 - WalletMeshContext For the underlying context
 - [WalletMeshProviderProps](../interfaces/WalletMeshProviderProps.md) For configuration options

## Since

1.0.0
