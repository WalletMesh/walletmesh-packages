# TypeScript Examples for @walletmesh/modal-react

This guide provides comprehensive TypeScript examples for all the advanced hooks in @walletmesh/modal-react.

## Table of Contents
- [Setup and Configuration](#setup-and-configuration)
- [Basic Usage Examples](#basic-usage-examples)
- [Advanced Hook Examples](#advanced-hook-examples)
- [Error Handling Patterns](#error-handling-patterns)
- [Type-Safe Patterns](#type-safe-patterns)
- [Integration Examples](#integration-examples)

## Setup and Configuration

### Provider Setup with TypeScript

```typescript
import React from 'react';
import { 
  WalletMeshProvider, 
  ChainType,
  type WalletMeshProviderProps,
  type WalletInfo 
} from '@walletmesh/modal-react';

// Type-safe wallet configuration
const walletConfig: WalletInfo[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,...',
    chains: [ChainType.Evm],
    type: 'browser',
  },
  {
    id: 'phantom',
    name: 'Phantom', 
    icon: 'data:image/svg+xml;base64,...',
    chains: [ChainType.Solana],
    type: 'browser',
  },
];

// Type-safe provider configuration
const config: WalletMeshProviderProps['config'] = {
  appName: 'My DApp',
  appDescription: 'Decentralized Application',
  appUrl: 'https://mydapp.com',
  chains: [ChainType.Evm, ChainType.Solana],
  wallets: walletConfig,
  autoInjectModal: true,
  debug: process.env.NODE_ENV === 'development',
};

function App() {
  return (
    <WalletMeshProvider config={config}>
      <YourApp />
    </WalletMeshProvider>
  );
}
```

## Basic Usage Examples

### Account Management with Type Safety

```typescript
import { useAccount, type AccountInfo } from '@walletmesh/modal-react';

function AccountDisplay() {
  const account: AccountInfo = useAccount();
  
  // All properties are properly typed
  const {
    isConnected,      // boolean
    isConnecting,     // boolean
    isReconnecting,   // boolean
    isDisconnected,   // boolean
    address,          // string | null
    chainId,          // string | null
    chainType,        // ChainType | null
    wallet,           // WalletInfo | null
    status,           // 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
  } = account;

  if (isConnecting) {
    return <div>Connecting...</div>;
  }

  if (isReconnecting) {
    return <div>Reconnecting to {wallet?.name}...</div>;
  }

  if (isConnected && address && chainId) {
    return (
      <div>
        <p>Wallet: {wallet?.name}</p>
        <p>Address: {address}</p>
        <p>Chain: {chainId}</p>
      </div>
    );
  }

  return <div>Not connected</div>;
}
```

### Type-Safe Connection Handling

```typescript
import { 
  useConnect, 
  type ConnectResult,
  type ConnectOptions,
  type ConnectionProgress 
} from '@walletmesh/modal-react';

function ConnectWallet() {
  const { 
    connect, 
    error, 
    isLoading,
    walletAdapters,
    progress 
  }: {
    connect: (options?: ConnectOptions) => Promise<ConnectResult>;
    error: Error | null;
    isLoading: boolean;
    walletAdapters: WalletInfo[];
    progress: ConnectionProgress | null;
  } = useConnect();

  const handleConnect = async () => {
    try {
      const result: ConnectResult = await connect({
        walletId: 'metamask',
        chainId: '0x1',
      });
      
      if (result.success) {
        console.log('Connected:', result.address);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleConnect} disabled={isLoading}>
        {isLoading ? `Connecting... ${progress?.step}` : 'Connect'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Advanced Hook Examples

### useEnsureChain - Chain Validation with TypeScript

```typescript
import { 
  useEnsureChain,
  type ChainValidationResult,
  type ChainValidationOptions,
  type ChainId
} from '@walletmesh/modal-react';

function ChainGuard({ requiredChainId }: { requiredChainId: ChainId }) {
  const {
    ensureChain,
    validateChain,
    isCorrectChain,
    getChainMismatchMessage,
    isSwitching
  } = useEnsureChain();

  // Async chain enforcement with type-safe options
  const enforceChain = async () => {
    const options: ChainValidationOptions = {
      autoSwitch: true,
      throwOnError: false,
      customMessage: 'Please switch to Ethereum Mainnet to continue',
    };

    try {
      const result: ChainValidationResult = await ensureChain(requiredChainId, options);
      
      if (result.success) {
        if (result.switched) {
          console.log('Successfully switched chains');
        } else {
          console.log('Already on correct chain');
        }
      } else {
        console.log('Chain mismatch:', result.message);
      }
    } catch (error) {
      // Only thrown if throwOnError is true
      console.error('Chain switch failed:', error);
    }
  };

  // Synchronous validation
  const validationResult = validateChain(requiredChainId);
  
  return (
    <div>
      {!validationResult.isCorrectChain && (
        <div>
          <p>{getChainMismatchMessage(requiredChainId)}</p>
          <button onClick={enforceChain} disabled={isSwitching}>
            {isSwitching ? 'Switching...' : 'Switch Chain'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### useSelectedWallet - Type-Safe Wallet Selection

```typescript
import { 
  useSelectedWallet,
  type WalletSelectionOptions,
  type WalletSelectionState,
  type WalletAvailability,
  type WalletInfo,
  ChainType
} from '@walletmesh/modal-react';

function WalletSelector() {
  const options: WalletSelectionOptions = {
    persistPreference: true,
    storageKey: 'my-app-wallet-preference',
    filterByChainType: [ChainType.Evm, ChainType.Solana],
    autoSelectSingle: false,
  };

  const {
    state,
    selectWallet,
    walletAvailability,
    getRecommendedWallet,
    refreshAvailability
  }: {
    state: WalletSelectionState;
    selectWallet: (wallet: WalletInfo | null) => void;
    walletAvailability: WalletAvailability[];
    getRecommendedWallet: () => WalletInfo | null;
    refreshAvailability: () => Promise<void>;
  } = useSelectedWallet(options);

  // Type-safe wallet selection
  const handleWalletSelect = (availability: WalletAvailability) => {
    if (availability.isAvailable) {
      selectWallet(availability.wallet);
    } else if (availability.installUrl) {
      window.open(availability.installUrl, '_blank');
    }
  };

  return (
    <div>
      <h3>Select Wallet</h3>
      
      {/* Display recommended wallet */}
      {(() => {
        const recommended = getRecommendedWallet();
        if (recommended) {
          return (
            <div>
              <p>Recommended: {recommended.name}</p>
            </div>
          );
        }
        return null;
      })()}

      {/* Wallet list with availability */}
      {walletAvailability.map((availability) => (
        <button
          key={availability.wallet.id}
          onClick={() => handleWalletSelect(availability)}
          disabled={!availability.isAvailable && !availability.installUrl}
        >
          <img src={availability.wallet.icon} alt={availability.wallet.name} />
          <span>{availability.wallet.name}</span>
          {!availability.isAvailable && (
            <span>{availability.installUrl ? 'Install' : 'Unavailable'}</span>
          )}
          {availability.supportsCurrentChain === false && (
            <span>⚠️ Chain not supported</span>
          )}
        </button>
      ))}

      <button onClick={refreshAvailability}>
        Refresh Wallets
      </button>
    </div>
  );
}
```

### useWalletHealth - Health Monitoring with Types

```typescript
import { 
  useWalletHealth,
  type HealthMonitoringOptions,
  type HealthDiagnostics,
  type HealthStatus,
  type HealthIssue,
  type NetworkStatus
} from '@walletmesh/modal-react';

function WalletHealthMonitor() {
  const options: HealthMonitoringOptions = {
    checkInterval: 30000, // 30 seconds
    responseTimeThreshold: 2000, // 2 seconds warning
    enableAutoCheck: true,
    enableNetworkMonitoring: true,
    maxIssues: 10,
  };

  const {
    health,
    runHealthCheck,
    clearIssues,
    isMonitoring,
    subscribeToHealthChanges
  }: {
    health: HealthDiagnostics;
    runHealthCheck: () => Promise<void>;
    clearIssues: () => void;
    isMonitoring: boolean;
    subscribeToHealthChanges: (
      callback: (newHealth: HealthDiagnostics, previousHealth: HealthDiagnostics) => void
    ) => () => void;
  } = useWalletHealth(options);

  // Subscribe to health changes with proper typing
  React.useEffect(() => {
    const unsubscribe = subscribeToHealthChanges((newHealth, previousHealth) => {
      if (newHealth.status === 'critical' && previousHealth.status !== 'critical') {
        // Alert user of critical issues
        alert('Critical wallet health issue detected!');
      }
    });

    return unsubscribe;
  }, [subscribeToHealthChanges]);

  // Type-safe health status display
  const getStatusColor = (status: HealthStatus): string => {
    const statusColors: Record<HealthStatus, string> = {
      healthy: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444',
      unknown: '#6b7280',
    };
    return statusColors[status];
  };

  return (
    <div>
      <h3>Wallet Health Monitor</h3>
      
      <div style={{ color: getStatusColor(health.status) }}>
        Status: {health.status.toUpperCase()}
      </div>

      <div>
        <p>Performance Score: {health.performanceScore}/100</p>
        <p>Network: {health.networkStatus}</p>
        <p>Uptime: {(health.stability.uptime * 100).toFixed(2)}%</p>
      </div>

      {health.issues.length > 0 && (
        <div>
          <h4>Issues ({health.issues.length})</h4>
          {health.issues.map((issue: HealthIssue, index) => (
            <div key={index}>
              <strong>{issue.type}</strong>: {issue.message}
              <br />
              <small>Severity: {issue.severity} | {new Date(issue.timestamp).toLocaleTimeString()}</small>
            </div>
          ))}
          <button onClick={clearIssues}>Clear Issues</button>
        </div>
      )}

      <button onClick={runHealthCheck} disabled={isMonitoring}>
        {isMonitoring ? 'Checking...' : 'Run Health Check'}
      </button>
    </div>
  );
}
```

### useConnectionRecovery - Error Recovery with TypeScript

```typescript
import {
  useConnectionRecovery,
  type ConnectionRecoveryOptions,
  type RecoveryState,
  type ErrorAnalysis,
  type RecoveryStrategy,
  type ErrorClassification
} from '@walletmesh/modal-react';

function ConnectionRecoveryManager() {
  const options: ConnectionRecoveryOptions = {
    maxRetryAttempts: 3,
    retryDelay: 2000,
    enableAutoRecovery: true,
    useExponentialBackoff: true,
    customErrorClassifier: (error: Error): ErrorClassification => {
      // Custom error classification logic
      if (error.message.includes('rate limit')) {
        return 'rate_limit';
      }
      return 'unknown';
    },
    customStrategySelector: (analysis: ErrorAnalysis): RecoveryStrategy => {
      // Custom strategy selection
      if (analysis.category === 'rate_limit') {
        return 'wait_and_retry';
      }
      return analysis.recommendedStrategy;
    },
  };

  const {
    recoveryState,
    analyzeError,
    startRecovery,
    cancelRecovery,
    clearHistory,
    handleError
  }: {
    recoveryState: RecoveryState;
    analyzeError: (error: Error) => ErrorAnalysis;
    startRecovery: (strategy: RecoveryStrategy) => Promise<void>;
    cancelRecovery: () => void;
    clearHistory: () => void;
    handleError: (error: Error) => Promise<void>;
  } = useConnectionRecovery(options);

  // Handle errors with automatic recovery
  const handleConnectionError = async (error: Error) => {
    const analysis: ErrorAnalysis = analyzeError(error);
    
    console.log('Error Analysis:', {
      category: analysis.category,
      isRecoverable: analysis.isRecoverable,
      recommendedStrategy: analysis.recommendedStrategy,
      severity: analysis.severity,
    });

    if (analysis.isRecoverable) {
      // Auto recovery will handle it if enabled
      await handleError(error);
    } else {
      // Show manual recovery instructions
      alert(analysis.recoveryInstructions.join('\n'));
    }
  };

  return (
    <div>
      <h3>Connection Recovery</h3>
      
      {recoveryState.isRecovering && (
        <div>
          <p>🔄 Recovering...</p>
          <p>Strategy: {recoveryState.currentStrategy}</p>
          <p>Attempt: {recoveryState.attemptCount}/{recoveryState.maxAttempts}</p>
          <button onClick={cancelRecovery}>Cancel Recovery</button>
        </div>
      )}

      {recoveryState.lastAttempt && (
        <div>
          <h4>Last Recovery Attempt</h4>
          <p>Strategy: {recoveryState.lastAttempt.strategy}</p>
          <p>Success: {recoveryState.lastAttempt.success ? '✅' : '❌'}</p>
          {recoveryState.lastAttempt.error && (
            <p>Error: {recoveryState.lastAttempt.error}</p>
          )}
        </div>
      )}

      <div>
        <h4>Recovery History ({recoveryState.attempts.length})</h4>
        {recoveryState.attempts.map((attempt, index) => (
          <div key={index}>
            {new Date(attempt.timestamp).toLocaleTimeString()} - 
            {attempt.strategy} - 
            {attempt.success ? '✅' : '❌'}
          </div>
        ))}
        {recoveryState.attempts.length > 0 && (
          <button onClick={clearHistory}>Clear History</button>
        )}
      </div>
    </div>
  );
}
```

### useWalletSessions - Session Management with Types

```typescript
import {
  useWalletSessions,
  type SessionManagementOptions,
  type SessionManagementState,
  type SessionInfo,
  type SessionStats,
  ChainType
} from '@walletmesh/modal-react';

interface SessionMetadata {
  name?: string;
  tags?: string[];
  custom?: {
    purpose?: string;
    tradingPair?: string;
    [key: string]: unknown;
  };
}

function SessionManager() {
  const options: SessionManagementOptions = {
    maxSessions: 10,
    autoCleanupAfter: 24 * 60 * 60 * 1000, // 24 hours
    enablePersistence: true,
    storageKey: 'my-app-wallet-sessions',
    enableAnalytics: true,
  };

  const {
    sessionState,
    createSession,
    switchToSession,
    endSession,
    updateSessionMetadata,
    clearAllSessions,
    getSessionsByWallet,
    getSessionsByChain,
    getSessionsByTag
  }: {
    sessionState: SessionManagementState;
    createSession: (metadata?: SessionMetadata) => Promise<SessionInfo>;
    switchToSession: (sessionId: string) => Promise<void>;
    endSession: (sessionId: string) => Promise<void>;
    updateSessionMetadata: (sessionId: string, metadata: Partial<SessionMetadata>) => void;
    clearAllSessions: () => void;
    getSessionsByWallet: (walletId: string) => SessionInfo[];
    getSessionsByChain: (chainType: ChainType) => SessionInfo[];
    getSessionsByTag: (tag: string) => SessionInfo[];
  } = useWalletSessions(options);

  // Create a typed session
  const createTradingSession = async () => {
    const metadata: SessionMetadata = {
      name: 'Trading Session',
      tags: ['trading', 'defi', 'mainnet'],
      custom: {
        purpose: 'arbitrage',
        tradingPair: 'ETH/USDC',
      },
    };

    try {
      const session: SessionInfo = await createSession(metadata);
      console.log('Created session:', session.sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  // Type-safe session queries
  const getActiveTradingSessions = (): SessionInfo[] => {
    return getSessionsByTag('trading').filter(session => session.isActive);
  };

  const stats: SessionStats = sessionState.stats;

  return (
    <div>
      <h3>Wallet Sessions</h3>
      
      {/* Session Statistics */}
      <div>
        <h4>Statistics</h4>
        <p>Total Sessions: {stats.totalSessions}</p>
        <p>Active Sessions: {stats.activeSessions}</p>
        <p>Most Used Wallet: {stats.mostUsedWallet || 'None'}</p>
        <p>Average Duration: {Math.round(stats.averageSessionDuration / 1000)}s</p>
      </div>

      {/* Session List */}
      <div>
        <h4>Sessions</h4>
        {sessionState.sessions.map((session: SessionInfo) => (
          <div key={session.sessionId}>
            <h5>{session.metadata.name || `${session.wallet.name} Session`}</h5>
            <p>Wallet: {session.wallet.name}</p>
            <p>Chain: {session.chainType} ({session.chainId})</p>
            <p>Address: {session.primaryAddress.slice(0, 8)}...</p>
            <p>Created: {new Date(session.createdAt).toLocaleString()}</p>
            
            {session.metadata.tags && (
              <p>Tags: {session.metadata.tags.join(', ')}</p>
            )}
            
            <div>
              {!session.isActive && (
                <button onClick={() => switchToSession(session.sessionId)}>
                  Switch to Session
                </button>
              )}
              <button onClick={() => endSession(session.sessionId)}>
                End Session
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <button onClick={createTradingSession}>Create Trading Session</button>
        <button onClick={clearAllSessions}>Clear All Sessions</button>
      </div>
    </div>
  );
}
```

### useMultipleWalletEvents - Advanced Event Handling

```typescript
import {
  useMultipleWalletEvents,
  type WalletEventHandler,
  type ModalEventMap
} from '@walletmesh/modal-react';

function EventMonitor() {
  const [eventLog, setEventLog] = React.useState<string[]>([]);

  // Type-safe event handlers
  const eventHandlers: Partial<{
    [K in keyof ModalEventMap]: WalletEventHandler<ModalEventMap[K]>;
  }> = {
    'connection:established': (event) => {
      setEventLog(prev => [...prev, `Connected: ${JSON.stringify(event)}`]);
    },
    'connection:failed': (event) => {
      setEventLog(prev => [...prev, `Connection failed: ${event.error}`]);
    },
    'chain:switched': (event) => {
      setEventLog(prev => [...prev, `Chain switched to: ${event.chainId}`]);
    },
    'wallet:selected': (event) => {
      setEventLog(prev => [...prev, `Wallet selected: ${event.wallet.name}`]);
    },
    'session:created': (event) => {
      setEventLog(prev => [...prev, `Session created: ${event.sessionId}`]);
    },
  };

  const {
    pause,
    resume,
    isPaused,
    subscribe
  } = useMultipleWalletEvents(eventHandlers);

  // Add dynamic subscription
  React.useEffect(() => {
    const unsubscribe = subscribe('state:updated', (event) => {
      console.log('State updated:', event);
    });

    return unsubscribe;
  }, [subscribe]);

  return (
    <div>
      <h3>Event Monitor</h3>
      
      <button onClick={isPaused ? resume : pause}>
        {isPaused ? 'Resume Events' : 'Pause Events'}
      </button>

      <div>
        <h4>Event Log</h4>
        {eventLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling Patterns

### Type-Safe Error Handling

```typescript
import { 
  WalletMeshError,
  WalletMeshErrorCode,
  isWalletMeshError,
  getErrorMessage,
  isRecoverableError
} from '@walletmesh/modal-react';

function ErrorHandler({ error }: { error: Error | unknown }) {
  // Type guard for WalletMeshError
  if (isWalletMeshError(error)) {
    const walletError: WalletMeshError = error;
    
    switch (walletError.code) {
      case WalletMeshErrorCode.UserRejected:
        return <div>You rejected the connection request</div>;
      
      case WalletMeshErrorCode.WalletNotFound:
        return <div>Wallet not found. Please install it first.</div>;
      
      case WalletMeshErrorCode.ChainNotSupported:
        return <div>This chain is not supported by your wallet</div>;
      
      default:
        return <div>Error: {getErrorMessage(walletError)}</div>;
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>An unknown error occurred</div>;
}

// Using with error boundary
import { WalletMeshErrorBoundary } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshErrorBoundary
      onError={(error, errorInfo) => {
        // Type-safe error handling
        console.error('WalletMesh Error:', error);
        
        if (isRecoverableError(error)) {
          // Attempt recovery
        } else {
          // Log to error service
        }
      }}
      fallback={(error) => <ErrorHandler error={error} />}
    >
      <YourApp />
    </WalletMeshErrorBoundary>
  );
}
```

## Type-Safe Patterns

### Custom Hook with Proper Types

```typescript
import {
  useAccount,
  useConnect,
  useDisconnect,
  useWalletHealth,
  type AccountInfo,
  type ConnectResult,
  type HealthDiagnostics
} from '@walletmesh/modal-react';

// Custom hook with full type safety
interface UseWalletReturn {
  // State
  account: AccountInfo;
  health: HealthDiagnostics;
  isHealthy: boolean;
  
  // Actions
  connect: () => Promise<ConnectResult>;
  disconnect: () => Promise<void>;
  
  // Computed
  canTransact: boolean;
}

function useWallet(): UseWalletReturn {
  const account = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { health } = useWalletHealth();

  const isHealthy = health.status === 'healthy';
  const canTransact = account.isConnected && isHealthy;

  return {
    account,
    health,
    isHealthy,
    connect: () => connect(),
    disconnect: () => disconnect(),
    canTransact,
  };
}
```

### Generic Wallet Component

```typescript
import React from 'react';
import { WalletInfo, ChainType } from '@walletmesh/modal-react';

// Generic wallet component with type constraints
interface WalletCardProps<T extends WalletInfo> {
  wallet: T;
  onSelect: (wallet: T) => void;
  isSelected?: boolean;
  additionalData?: Record<string, unknown>;
}

function WalletCard<T extends WalletInfo>({ 
  wallet, 
  onSelect, 
  isSelected = false,
  additionalData 
}: WalletCardProps<T>) {
  const supportsMultipleChains = wallet.chains.length > 1;
  
  return (
    <div 
      onClick={() => onSelect(wallet)}
      style={{ 
        border: isSelected ? '2px solid blue' : '1px solid gray',
        padding: '16px',
        cursor: 'pointer'
      }}
    >
      <img src={wallet.icon} alt={wallet.name} width={48} height={48} />
      <h3>{wallet.name}</h3>
      <p>Type: {wallet.type}</p>
      <p>Chains: {wallet.chains.join(', ')}</p>
      {supportsMultipleChains && <span>🌐 Multi-chain</span>}
      {additionalData && (
        <pre>{JSON.stringify(additionalData, null, 2)}</pre>
      )}
    </div>
  );
}
```

## Integration Examples

### Complete Wallet Management System

```typescript
import React from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsureChain,
  useSelectedWallet,
  useWalletHealth,
  useConnectionRecovery,
  useWalletSessions,
  useMultipleWalletEvents,
  ChainType,
  type WalletInfo,
  type ChainId,
  type SessionInfo
} from '@walletmesh/modal-react';

interface WalletManagerProps {
  requiredChainId: ChainId;
  allowedChainTypes: ChainType[];
}

function WalletManager({ requiredChainId, allowedChainTypes }: WalletManagerProps) {
  const account = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { ensureChain, isCorrectChain } = useEnsureChain();
  
  const { 
    state: walletState, 
    selectWallet,
    walletAvailability 
  } = useSelectedWallet({
    filterByChainType: allowedChainTypes,
    persistPreference: true,
  });

  const { health, runHealthCheck } = useWalletHealth({
    enableAutoCheck: true,
  });

  const { handleError } = useConnectionRecovery({
    enableAutoRecovery: true,
  });

  const { 
    sessionState, 
    createSession 
  } = useWalletSessions({
    enablePersistence: true,
  });

  // Complex connection flow with type safety
  const handleConnectFlow = async (wallet: WalletInfo) => {
    try {
      // 1. Select wallet
      selectWallet(wallet);
      
      // 2. Connect
      const result = await connect({ walletId: wallet.id });
      
      if (!result.success) {
        throw new Error('Connection failed');
      }
      
      // 3. Ensure correct chain
      await ensureChain(requiredChainId, { autoSwitch: true });
      
      // 4. Create session
      await createSession({
        name: `${wallet.name} Session`,
        tags: ['auto-created'],
      });
      
      // 5. Run health check
      await runHealthCheck();
      
    } catch (error) {
      // Handle with recovery system
      await handleError(error as Error);
    }
  };

  // Type-safe render logic
  if (!account.isConnected) {
    return (
      <div>
        <h2>Connect Wallet</h2>
        {walletAvailability.map((availability) => (
          <button
            key={availability.wallet.id}
            onClick={() => handleConnectFlow(availability.wallet)}
            disabled={!availability.isAvailable}
          >
            Connect {availability.wallet.name}
          </button>
        ))}
      </div>
    );
  }

  if (!isCorrectChain(requiredChainId)) {
    return (
      <div>
        <h2>Wrong Network</h2>
        <p>Please switch to the correct network</p>
        <button onClick={() => ensureChain(requiredChainId, { autoSwitch: true })}>
          Switch Network
        </button>
      </div>
    );
  }

  if (health.status === 'critical') {
    return (
      <div>
        <h2>Connection Issues</h2>
        <p>Your wallet connection is experiencing issues</p>
        <button onClick={runHealthCheck}>Check Connection</button>
      </div>
    );
  }

  // Connected and healthy
  return (
    <div>
      <h2>Wallet Connected</h2>
      <p>Address: {account.address}</p>
      <p>Wallet: {account.wallet?.name}</p>
      <p>Health: {health.status}</p>
      <p>Sessions: {sessionState.sessions.length}</p>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
```

## Best Practices

1. **Always use proper types** - Avoid `any`, use the exported types
2. **Handle all states** - Connected, connecting, disconnected, error
3. **Use type guards** - Check for null/undefined before accessing properties
4. **Leverage discriminated unions** - Use the `status` field for type narrowing
5. **Create reusable typed components** - Build a library of typed wallet components
6. **Use proper error boundaries** - Wrap your app with WalletMeshErrorBoundary
7. **Subscribe to events wisely** - Clean up subscriptions in useEffect
8. **Validate chain compatibility** - Always check if wallet supports the chain
9. **Persist user preferences** - Use the persistence options in hooks
10. **Monitor wallet health** - Proactively check connection health

## Advanced TypeScript Tips

### Type Narrowing with Status

```typescript
const account = useAccount();

// Type narrowing based on status
switch (account.status) {
  case 'connected':
    // TypeScript knows address, chainId, etc. are defined here
    console.log(account.address); // string (not null)
    break;
  
  case 'connecting':
  case 'reconnecting':
    // Handle loading states
    break;
    
  case 'disconnected':
    // Handle disconnected state
    break;
}
```

### Const Assertions for Chain IDs

```typescript
// Use const assertion for chain IDs
const SUPPORTED_CHAINS = {
  ethereum: '0x1',
  polygon: '0x89',
  arbitrum: '0xa4b1',
} as const;

type SupportedChainId = typeof SUPPORTED_CHAINS[keyof typeof SUPPORTED_CHAINS];

// Now TypeScript enforces only valid chain IDs
const chainId: SupportedChainId = '0x1'; // ✅
const invalidChain: SupportedChainId = '0x999'; // ❌ Type error
```

### Utility Types for Wallet Operations

```typescript
// Create utility types for common patterns
type WalletAction<T> = {
  execute: () => Promise<T>;
  isLoading: boolean;
  error: Error | null;
};

type WalletState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

// Use in components
function useWalletAction<T>(
  action: () => Promise<T>
): WalletAction<T> {
  const [state, setState] = React.useState<WalletState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = React.useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const result = await action();
      setState({ data: result, isLoading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
      throw error;
    }
  }, [action]);

  return {
    execute,
    isLoading: state.isLoading,
    error: state.error,
  };
}
```

This comprehensive guide provides type-safe examples for all the advanced functionality in @walletmesh/modal-react, helping developers build robust Web3 applications with confidence.