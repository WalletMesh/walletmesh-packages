[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TransactionType

# Interface: TransactionType

Defined in: [core/types.ts:559](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L559)

Transaction type specification for blockchain operations.

Defines a standardized transaction type that can be supported across
different blockchain architectures. This enables wallets to declare
their transaction capabilities precisely.

## Example

```typescript
const evmTransfer: TransactionType = {
  id: 'evm-transfer',
  name: 'Token Transfer',
  chainTypes: ['evm'],
  parameters: [{
    name: 'to',
    type: 'address',
    required: true,
    description: 'Recipient address'
  }, {
    name: 'value',
    type: 'uint256',
    required: true,
    description: 'Amount to transfer'
  }],
  validator: 'evm-transfer-validator',
  estimator: 'evm-gas-estimator'
};
```

## Since

0.1.0

## See

 - [ParameterSpec](ParameterSpec.md) for parameter definitions
 - [ChainCapability](ChainCapability.md) for transaction type usage

## Properties

### chainTypes

> **chainTypes**: [`ChainType`](../type-aliases/ChainType.md)[]

Defined in: [core/types.ts:562](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L562)

***

### estimator?

> `optional` **estimator**: `string`

Defined in: [core/types.ts:565](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L565)

***

### id

> **id**: `string`

Defined in: [core/types.ts:560](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L560)

***

### name

> **name**: `string`

Defined in: [core/types.ts:561](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L561)

***

### parameters

> **parameters**: [`ParameterSpec`](ParameterSpec.md)[]

Defined in: [core/types.ts:563](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L563)

***

### validator?

> `optional` **validator**: `string`

Defined in: [core/types.ts:564](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L564)
