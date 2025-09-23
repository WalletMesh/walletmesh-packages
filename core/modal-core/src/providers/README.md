# Provider Loader Implementation

This directory contains the provider loader system for lazy loading blockchain providers in the modal-core package.

## Key Components

### ProviderLoader.ts
The main provider loader class that handles:
- Dynamic import registry for EVM, Solana, and Aztec providers
- Caching mechanism for loaded providers
- `preloadConfiguredProviders` method that loads only configured chain types
- Proper error handling and type safety
- Support for provider factories that create provider instances

### Features

1. **Lazy Loading**: Providers are only loaded when needed, reducing initial bundle size
2. **Caching**: Once loaded, providers are cached to avoid duplicate imports
3. **Preloading**: Option to preload specific providers during initialization
4. **Custom Providers**: Support for registering custom provider implementations
5. **Type Safety**: Full TypeScript support with proper types
6. **Error Handling**: Comprehensive error handling with meaningful error messages

### Usage

```typescript
import { createProviderLoader, ChainType } from '@walletmesh/modal-core/providers';

// Create a provider loader
const loader = createProviderLoader({
  preloadOnInit: true,
  preloadChainTypes: [ChainType.Evm, ChainType.Solana]
});

// Initialize and preload configured providers
await loader.initialize();

// Create a provider instance when needed
const provider = await loader.createProvider(
  ChainType.Evm,
  transport,
  '0x1',
  logger
);

// Get provider status
const status = loader.getProviderStatus(ChainType.Evm);
console.log(status); // { isRegistered: true, isLoaded: true, isLoading: false, isBuiltIn: true }

// Create a provider factory for repeated use
const factory = loader.createProviderFactory();
const anotherProvider = await factory(ChainType.Solana, transport, 'mainnet-beta', logger);
```

### Provider Export Structure

Each provider module (evm.ts, solana.ts, aztec.ts) exports:
- The provider class as both a named export and default export
- Related types and interfaces
- Any provider-specific utilities

The ProviderLoader automatically handles different export formats to ensure compatibility.