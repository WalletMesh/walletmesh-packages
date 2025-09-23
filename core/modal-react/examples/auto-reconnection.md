# Auto-Reconnection Examples

This document provides examples of how to use the auto-reconnection feature in `@walletmesh/modal-react`.

## Basic Auto-Reconnection

By default, auto-reconnection is enabled. When users refresh the page or navigate back to your dApp, their previously connected wallet will automatically reconnect if possible.

```tsx
import { WalletMeshProvider, useAccount } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{
      appName: 'My DApp',
      chains: ['evm', 'solana'],
      // Auto-reconnection is enabled by default
    }}>
      <MyApp />
    </WalletMeshProvider>
  );
}

function MyApp() {
  const { isConnected, address, wallet } = useAccount();

  return (
    <div>
      {isConnected ? (
        <div>
          <h2>Welcome back!</h2>
          <p>Connected to {wallet?.name}</p>
          <p>Address: {address}</p>
        </div>
      ) : (
        <div>
          <p>Please connect your wallet</p>
        </div>
      )}
    </div>
  );
}
```

## Custom Auto-Reconnection Configuration

You can customize the auto-reconnection behavior:

```tsx
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{
      appName: 'My DApp',
      chains: ['evm'],
      autoReconnect: true,
      reconnectOptions: {
        timeout: 10000,           // 10 second timeout per attempt
        maxAttempts: 5,           // Try up to 5 times
        retryDelay: 2000,         // 2 second delay between attempts
        useExponentialBackoff: true,  // Increase delay exponentially
        showProgress: true,       // Show progress to user
        storageKey: 'my-app-sessions', // Custom storage key
      },
      debug: true, // Enable debug logging
    }}>
      <MyApp />
    </WalletMeshProvider>
  );
}
```

## Disabling Auto-Reconnection

If you prefer to handle reconnection manually:

```tsx
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider config={{
      appName: 'My DApp',
      chains: ['evm'],
      autoReconnect: false, // Disable auto-reconnection
    }}>
      <MyApp />
    </WalletMeshProvider>
  );
}
```

## Manual Reconnection Control

You can also manually control the reconnection process using the `useAutoReconnect` hook:

```tsx
import { 
  WalletMeshProvider, 
  useAutoReconnect, 
  useAccount 
} from '@walletmesh/modal-react';

function MyApp() {
  const { isConnected } = useAccount();
  const { 
    reconnectState, 
    cancelReconnect, 
    retryReconnect 
  } = useAutoReconnect({
    enabled: true,
    maxAttempts: 3,
    onReconnectStart: (session) => {
      console.log('Reconnecting to:', session.wallet.name);
    },
    onReconnectSuccess: (session) => {
      console.log('Successfully reconnected!');
    },
    onReconnectFailure: (session, error) => {
      console.error('Reconnection failed:', error.message);
    },
  });

  if (reconnectState.isReconnecting) {
    return (
      <div>
        <h3>Reconnecting...</h3>
        <p>Attempt {reconnectState.attemptCount} of {reconnectState.maxAttempts}</p>
        <p>Connecting to {reconnectState.targetSession?.wallet.name}</p>
        <button onClick={cancelReconnect}>Cancel</button>
      </div>
    );
  }

  if (reconnectState.error && !reconnectState.wasSuccessful) {
    return (
      <div>
        <h3>Reconnection Failed</h3>
        <p>Error: {reconnectState.error.message}</p>
        <button onClick={retryReconnect}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {isConnected ? (
        <p>Connected!</p>
      ) : (
        <p>Not connected</p>
      )}
    </div>
  );
}

function App() {
  return (
    <WalletMeshProvider config={{
      appName: 'Manual Reconnect DApp',
      chains: ['evm'],
      autoReconnect: false, // Disable automatic reconnection
    }}>
      <MyApp />
    </WalletMeshProvider>
  );
}
```

## How Auto-Reconnection Works

1. **Session Persistence**: When you connect to a wallet, the session information is automatically saved to localStorage
2. **Page Load Detection**: When your dApp loads, it checks for previously saved sessions
3. **Wallet Availability**: It verifies that the wallet is still available (installed/accessible)
4. **Automatic Connection**: If a valid session exists, it automatically attempts to reconnect
5. **Graceful Fallback**: If reconnection fails, the user can manually connect again

## Best Practices

1. **Enable Debug Mode**: During development, enable `debug: true` to see reconnection logs
2. **Handle Loading States**: Show appropriate loading indicators during reconnection
3. **Provide Fallbacks**: Always provide a manual connection option if auto-reconnection fails
4. **Test Edge Cases**: Test with wallet extensions disabled, different browsers, etc.
5. **Respect User Choice**: Consider providing a setting to disable auto-reconnection for users who prefer manual control

## Security Considerations

- Auto-reconnection only restores the connection state, not private keys or sensitive data
- Sessions are validated before attempting reconnection
- Failed reconnections don't expose any sensitive information
- Users can always manually disconnect if they don't want auto-reconnection