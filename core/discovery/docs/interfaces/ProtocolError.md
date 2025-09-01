[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ProtocolError

# Interface: ProtocolError

Defined in: [core/types.ts:460](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L460)

**`Internal`**

Protocol error structure for internal error handling.

Used internally by implementations to represent and handle
protocol errors before converting to DiscoveryErrorEvent messages.

## Example

```typescript
const protocolError: ProtocolError = {
  code: 2001,
  message: 'Origin validation failed',
  category: 'security',
  retryable: false,
  silent: true  // Don't expose to prevent information leakage
};
```

## Since

0.1.0

## Properties

### category

> **category**: [`ErrorCategory`](../type-aliases/ErrorCategory.md)

Defined in: [core/types.ts:463](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L463)

***

### code

> **code**: `number`

Defined in: [core/types.ts:461](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L461)

***

### message

> **message**: `string`

Defined in: [core/types.ts:462](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L462)

***

### retryable

> **retryable**: `boolean`

Defined in: [core/types.ts:464](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L464)

***

### silent?

> `optional` **silent**: `boolean`

Defined in: [core/types.ts:465](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L465)
