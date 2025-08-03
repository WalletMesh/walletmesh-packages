[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / Account

# Interface: Account

Defined in: [core/types.ts:421](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L421)

Account information from connected wallet.

Represents a blockchain account with address, chain information,
and optional metadata for user identification.

## Example

```typescript
const account: Account = {
  address: '0x742d35Cc6Bf1C82a1e05e1b7bd9Ec7E2E7CE',
  chainId: 'eip155:1',
  publicKey: '0x04abc123...', // Optional for some chains
  name: 'Main Account'        // Optional user-defined name
};
```

## Since

0.1.0

## See

Account information used during connection phase

## Properties

### address

> **address**: `string`

Defined in: [core/types.ts:422](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L422)

***

### chainId

> **chainId**: `string`

Defined in: [core/types.ts:423](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L423)

***

### name?

> `optional` **name**: `string`

Defined in: [core/types.ts:425](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L425)

***

### publicKey?

> `optional` **publicKey**: `string`

Defined in: [core/types.ts:424](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L424)
