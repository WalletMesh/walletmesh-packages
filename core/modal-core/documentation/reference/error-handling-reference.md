# Error Handling Guide for Modal-Core

This document provides comprehensive guidance on error handling patterns and best practices in the modal-core library, updated to reflect the recent bug fixes and improvements.

## Overview

The modal-core library implements a robust, multi-layered error handling system designed to provide excellent developer experience while maintaining system stability. All errors follow standardized patterns and provide clear recovery paths.

## Error Architecture

### 1. Error Types Hierarchy

```typescript
import { ErrorFactory, isModalError } from '@walletmesh/modal-core';

// All errors extend from ModalError base type
interface ModalError {
  code: string;
  message: string;
  category: 'user' | 'wallet' | 'network' | 'general';
  fatal: boolean;
  recoverable: boolean;
  data?: Record<string, unknown>;
}
```

### 2. Error Categories

#### User Errors (`category: 'user'`)
- **Purpose**: User-initiated actions that cannot be completed
- **Recovery**: Usually require user intervention
- **Examples**: User rejection, cancellation

```typescript
// User rejected wallet connection
throw ErrorFactory.userRejected('connect');

// User cancelled transaction
throw ErrorFactory.userRejected('transaction');
```

#### Wallet Errors (`category: 'wallet'`)
- **Purpose**: Wallet-specific issues
- **Recovery**: Often recoverable through retry or wallet switching
- **Examples**: Wallet not found, wallet locked

```typescript
// Wallet not installed
throw ErrorFactory.walletNotFound('metamask');

// Wallet connection failed
throw ErrorFactory.connectorError('phantom', 'Connection timeout');
```

#### Network Errors (`category: 'network'`)
- **Purpose**: Network and connectivity issues
- **Recovery**: Usually recoverable through retry
- **Examples**: Connection timeouts, RPC failures

```typescript
// Network connection failed
throw ErrorFactory.networkError('Failed to connect to Ethereum network');

// Transaction failed
throw ErrorFactory.transactionFailed('Gas estimation failed');
```

#### General Errors (`category: 'general'`)
- **Purpose**: System-level and unexpected errors
- **Recovery**: May require developer intervention
- **Examples**: Configuration errors, unexpected failures

```typescript
// Configuration error
throw ErrorFactory.configurationError('Invalid chain configuration');

// Unknown error
throw ErrorFactory.unknownError('Unexpected system error');
```

## Error Handling Patterns

### 1. Try-Catch with Proper Error Propagation

**✅ Correct Pattern:**
```typescript
async function connectWallet(walletId: string): Promise<Connection> {
  try {
    const connection = await adapter.connect();
    return connection;
  } catch (error) {
    // Transform error to standard format
    const standardError = ErrorFactory.fromError(error, 'wallet-connection');
    
    // Update UI state
    updateUIError(standardError);
    
    // Re-throw for caller to handle
    throw standardError;
  }
}
```

**❌ Incorrect Pattern (Error Swallowing):**
```typescript
async function connectWallet(walletId: string): Promise<Connection | null> {
  try {
    return await adapter.connect();
  } catch (error) {
    console.log('Connection failed:', error); // Only logging
    return null; // Swallowing error
  }
}
```

### 2. Error Context and Debugging Information

Always provide rich context for debugging:

```typescript
try {
  await performTransaction(params);
} catch (error) {
  throw ErrorFactory.transactionFailed(
    'Transaction execution failed',
    {
      chainId: params.chainId,
      walletId: activeWallet.id,
      transactionType: params.type,
      gasEstimate: params.gas,
      timestamp: Date.now()
    }
  );
}
```

### 3. Error Recovery Strategies

#### Automatic Recovery
```typescript
class ConnectionManager {
  async connectWithRecovery(adapter: WalletAdapter): Promise<Connection> {
    const maxRetries = 3;
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.withConnectionLock(adapter.id, async () => {
          return await adapter.connect();
        });
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw ErrorFactory.connectionFailed(
            `Failed to connect after ${maxRetries} attempts`,
            { originalError: error, attempts: maxRetries }
          );
        }
        
        // Wait before retry with exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }
}
```

#### Manual Recovery
```typescript
// Provide clear recovery options to users
if (isModalError(error)) {
  switch (error.code) {
    case 'wallet_not_found':
      // Guide user to install wallet
      showInstallWalletDialog(error.data?.walletId);
      break;
      
    case 'user_rejected':
      // Allow user to retry
      showRetryDialog();
      break;
      
    case 'network_error':
      // Suggest network troubleshooting
      showNetworkTroubleshootingDialog();
      break;
      
    default:
      // Generic error handling
      showGenericErrorDialog(error);
  }
}
```

## Error Handling in Different Components

### 1. Modal Controller Error Handling

The modal controller implements comprehensive error handling that updates UI state:

```typescript
// Enhanced error handling in action handlers
onAction: (action: string, payload?: unknown) => {
  this.handleAction(action, payload).catch((error) => {
    // Log error for debugging
    this.logger?.error('Error handling action:', error);
    
    // Update UI state to reflect the error
    const actions = useUnifiedStore.getState().actions;
    
    if (isModalError(error)) {
      actions.ui.setError(error);
    } else {
      const modalError = ErrorFactory.renderFailed(
        `Action "${action}" failed: ${error.message}`,
        'modal_action'
      );
      actions.ui.setError(modalError);
    }
    
    // Notify error handler if available
    if (this.options.errorHandler) {
      this.options.errorHandler.handleError(error, {
        component: 'modal_action',
        operation: action,
        extra: { payload }
      });
    }
  });
}
```

### 2. Transaction Service Error Handling

Enhanced with runtime type validation:

```typescript
async sendTransaction(params: TransactionParams): Promise<TransactionResult> {
  try {
    const result = await provider.request({
      method: 'eth_sendTransaction',
      params: [params]
    });

    // Validate response type at runtime
    if (typeof result !== 'string') {
      throw ErrorFactory.transactionFailed(
        `Invalid transaction hash: expected string, got ${typeof result}`,
        { result, params }
      );
    }

    return { hash: result };
  } catch (error) {
    // Transform provider errors to standard format
    throw this.createTransactionError(error, 'broadcasting', txId);
  }
}
```

### 3. Discovery Service Error Handling

Fixed fire-and-forget promise issues:

```typescript
// Proper async error handling in event handlers
private handleOriginValidationAsync(discoveredWallet: DiscoveredWallet): void {
  this.shouldSkipWalletDueToOriginValidation(discoveredWallet)
    .then((shouldSkip) => {
      if (!shouldSkip) {
        this.updateDiscoveredWallet(discoveredWallet);
      }
    })
    .catch((error) => {
      this.logger.error('Error during origin validation', {
        walletId: discoveredWallet.id,
        error,
      });
      // Fail closed - skip wallet on validation error
    });
}
```

## Error Boundaries and UI Integration

### 1. React Error Boundaries

```typescript
class WalletMeshErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to error tracking service
    if (isModalError(error)) {
      console.error('WalletMesh Error:', {
        code: error.code,
        category: error.category,
        recoverable: error.recoverable,
        data: error.data
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallbackComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### 2. Error State Management

```typescript
// Unified store error handling
const errorSlice = {
  error: null as ModalError | null,
  
  actions: {
    setError: (error: ModalError) => {
      // Update error state
      set(state => { state.ui.error = error; });
      
      // Auto-clear recoverable errors after timeout
      if (error.recoverable) {
        setTimeout(() => {
          set(state => { state.ui.error = null; });
        }, 5000);
      }
    },
    
    clearError: () => {
      set(state => { state.ui.error = null; });
    }
  }
};
```

## Best Practices

### 1. Error Prevention

- **Type Safety**: Use TypeScript strictly and validate external API responses
- **Input Validation**: Validate all user inputs and external data
- **Resource Management**: Always clean up resources in finally blocks or using try-with-resources patterns

### 2. Error Handling

- **Consistency**: Always use ErrorFactory methods instead of throwing raw Error objects
- **Context**: Provide rich debugging information in error data
- **User Experience**: Distinguish between user errors and system errors
- **Recovery**: Implement automatic recovery for transient errors

### 3. Error Reporting

- **Logging**: Use structured logging with appropriate log levels
- **Telemetry**: Report errors to monitoring systems with proper categorization
- **Privacy**: Never log sensitive user data (private keys, personal information)

### 4. Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  it('should handle wallet connection failures gracefully', async () => {
    const mockAdapter = createMockAdapter();
    mockAdapter.connect.mockRejectedValue(new Error('Connection failed'));

    await expect(connectionManager.connect(mockAdapter)).rejects.toThrow();
    
    // Verify error state is properly set
    const state = connectionManager.getConnectionState('test-wallet');
    expect(state?.status).toBe('error');
    expect(state?.error).toBeDefined();
  });

  it('should recover from transient network errors', async () => {
    // Test retry logic
    const mockProvider = createMockProvider();
    mockProvider.request
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockResolvedValueOnce('0x123...');

    const result = await transactionService.sendTransaction(params);
    expect(result.hash).toBe('0x123...');
  });
});
```

## Migration Guide

If you're updating from an older version that had error handling issues:

### 1. Update Error Handling Patterns

**Before:**
```typescript
adapter.connect().catch(error => {
  console.log('Error:', error);
  // Error was swallowed
});
```

**After:**
```typescript
try {
  await adapter.connect();
} catch (error) {
  const standardError = ErrorFactory.fromError(error, 'connection');
  updateErrorState(standardError);
  throw standardError; // Propagate for caller to handle
}
```

### 2. Add Resource Cleanup

**Before:**
```typescript
const timer = setTimeout(callback, 1000);
// Timer might leak if component unmounts
```

**After:**
```typescript
const timer = setTimeout(callback, 1000);

// Cleanup in destroy/unmount
cleanup() {
  if (timer) {
    clearTimeout(timer);
  }
}
```

### 3. Use Type-Safe Error Handling

**Before:**
```typescript
const result = await provider.request(params) as string;
```

**After:**
```typescript
const result = await provider.request(params);
if (typeof result !== 'string') {
  throw ErrorFactory.validationError('Invalid response type', { result });
}
```

## Conclusion

The error handling system in modal-core is designed to provide:

- **Robustness**: Graceful handling of all error scenarios
- **Developer Experience**: Clear error messages and recovery paths
- **User Experience**: Appropriate error feedback and recovery options
- **Maintainability**: Consistent patterns and debugging information

Always follow these patterns to maintain the reliability and quality of the wallet integration experience.