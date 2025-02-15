[**@walletmesh/modal v0.0.5**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletState

# Interface: WalletState

Defined in: [core/modal/src/types.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L107)

Runtime state of a connected wallet.

Contains the dynamic information about an active wallet connection,
used for session management and chain interactions.

## Remarks

- All fields are optional for type flexibility
- chain format depends on connector type
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

Defined in: [core/modal/src/types.ts:108](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L108)

Current blockchain network identifier

***

### address?

> `optional` **address**: `string`

Defined in: [core/modal/src/types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L109)

Connected wallet's blockchain address

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [core/modal/src/types.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L110)

Unique identifier for the connection session
