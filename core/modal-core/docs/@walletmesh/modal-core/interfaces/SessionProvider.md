[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionProvider

# Interface: SessionProvider

Provider information in session context

**IMPORTANT**: Provider instances are NOT stored in Zustand state!
- `instance` is always `null` in state to prevent cross-origin errors
- Actual provider instances are stored in ProviderRegistry
- Use `getProviderForSession(sessionId)` to retrieve the real provider

**Why**: Provider instances contain Window object references (popup, iframe)
which cause Immer to throw cross-origin SecurityError when freezing state.

## Properties

### instance

> **instance**: `null` \| [`BlockchainProvider`](BlockchainProvider.md)

Provider instance (ALWAYS null in state)

The actual provider is stored in ProviderRegistry to avoid cross-origin errors.
Use `getProviderForSession(sessionId)` from ProviderRegistry to get the real provider.

#### See

[ProviderRegistry](../classes/ProviderRegistry.md)

***

### multiChainCapable

> **multiChainCapable**: `boolean`

Whether provider supports multi-chain

***

### supportedMethods

> **supportedMethods**: `string`[]

Supported methods for this provider

***

### type

> **type**: `string`

Provider type identifier

***

### version

> **version**: `string`

Provider version
