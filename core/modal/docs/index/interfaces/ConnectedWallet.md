[**@walletmesh/modal v0.0.5**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / ConnectedWallet

# Interface: ConnectedWallet

Defined in: [core/modal/src/types.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L146)

Combined wallet information and state for an active connection.

Joins the static wallet configuration with its current runtime state.
Used throughout the library to represent connected wallets.

## Example

```typescript
const wallet: ConnectedWallet = {
  info: {
    id: "my_wallet",
    name: "My Wallet",
    // ... other wallet info
  },
  state: {
    chain: "aztec:testnet",
    address: "0x1234...",
    sessionId: "abc123"
  }
};
```

## Properties

### info

> **info**: [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal/src/types.ts:147](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L147)

Static wallet configuration

***

### state

> **state**: [`WalletState`](WalletState.md)

Defined in: [core/modal/src/types.ts:148](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/types.ts#L148)

Current connection state
