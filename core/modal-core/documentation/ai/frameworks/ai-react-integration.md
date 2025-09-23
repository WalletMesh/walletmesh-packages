# WalletMesh React Integration Guide for AI Agents

This guide provides AI-specific instructions for integrating WalletMesh with React applications.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [React Hooks](#react-hooks)
3. [Component Patterns](#component-patterns)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)

## Basic Integration

### Installation Setup

```typescript
// 1. Install dependencies
// npm install @walletmesh/modal-core @walletmesh/modal-react

// 2. Import components
import { 
  WalletProvider,
  useWallet,
  useWalletState
} from '@walletmesh/modal-react';
```

### Provider Setup

```typescript
// App.tsx
import { WalletProvider } from '@walletmesh/modal-react';

const App: React.FC = () => {
  const config = {
    chains: [ChainType.ETHEREUM],
    theme: 'light',
    defaultProvider: ProviderInterface.EIP1193
  };

  return (
    <WalletProvider config={config}>
      <YourApp />
    </WalletProvider>
  );
};
```

## React Hooks

### useWallet Hook

```typescript
// Custom hook example
function WalletConnect() {
  const {
    connect,
    disconnect,
    switchChain
  } = useWallet();

  const handleConnect = React.useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      // Handle error
    }
  }, [connect]);

  return (
    <button onClick={handleConnect}>
      Connect Wallet
    </button>
  );
}
```

### useWalletState Hook

```typescript
function WalletStatus() {
  const {
    status,
    account,
    chainId,
    error
  } = useWalletState();

  // Implement strict equality checks for state changes
  const isConnected = status === 'connected';
  const hasError = Boolean(error);

  return (
    <div>
      <div>Status: {status}</div>
      {isConnected && <div>Account: {account}</div>}
      {hasError && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## Component Patterns

### Connection Button

```typescript
// Smart connection button with loading and error states
const WalletButton: React.FC = () => {
  const { connect, disconnect } = useWallet();
  const { status, error } = useWalletState();

  // Stable callback references
  const handleClick = React.useCallback(async () => {
    if (status === 'connected') {
      await disconnect();
    } else {
      await connect();
    }
  }, [status, connect, disconnect]);

  // Memoized button text
  const buttonText = React.useMemo(() => {
    switch (status) {
      case 'connected':
        return 'Disconnect';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Connect Wallet';
      default:
        return 'Connect';
    }
  }, [status]);

  return (
    <button
      onClick={handleClick}
      disabled={status === 'connecting'}
    >
      {buttonText}
    </button>
  );
};
```

### Chain Selector

```typescript
const ChainSelector: React.FC = () => {
  const { switchChain } = useWallet();
  const { chainId } = useWalletState();

  // Memoized chain options
  const chains = React.useMemo(() => [
    { id: ChainType.ETHEREUM, name: 'Ethereum' },
    { id: ChainType.POLYGON, name: 'Polygon' }
  ], []);

  const handleChange = React.useCallback(async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newChainId = Number(event.target.value);
    await switchChain(newChainId);
  }, [switchChain]);

  return (
    <select
      value={chainId}
      onChange={handleChange}
    >
      {chains.map(chain => (
        <option key={chain.id} value={chain.id}>
          {chain.name}
        </option>
      ))}
    </select>
  );
};
```

## Error Handling

### Error Boundary

```typescript
class WalletErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Log error to monitoring service
    console.error('Wallet error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <WalletErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Error Handler Hook

```typescript
function useWalletError() {
  const { error } = useWalletState();
  const { reset } = useWallet();

  React.useEffect(() => {
    if (error) {
      // 1. Log error
      console.error('Wallet error:', error);

      // 2. Implement recovery strategy
      if (error.code === 'NETWORK_ERROR') {
        // Retry connection
        const timer = setTimeout(() => {
          reset();
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [error, reset]);

  return error;
}
```

## Performance Optimization

### Memoization Patterns

```typescript
// 1. Component Memoization
const MemoizedWalletButton = React.memo(WalletButton, (
  prevProps,
  nextProps
) => {
  // Custom comparison logic
  return prevProps.disabled === nextProps.disabled;
});

// 2. Callback Memoization
function useWalletCallbacks() {
  const { connect, disconnect } = useWallet();

  return React.useMemo(() => ({
    handleConnect: async () => {
      await connect();
    },
    handleDisconnect: async () => {
      await disconnect();
    }
  }), [connect, disconnect]);
}

// 3. Value Memoization
function useWalletInfo() {
  const { account, chainId } = useWalletState();

  return React.useMemo(() => ({
    displayAddress: shortenAddress(account),
    networkName: getNetworkName(chainId)
  }), [account, chainId]);
}
```

### State Subscriptions

```typescript
function useOptimizedWalletState() {
  // 1. Selective state subscription
  const status = useWalletState(state => state.status);
  const account = useWalletState(state => state.account);
  
  // 2. Debounced updates
  const debouncedAccount = useDebounce(account, 500);
  
  // 3. Batched updates
  const [state, setState] = React.useState({
    status,
    account: debouncedAccount
  });
  
  React.useEffect(() => {
    setState(prev => ({
      ...prev,
      status,
      account: debouncedAccount
    }));
  }, [status, debouncedAccount]);

  return state;
}
```

### Render Optimization

```typescript
function OptimizedWalletDisplay() {
  const state = useWalletState();
  
  // 1. Split rendering
  const StatusDisplay = React.memo(() => (
    <div>Status: {state.status}</div>
  ));
  
  const AccountDisplay = React.memo(() => (
    <div>Account: {state.account}</div>
  ));
  
  // 2. Conditional rendering
  return (
    <div>
      <StatusDisplay />
      {state.status === 'connected' && <AccountDisplay />}
    </div>
  );
}
```

## Testing Patterns

### Component Testing

```typescript
// 1. Provider Mock
const MockWalletProvider: React.FC = ({ children }) => (
  <WalletProvider
    value={{
      status: 'connected',
      account: '0x...',
      chainId: 1
    }}
  >
    {children}
  </WalletProvider>
);

// 2. Hook Testing
describe('useWallet', () => {
  it('should handle connection', async () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: MockWalletProvider
    });

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.status).toBe('connected');
  });
});

// 3. Component Testing
describe('WalletButton', () => {
  it('should render connect button', () => {
    render(<WalletButton />, {
      wrapper: MockWalletProvider
    });

    expect(screen.getByText('Connect')).toBeInTheDocument();
  });
});
```

## Common Issues & Solutions

### 1. State Updates After Unmount

```typescript
function useWalletStateEffect() {
  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const safeSetState = React.useCallback((
    update: React.SetStateAction<any>
  ) => {
    if (mounted.current) {
      setState(update);
    }
  }, []);

  return safeSetState;
}
```

### 2. Provider Race Conditions

```typescript
function useWalletProvider() {
  const [provider, setProvider] = React.useState(null);
  const providerRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;

    async function initProvider() {
      const newProvider = await detectProvider();
      
      if (!cancelled) {
        providerRef.current = newProvider;
        setProvider(newProvider);
      }
    }

    initProvider();

    return () => {
      cancelled = true;
    };
  }, []);

  return provider;
}
```

### 3. Event Cleanup

```typescript
function useWalletEvents() {
  const { on, off } = useWallet();

  React.useEffect(() => {
    const handlers = new Map([
      ['connected', handleConnected],
      ['disconnected', handleDisconnected]
    ]);

    // Register all handlers
    handlers.forEach((handler, event) => {
      on(event, handler);
    });

    // Cleanup all handlers
    return () => {
      handlers.forEach((handler, event) => {
        off(event, handler);
      });
    };
  }, [on, off]);
}
