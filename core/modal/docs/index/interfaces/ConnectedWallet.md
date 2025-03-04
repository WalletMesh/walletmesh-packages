[**@walletmesh/modal v0.0.7**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / ConnectedWallet

# Interface: ConnectedWallet

Defined in: [core/modal/src/types.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L138)

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

Defined in: [core/modal/src/types.ts:139](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L139)

Static wallet configuration

***

### state

> **state**: [`WalletState`](WalletState.md)

Defined in: [core/modal/src/types.ts:140](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L140)

Current connection state
