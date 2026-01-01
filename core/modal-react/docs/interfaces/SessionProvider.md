[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionProvider

# Interface: SessionProvider

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:161

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:170

Provider instance (ALWAYS null in state)

The actual provider is stored in ProviderRegistry to avoid cross-origin errors.
Use `getProviderForSession(sessionId)` from ProviderRegistry to get the real provider.

#### See

[ProviderRegistry](../classes/ProviderRegistry.md)

***

### multiChainCapable

> **multiChainCapable**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:176

Whether provider supports multi-chain

***

### supportedMethods

> **supportedMethods**: `string`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:178

Supported methods for this provider

***

### type

> **type**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:172

Provider type identifier

***

### version

> **version**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:174

Provider version
