[**@walletmesh/modal v0.0.5**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletState

# Interface: WalletState

Defined in: [core/modal/src/types.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L115)

Runtime state of a connected wallet.

Contains the dynamic information about an active wallet connection,
used for session management and chain interactions.

## Remarks

- All fields are optional for type flexibility
- chain format depends on adapter type
- address format depends on chain
- sessionId is used for reconnection

## Example

```typescript
const state: WalletState = {
  chain: "aztec:testnet",
  address: "0x1234...",
  sessionId: "session_abc123"
};
```

## Properties

### chain?

> `optional` **chain**: `string`

Defined in: [core/modal/src/types.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L116)

Current blockchain network identifier

***

### address?

> `optional` **address**: `string`

Defined in: [core/modal/src/types.ts:117](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L117)

Connected wallet's blockchain address

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [core/modal/src/types.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L118)

Unique identifier for the connection session
