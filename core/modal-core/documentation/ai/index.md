# WalletMesh AI Documentation

Comprehensive documentation for AI agents implementing WalletMesh integrations.

## Quick Start Guides

1. [Integration Guide](ai-integration-guide.md) - Core concepts and basic integration
2. [Prompt Templates](ai-prompt-templates.md) - Common implementation patterns
3. [Code Snippets](ai-code-snippets.md) - Ready-to-use code examples
4. [Optimization Guide](ai-optimization-guide.md) - Performance best practices
5. [Validation Checklist](ai-validation-checklist.md) - Integration verification

## Framework Integration

1. [React Integration](frameworks/ai-react-integration.md)
   - React-specific patterns
   - Hooks and components
   - Performance optimization
   - Testing strategies

2. [Vue Integration](frameworks/ai-vue-integration.md)
   - Vue-specific patterns
   - Composables and components
   - Performance optimization
   - Testing strategies

See the [Framework Integration Index](frameworks/README.md) for more details.

## Problem Solving

1. [Troubleshooting Guide](ai-troubleshooting-guide.md)
   - Common issues and solutions
   - Error recovery patterns
   - Debugging strategies
   - Performance optimization

## Implementation Process

### 1. Basic Integration
```typescript
// Start with core setup
import { createWalletMesh, ChainType } from '@walletmesh/modal-core';

const { client, modal } = createWalletMesh({
  chains: [ChainType.ETHEREUM],
  providers: [ProviderInterface.EIP1193]
});

// Add essential event handlers
client.on('connected', handleConnection);
controller.on('error', handleError);

// Initialize connection
await controller.connect();
```

### 2. Framework Setup
```typescript
// Choose your framework
import { WalletProvider } from '@walletmesh/modal-react'; // For React
// or
import { WalletPlugin } from '@walletmesh/modal-vue';    // For Vue

// Follow framework-specific setup
// See framework guides for detailed implementation
```

### 3. Error Handling
```typescript
// Implement error recovery
const handleError = async (error: WalletError) => {
  const recovery = getRecoveryStrategy(error);
  if (recovery) {
    await recovery.execute();
  }
};

// Set up error monitoring
controller.on('error', handleError);
```

### 4. Testing
```typescript
// Core functionality tests
describe('WalletIntegration', () => {
  it('should handle connection', async () => {
    await controller.connect();
    expect(controller.getState().status).toBe('connected');
  });
});

// Framework-specific tests
// See framework guides for detailed testing patterns
```

## Version Compatibility

| WalletMesh Version | AI Documentation Version | Framework Support |
|-------------------|------------------------|------------------|
| 1.0.x             | 1.0.0                 | React, Vue      |
| 1.1.x             | 1.0.0                 | React, Vue      |
| 2.0.x             | 2.0.0                 | React, Vue      |

## Common Implementation Tasks

1. **Basic Connection**
   - Follow [Integration Guide](ai-integration-guide.md)
   - Use framework-specific setup
   - Implement error handling

2. **State Management**
   - Choose framework-specific patterns
   - Implement state synchronization
   - Handle state persistence

3. **Error Recovery**
   - Follow [Troubleshooting Guide](ai-troubleshooting-guide.md)
   - Implement recovery strategies
   - Add error monitoring

4. **Testing**
   - Use framework testing guides
   - Implement comprehensive tests
   - Validate integrations

## AI Implementation Notes

1. **Type System**
   - Use TypeScript for type safety
   - Follow type patterns in guides
   - Implement proper type guards

2. **Error Handling**
   - Use structured error types
   - Implement recovery patterns
   - Add error context

3. **Performance**
   - Follow framework-specific optimizations
   - Implement proper cleanup
   - Use memoization patterns

## Quick Reference

### Common Imports
```typescript
// Core functionality
import {
  createModal,
  ChainType,
  ProviderInterface,
  WalletError
} from '@walletmesh/modal-core';

// Framework-specific imports
// React
import {
  WalletProvider,
  useWallet,
  useWalletState
} from '@walletmesh/modal-react';

// Vue
import {
  WalletPlugin,
  useWallet,
  useWalletState
} from '@walletmesh/modal-vue';
```

### Error Types
```typescript
type WalletError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

const errorCodes = {
  CONNECTION: {
    WALLET_NOT_AVAILABLE: 'WALLET_NOT_AVAILABLE',
    USER_REJECTED: 'USER_REJECTED'
  },
  PROVIDER: {
    METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED'
  }
} as const;
```

### State Types
```typescript
interface WalletState {
  status: ConnectionState;
  account: string | null;
  chainId: number | null;
  error: Error | null;
}

type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';
```

## Support Resources

- [TypeDoc API Reference](/docs)
- [GitHub Repository](https://github.com/walletmesh)
- [Issue Tracker](https://github.com/walletmesh/issues)

## Updates and Maintenance

Documentation is updated with:
- New features and APIs
- Framework support changes
- Best practice updates
- Common issue solutions
- AI optimization techniques
