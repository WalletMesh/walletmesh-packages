# Error Recovery Patterns for @walletmesh/modal-react

This guide provides comprehensive error recovery patterns and best practices for handling wallet connection errors in production applications.

## Table of Contents
- [Error Categories](#error-categories)
- [Recovery Strategies](#recovery-strategies)
- [Implementation Patterns](#implementation-patterns)
- [Advanced Recovery Scenarios](#advanced-recovery-scenarios)
- [Best Practices](#best-practices)
- [Production Examples](#production-examples)

## Error Categories

Understanding error categories is crucial for implementing appropriate recovery strategies.

### 1. Network Errors
Temporary connectivity issues that are usually recoverable.

```typescript
import { useConnectionRecovery, type ErrorAnalysis } from '@walletmesh/modal-react';

function NetworkErrorHandler() {
  const { analyzeError, handleError } = useConnectionRecovery();

  const handleNetworkError = async (error: Error) => {
    const analysis: ErrorAnalysis = analyzeError(error);
    
    if (analysis.category === 'network') {
      // Network errors are usually recoverable
      console.log('Network error detected, attempting recovery...');
      
      // Auto-recovery will use 'wait_and_retry' strategy
      await handleError(error);
    }
  };

  return (
    <div>
      {/* UI for network error recovery */}
      <p>Connection lost. Attempting to reconnect...</p>
      <div className="spinner" />
    </div>
  );
}
```

### 2. Provider Errors
Issues with the wallet provider that may require user intervention.

```typescript
function ProviderErrorHandler({ error }: { error: Error }) {
  const { analyzeError, startRecovery } = useConnectionRecovery();
  const analysis = analyzeError(error);

  if (analysis.category === 'provider') {
    return (
      <div>
        <h3>Wallet Provider Issue</h3>
        <p>{analysis.userMessage}</p>
        
        {analysis.recoveryInstructions.map((instruction, index) => (
          <p key={index}>• {instruction}</p>
        ))}
        
        <button onClick={() => startRecovery('refresh_page')}>
          Refresh Page
        </button>
      </div>
    );
  }

  return null;
}
```

### 3. User Rejection Errors
Non-recoverable errors that require user action.

```typescript
function UserRejectionHandler({ error }: { error: Error }) {
  const { analyzeError } = useConnectionRecovery();
  const { open } = useConfig();
  
  const analysis = analyzeError(error);

  if (analysis.category === 'user_rejection') {
    return (
      <div>
        <h3>Connection Cancelled</h3>
        <p>You cancelled the connection request.</p>
        <button onClick={() => open()}>
          Try Again
        </button>
      </div>
    );
  }

  return null;
}
```

### 4. Permission Errors
Authorization issues that may require specific user actions.

```typescript
function PermissionErrorHandler({ error }: { error: Error }) {
  const { analyzeError } = useConnectionRecovery();
  const analysis = analyzeError(error);

  if (analysis.category === 'permission') {
    return (
      <div>
        <h3>Permission Required</h3>
        <p>Please approve the permission request in your wallet.</p>
        
        <details>
          <summary>Why do we need this permission?</summary>
          <p>This permission allows us to:</p>
          <ul>
            <li>Read your wallet address</li>
            <li>Request transaction signatures</li>
            <li>Check your token balances</li>
          </ul>
        </details>
        
        <button onClick={() => window.location.reload()}>
          Retry Connection
        </button>
      </div>
    );
  }

  return null;
}
```

## Recovery Strategies

### 1. Automatic Reconnection Pattern

```typescript
import { 
  useConnectionRecovery,
  useWalletHealth,
  useAccount 
} from '@walletmesh/modal-react';

function AutoReconnectManager() {
  const { isConnected } = useAccount();
  const { health } = useWalletHealth({ enableAutoCheck: true });
  const { handleError, recoveryState } = useConnectionRecovery({
    enableAutoRecovery: true,
    maxRetryAttempts: 3,
    useExponentialBackoff: true,
    retryDelay: 2000, // Start with 2 seconds
  });

  // Monitor connection health
  React.useEffect(() => {
    if (!isConnected && health.status === 'critical') {
      // Connection lost, attempt recovery
      const error = new Error('Connection lost');
      handleError(error);
    }
  }, [isConnected, health.status, handleError]);

  if (recoveryState.isRecovering) {
    return (
      <div className="recovery-status">
        <h4>Reconnecting...</h4>
        <p>Attempt {recoveryState.attemptCount} of {recoveryState.maxAttempts}</p>
        <progress 
          value={recoveryState.attemptCount} 
          max={recoveryState.maxAttempts} 
        />
      </div>
    );
  }

  return null;
}
```

### 2. Manual Recovery with User Guidance

```typescript
function ManualRecoveryFlow() {
  const { recoveryState, analyzeError, startRecovery } = useConnectionRecovery();
  const [lastError, setLastError] = React.useState<Error | null>(null);
  const [analysis, setAnalysis] = React.useState<ErrorAnalysis | null>(null);

  const handleError = (error: Error) => {
    setLastError(error);
    const errorAnalysis = analyzeError(error);
    setAnalysis(errorAnalysis);
  };

  if (!analysis || !lastError) return null;

  return (
    <div className="manual-recovery">
      <h3>Connection Error</h3>
      <p className="error-message">{analysis.userMessage}</p>
      
      <div className="recovery-options">
        <h4>Recovery Options:</h4>
        
        {analysis.isRecoverable && (
          <>
            <button 
              onClick={() => startRecovery('reconnect')}
              disabled={recoveryState.isRecovering}
            >
              🔄 Retry Connection
            </button>
            
            <button 
              onClick={() => startRecovery('switch_wallet')}
              disabled={recoveryState.isRecovering}
            >
              🔀 Try Different Wallet
            </button>
          </>
        )}
        
        <button onClick={() => window.location.reload()}>
          🔃 Refresh Page
        </button>
      </div>
      
      <details className="technical-details">
        <summary>Technical Details</summary>
        <pre>{JSON.stringify({
          category: analysis.category,
          severity: analysis.severity,
          timestamp: new Date().toISOString(),
          error: lastError.message,
        }, null, 2)}</pre>
      </details>
    </div>
  );
}
```

### 3. Progressive Recovery Pattern

```typescript
function ProgressiveRecovery() {
  const { 
    recoveryState, 
    startRecovery,
    cancelRecovery 
  } = useConnectionRecovery({
    maxRetryAttempts: 5,
    customStrategySelector: (analysis) => {
      // Progressive strategy based on attempt count
      const attempt = recoveryState.attemptCount;
      
      if (attempt <= 2) return 'reconnect';
      if (attempt <= 3) return 'wait_and_retry';
      if (attempt <= 4) return 'switch_wallet';
      return 'refresh_page';
    },
  });

  const getRecoveryMessage = () => {
    const attempt = recoveryState.attemptCount;
    
    if (attempt <= 2) return 'Attempting to reconnect...';
    if (attempt <= 3) return 'Waiting before retry...';
    if (attempt <= 4) return 'Try switching to a different wallet';
    return 'Please refresh the page';
  };

  return (
    <div className="progressive-recovery">
      {recoveryState.isRecovering && (
        <>
          <p>{getRecoveryMessage()}</p>
          <button onClick={cancelRecovery}>Cancel</button>
        </>
      )}
    </div>
  );
}
```

## Implementation Patterns

### 1. Global Error Boundary Pattern

```typescript
import { 
  WalletMeshErrorBoundary,
  useConnectionRecovery,
  isRecoverableError 
} from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error service
        console.error('Wallet error:', error, errorInfo);
        
        // Track in analytics
        if (window.analytics) {
          window.analytics.track('wallet_error', {
            error: error.message,
            recoverable: isRecoverableError(error),
            stack: errorInfo.componentStack,
          });
        }
      }}
      fallback={(error, retry) => (
        <ErrorRecoveryUI error={error} onRetry={retry} />
      )}
    >
      <YourApp />
    </WalletMeshErrorBoundary>
  );
}

function ErrorRecoveryUI({ 
  error, 
  onRetry 
}: { 
  error: Error; 
  onRetry: () => void;
}) {
  const { analyzeError, handleError } = useConnectionRecovery();
  const analysis = analyzeError(error);

  return (
    <div className="error-boundary-ui">
      <h2>Something went wrong</h2>
      <p>{analysis.userMessage}</p>
      
      {isRecoverableError(error) ? (
        <button onClick={() => handleError(error)}>
          Attempt Recovery
        </button>
      ) : (
        <button onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
```

### 2. Hook-Based Error Handling Pattern

```typescript
// Custom hook for centralized error handling
function useWalletErrorHandler() {
  const { handleError, recoveryState } = useConnectionRecovery({
    enableAutoRecovery: true,
  });
  
  const { health } = useWalletHealth();
  const { disconnect } = useDisconnect();
  
  const handleWalletError = React.useCallback(async (error: Error) => {
    // Log error
    console.error('[Wallet Error]', error);
    
    // Check if it's a critical error requiring disconnect
    if (error.message.includes('Critical') || health.status === 'critical') {
      await disconnect();
      throw error; // Re-throw to error boundary
    }
    
    // Otherwise attempt recovery
    await handleError(error);
  }, [health.status, disconnect, handleError]);

  return {
    handleWalletError,
    isRecovering: recoveryState.isRecovering,
    recoveryAttempts: recoveryState.attemptCount,
  };
}

// Usage in components
function WalletOperation() {
  const { handleWalletError, isRecovering } = useWalletErrorHandler();
  
  const performOperation = async () => {
    try {
      // Some wallet operation
      await wallet.sendTransaction(tx);
    } catch (error) {
      await handleWalletError(error as Error);
    }
  };

  return (
    <button onClick={performOperation} disabled={isRecovering}>
      {isRecovering ? 'Recovering...' : 'Send Transaction'}
    </button>
  );
}
```

### 3. Retry Queue Pattern

```typescript
interface RetryableOperation {
  id: string;
  operation: () => Promise<any>;
  retries: number;
  maxRetries: number;
  lastError?: Error;
}

function useRetryQueue() {
  const [queue, setQueue] = React.useState<RetryableOperation[]>([]);
  const { analyzeError } = useConnectionRecovery();

  const addToQueue = (operation: () => Promise<any>, maxRetries = 3) => {
    const id = `op-${Date.now()}-${Math.random()}`;
    setQueue(prev => [...prev, {
      id,
      operation,
      retries: 0,
      maxRetries,
    }]);
    return id;
  };

  const processQueue = React.useCallback(async () => {
    const pending = queue.filter(op => op.retries < op.maxRetries);
    
    for (const op of pending) {
      try {
        await op.operation();
        // Success - remove from queue
        setQueue(prev => prev.filter(item => item.id !== op.id));
      } catch (error) {
        const analysis = analyzeError(error as Error);
        
        if (analysis.isRecoverable) {
          // Update retry count
          setQueue(prev => prev.map(item => 
            item.id === op.id 
              ? { ...item, retries: item.retries + 1, lastError: error as Error }
              : item
          ));
        } else {
          // Non-recoverable - remove from queue
          setQueue(prev => prev.filter(item => item.id !== op.id));
        }
      }
    }
  }, [queue, analyzeError]);

  // Process queue periodically
  React.useEffect(() => {
    if (queue.length === 0) return;
    
    const timer = setTimeout(processQueue, 5000); // Every 5 seconds
    return () => clearTimeout(timer);
  }, [queue, processQueue]);

  return {
    addToQueue,
    queue,
    pendingOperations: queue.length,
  };
}
```

## Advanced Recovery Scenarios

### 1. Chain-Specific Recovery

```typescript
function ChainSpecificRecovery() {
  const { chainId, chainType } = useAccount();
  const { ensureChain } = useEnsureChain();
  const { analyzeError, startRecovery } = useConnectionRecovery();

  const handleChainError = async (error: Error, targetChainId: string) => {
    const analysis = analyzeError(error);
    
    // Check if it's a chain-related error
    if (error.message.includes('chain') || error.message.includes('network')) {
      try {
        // Attempt to switch to correct chain
        await ensureChain(targetChainId, { autoSwitch: true });
      } catch (switchError) {
        // If switch fails, try different recovery strategies
        if (chainType === ChainType.Evm) {
          // For EVM chains, try adding the chain first
          await addEvmChain(targetChainId);
        } else {
          // For other chains, switch wallet
          await startRecovery('switch_wallet');
        }
      }
    }
  };

  return {
    handleChainError,
  };
}
```

### 2. Multi-Wallet Fallback Pattern

```typescript
function MultiWalletFallback() {
  const { walletAvailability } = useSelectedWallet();
  const { connect } = useConnect();
  const { handleError } = useConnectionRecovery();
  
  const [attemptedWallets, setAttemptedWallets] = React.useState<Set<string>>(
    new Set()
  );

  const connectWithFallback = async () => {
    const availableWallets = walletAvailability
      .filter(w => w.isAvailable && !attemptedWallets.has(w.wallet.id))
      .map(w => w.wallet);

    for (const wallet of availableWallets) {
      try {
        const result = await connect({ walletId: wallet.id });
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log(`Failed to connect with ${wallet.name}, trying next...`);
        setAttemptedWallets(prev => new Set(prev).add(wallet.id));
        
        // Don't throw, continue to next wallet
      }
    }

    // All wallets failed
    throw new Error('Failed to connect with any available wallet');
  };

  return {
    connectWithFallback,
    attemptedCount: attemptedWallets.size,
    resetAttempts: () => setAttemptedWallets(new Set()),
  };
}
```

### 3. Session Recovery Pattern

```typescript
function SessionRecoveryManager() {
  const { sessionState, createSession } = useWalletSessions({
    enablePersistence: true,
  });
  
  const { connect } = useConnect();
  const { handleError } = useConnectionRecovery();

  const recoverSession = async (sessionId: string) => {
    const session = sessionState.sessions.find(s => s.sessionId === sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Attempt to reconnect with same wallet
      const result = await connect({
        walletId: session.wallet.id,
        chainId: session.chainId,
      });

      if (result.success) {
        // Restore session metadata
        await createSession({
          ...session.metadata,
          name: `${session.metadata.name} (Recovered)`,
        });
      }

      return result;
    } catch (error) {
      // If original wallet fails, try recovery
      await handleError(error as Error);
      throw error;
    }
  };

  return {
    recoverSession,
    recoverableSessions: sessionState.sessions.filter(s => !s.isActive),
  };
}
```

## Best Practices

### 1. Error Classification and Logging

```typescript
class WalletErrorLogger {
  private static instance: WalletErrorLogger;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new WalletErrorLogger();
    }
    return this.instance;
  }

  logError(error: Error, context: Record<string, any>) {
    const { analyzeError } = useConnectionRecovery();
    const analysis = analyzeError(error);

    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      category: analysis.category,
      severity: analysis.severity,
      recoverable: analysis.isRecoverable,
      context,
      userAgent: navigator.userAgent,
    };

    // Send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
      console.error('[Wallet Error]', errorLog);
    } else {
      console.error('[Wallet Error]', errorLog);
    }
  }
}
```

### 2. User-Friendly Error Messages

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'Failed to fetch': 'Connection lost. Please check your internet connection.',
  'Network request failed': 'Unable to connect. Please try again.',
  
  // Wallet errors
  'User rejected': 'You cancelled the request. Click connect to try again.',
  'Wallet locked': 'Please unlock your wallet and try again.',
  'Chain not supported': 'This network is not supported by your wallet.',
  
  // Permission errors
  'Unauthorized': 'Please approve the connection in your wallet.',
  'Insufficient permissions': 'Additional permissions required. Please check your wallet.',
};

function getUserFriendlyMessage(error: Error): string {
  // Check for known error patterns
  for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
    if (error.message.includes(pattern)) {
      return message;
    }
  }
  
  // Fallback to generic message
  return 'Something went wrong. Please try again.';
}
```

### 3. Recovery State Persistence

```typescript
function usePersistentRecovery() {
  const STORAGE_KEY = 'wallet-recovery-state';
  
  const { recoveryState, startRecovery } = useConnectionRecovery();
  
  // Save recovery state
  React.useEffect(() => {
    if (recoveryState.attempts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        attempts: recoveryState.attempts,
        lastAttempt: recoveryState.lastAttempt,
        timestamp: Date.now(),
      }));
    }
  }, [recoveryState]);

  // Load recovery state on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      
      // Check if state is recent (within last hour)
      if (Date.now() - data.timestamp < 60 * 60 * 1000) {
        console.log('Resuming previous recovery attempts', data);
      }
    }
  }, []);

  return {
    clearPersistedState: () => localStorage.removeItem(STORAGE_KEY),
  };
}
```

## Production Examples

### Complete Error Recovery System

```typescript
import React from 'react';
import {
  WalletMeshProvider,
  WalletMeshErrorBoundary,
  useConnectionRecovery,
  useWalletHealth,
  useAccount,
  type ErrorAnalysis,
  type RecoveryStrategy,
} from '@walletmesh/modal-react';

// Error recovery configuration
const RECOVERY_CONFIG = {
  maxRetryAttempts: 5,
  retryDelay: 2000,
  enableAutoRecovery: true,
  useExponentialBackoff: true,
};

// Main App with comprehensive error handling
function App() {
  return (
    <WalletMeshProvider config={walletConfig}>
      <WalletMeshErrorBoundary
        onError={handleGlobalError}
        fallback={GlobalErrorFallback}
      >
        <ErrorRecoveryProvider>
          <MainApplication />
        </ErrorRecoveryProvider>
      </WalletMeshErrorBoundary>
    </WalletMeshProvider>
  );
}

// Global error handler
function handleGlobalError(error: Error, errorInfo: any) {
  // Log to error service
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}

// Global error fallback UI
function GlobalErrorFallback({ error, retry }: any) {
  const { analyzeError, handleError } = useConnectionRecovery(RECOVERY_CONFIG);
  const analysis = analyzeError(error);

  return (
    <div className="error-fallback">
      <h1>Connection Error</h1>
      <p>{analysis.userMessage}</p>
      
      <div className="error-actions">
        {analysis.isRecoverable ? (
          <button onClick={() => handleError(error)}>
            Attempt Recovery
          </button>
        ) : (
          <button onClick={retry}>
            Retry
          </button>
        )}
        
        <button onClick={() => window.location.href = '/'}>
          Go Home
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Error Details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}

// Error recovery context for app-wide access
const ErrorRecoveryContext = React.createContext<{
  handleError: (error: Error) => Promise<void>;
  isRecovering: boolean;
}>({
  handleError: async () => {},
  isRecovering: false,
});

function ErrorRecoveryProvider({ children }: { children: React.ReactNode }) {
  const recovery = useConnectionRecovery(RECOVERY_CONFIG);
  const health = useWalletHealth({ enableAutoCheck: true });
  const account = useAccount();

  // Monitor connection health
  React.useEffect(() => {
    if (health.status === 'critical' && account.isConnected) {
      recovery.handleError(new Error('Connection health critical'));
    }
  }, [health.status, account.isConnected, recovery]);

  const value = React.useMemo(() => ({
    handleError: recovery.handleError,
    isRecovering: recovery.recoveryState.isRecovering,
  }), [recovery.handleError, recovery.recoveryState.isRecovering]);

  return (
    <ErrorRecoveryContext.Provider value={value}>
      {children}
      {recovery.recoveryState.isRecovering && <RecoveryIndicator />}
    </ErrorRecoveryContext.Provider>
  );
}

// Visual recovery indicator
function RecoveryIndicator() {
  const { recoveryState } = useConnectionRecovery();
  
  return (
    <div className="recovery-indicator">
      <div className="recovery-spinner" />
      <p>Recovering connection...</p>
      <p>Attempt {recoveryState.attemptCount} of {recoveryState.maxAttempts}</p>
    </div>
  );
}

// Hook for components to use error recovery
export function useErrorRecovery() {
  return React.useContext(ErrorRecoveryContext);
}

// Example usage in a component
function TransactionButton() {
  const { handleError, isRecovering } = useErrorRecovery();
  
  const sendTransaction = async () => {
    try {
      // Transaction logic
      await wallet.sendTransaction(tx);
    } catch (error) {
      await handleError(error as Error);
    }
  };

  return (
    <button 
      onClick={sendTransaction}
      disabled={isRecovering}
    >
      {isRecovering ? 'Recovering...' : 'Send Transaction'}
    </button>
  );
}
```

This comprehensive guide provides production-ready error recovery patterns for @walletmesh/modal-react, ensuring robust wallet connection management in real-world applications.