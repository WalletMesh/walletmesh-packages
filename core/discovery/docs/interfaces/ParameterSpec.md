[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ParameterSpec

# Interface: ParameterSpec

Defined in: [core/types.ts:609](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L609)

Parameter specification for transaction and method arguments.

Defines the structure, type, and validation rules for parameters
used in blockchain transactions and RPC methods. Enables type-safe
and validated parameter handling.

## Examples

```typescript
const addressParam: ParameterSpec = {
  name: 'recipient',
  type: 'address',
  required: true,
  description: 'Recipient wallet address',
  validation: [{
    type: 'pattern',
    value: /^0x[a-fA-F0-9]{40}$/,
    message: 'Invalid Ethereum address format'
  }]
};
```

```typescript
const amountParam: ParameterSpec = {
  name: 'amount',
  type: 'uint256',
  required: true,
  description: 'Transfer amount in wei',
  validation: [
    { type: 'min', value: 1, message: 'Amount must be positive' },
    { type: 'max', value: '1000000000000000000000', message: 'Amount exceeds limit' }
  ]
};
```

## Since

0.1.0

## See

 - [ValidationRule](ValidationRule.md) for validation options
 - [TransactionType](TransactionType.md) for usage in transactions

## Properties

### description?

> `optional` **description**: `string`

Defined in: [core/types.ts:613](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L613)

***

### name

> **name**: `string`

Defined in: [core/types.ts:610](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L610)

***

### required

> **required**: `boolean`

Defined in: [core/types.ts:612](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L612)

***

### type

> **type**: `string`

Defined in: [core/types.ts:611](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L611)

***

### validation?

> `optional` **validation**: [`ValidationRule`](ValidationRule.md)[]

Defined in: [core/types.ts:614](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L614)
