[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ValidationRule

# Interface: ValidationRule

Defined in: [core/types.ts:660](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L660)

Validation rule for parameter values.

Provides flexible validation options for transaction and method parameters,
supporting both built-in and custom validation logic.

## Examples

```typescript
const minRule: ValidationRule = {
  type: 'min',
  value: 0,
  message: 'Value cannot be negative'
};

const maxRule: ValidationRule = {
  type: 'max',
  value: 1000000,
  message: 'Value exceeds maximum allowed'
};
```

```typescript
const hexRule: ValidationRule = {
  type: 'pattern',
  value: /^0x[a-fA-F0-9]+$/,
  message: 'Value must be a valid hex string'
};
```

```typescript
const customRule: ValidationRule = {
  type: 'custom',
  value: 'checksum-validator',
  message: 'Invalid checksum'
};
```

## Since

0.1.0

## See

[ParameterSpec](ParameterSpec.md) for usage in parameter definitions

## Properties

### message?

> `optional` **message**: `string`

Defined in: [core/types.ts:663](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L663)

***

### type

> **type**: `"custom"` \| `"min"` \| `"max"` \| `"pattern"`

Defined in: [core/types.ts:661](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L661)

***

### value

> **value**: `unknown`

Defined in: [core/types.ts:662](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L662)
