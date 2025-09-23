# Chain Service Abstraction Architecture

This document explains the new chain service abstraction architecture that enables lazy loading of blockchain-specific code.

## Problem Statement

Previously, services like `BalanceService` had blockchain-specific code embedded directly:

```typescript
// ❌ OLD: Embedded blockchain logic
class BalanceService {
  async getNativeBalance(provider, address, chainId) {
    if (isEVMProvider(provider)) {
      // Direct EVM RPC calls - always bundled
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
    }
    if (isSolanaProvider(provider)) {
      // Direct Solana calls - always bundled
      const balance = await connection.getBalance(pubkey);
    }
    // Aztec logic would also be bundled
  }
}
```

**Issues:**
- All blockchain dependencies bundled even if not used
- Hard to add new blockchain support
- No separation of concerns
- Large bundle sizes

## Solution: Chain Service Registry

The new architecture introduces a **Chain Service Registry** with lazy loading:

```typescript
// ✅ NEW: Abstracted through chain services
class BalanceService {
  async getNativeBalance(provider, address, chainId) {
    const chainType = this.getChainTypeFromId(chainId);
    
    // Chain service is loaded lazily only when needed
    const balance = await this.chainServiceRegistry.getNativeBalance(
      provider, address, chainId, chainType
    );
    
    return balance;
  }
}
```

## Architecture Components

### 1. Base Chain Service (`BaseChainService`)

Abstract interface defining standard operations:

```typescript
abstract class BaseChainService {
  abstract getNativeBalance(provider, address, chainId): Promise<ChainBalanceInfo>;
  abstract getTokenBalance(provider, address, chainId, token): Promise<ChainBalanceInfo>;
  abstract sendTransaction(provider, params, chainId): Promise<ChainTransactionResult>;
  abstract getTransactionReceipt(provider, hash, chainId): Promise<ChainTransactionResult>;
  abstract estimateGas(provider, params, chainId): Promise<string>;
  abstract supportsChain(chainId): boolean;
}
```

### 2. Chain-Specific Implementations

Each blockchain gets its own implementation:

```typescript
// Only loaded when EVM chains are used
class EVMChainService extends BaseChainService {
  async getNativeBalance(provider, address, chainId) {
    const evmProvider = this.validateEVMProvider(provider);
    const balanceHex = await evmProvider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    // ... EVM-specific logic
  }
}

// Only loaded when Solana chains are used  
class SolanaChainService extends BaseChainService {
  async getNativeBalance(provider, address, chainId) {
    const solanaProvider = this.validateSolanaProvider(provider);
    const balance = await solanaProvider.connection.getBalance(pubkey);
    // ... Solana-specific logic
  }
}

// Only loaded when Aztec chains are used
class AztecChainService extends BaseChainService {
  async getNativeBalance(provider, address, chainId) {
    // ... Aztec-specific logic using aztec.js
  }
}
```

### 3. Chain Service Registry (`ChainServiceRegistry`)

Manages lazy loading and caching:

```typescript
class ChainServiceRegistry {
  private services = new Map<ChainType, ChainServiceEntry>();

  async getChainService(chainType: ChainType, chainId: ChainId): Promise<BaseChainService> {
    const entry = this.services.get(chainType);
    
    // Return cached service if available
    if (entry.service) {
      return entry.service;
    }
    
    // Lazy load the service
    const module = await entry.loader(); // Dynamic import!
    const service = await module.createEVMChainService(this.logger);
    entry.service = service;
    
    return service;
  }

  // Built-in services registered with dynamic imports
  private registerBuiltInServices() {
    this.services.set('evm', {
      chainType: 'evm',
      loader: () => import('./evm/EVMChainService.js'), // ✨ Lazy loaded!
      isBuiltIn: true,
    });
    
    this.services.set('solana', {
      chainType: 'solana',  
      loader: () => import('./solana/SolanaChainService.js'), // ✨ Lazy loaded!
      isBuiltIn: true,
    });
    
    this.services.set('aztec', {
      chainType: 'aztec',
      loader: () => import('./aztec/AztecChainService.js'), // ✨ Lazy loaded!
      isBuiltIn: true,
    });
  }
}
```

## Benefits

### 1. **Lazy Loading**
- EVM code only loads when EVM chains are used
- Solana code only loads when Solana chains are used  
- Aztec code only loads when Aztec chains are used

### 2. **Bundle Size Optimization**
```typescript
// App only using Ethereum
// ✅ Only loads: BaseChainService + EVMChainService 
// ❌ Does NOT load: SolanaChainService + AztecChainService

// App only using Solana  
// ✅ Only loads: BaseChainService + SolanaChainService
// ❌ Does NOT load: EVMChainService + AztecChainService
```

### 3. **Dependency Management**
- `EVMChainService.js` can import `ethers` without affecting bundle if not used
- `SolanaChainService.js` can import `@solana/web3.js` without affecting bundle if not used
- `AztecChainService.js` can import `@aztec/aztec.js` without affecting bundle if not used

### 4. **Extensibility**
```typescript
// Easy to add new blockchain support
registry.registerChainService('cosmos', {
  loader: () => import('./cosmos/CosmosChainService.js')
});
```

## Usage Examples

### Basic Usage (Services)

```typescript
// In BalanceService - no blockchain-specific code
class BalanceService {
  async getNativeBalance(provider, address, chainId) {
    const chainType = this.getChainTypeFromId(chainId);
    
    // Chain service loaded lazily when first accessed
    return this.chainServiceRegistry.getNativeBalance(
      provider, address, chainId, chainType
    );
  }
}
```

### Configuration

```typescript
// Configure which chains to preload
const registry = createChainServiceRegistry(logger, {
  preloadOnInit: true,
  preloadChainTypes: ['evm'], // Only preload EVM
  cacheTimeout: 30 * 60 * 1000, // 30 minutes
});

await registry.initialize();
```

### Custom Chain Services

```typescript
// Register custom blockchain implementation
registry.registerChainService('my-chain', {
  loader: () => import('./custom/MyChainService.js')
});
```

## Integration with Existing Architecture

This builds on the existing provider system:

1. **Wallet Adapters** → Create blockchain-specific providers
2. **Providers** → Handle wallet-specific communication  
3. **Chain Services** → Handle blockchain-specific operations (NEW)
4. **Business Services** → Use chain services for blockchain operations
5. **React Hooks** → Use business services for UI logic

## Migration Strategy

1. **Phase 1**: Create chain service implementations
2. **Phase 2**: Update services to use chain service registry  
3. **Phase 3**: Remove embedded blockchain logic from services
4. **Phase 4**: Optimize bundle configurations

This approach provides the same functionality with better performance and maintainability.