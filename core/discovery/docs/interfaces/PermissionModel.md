[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / PermissionModel

# Interface: PermissionModel

Defined in: [core/types.ts:989](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L989)

Permission model specification for wallet access control.

Defines the permission structure that wallets use to control access
to various operations. Supports both required permissions that must
be granted and optional permissions that enhance functionality.

## Examples

```typescript
const permissions: PermissionModel = {
  required: ['view-accounts', 'sign-transactions'],
  optional: ['sign-messages', 'encrypt-decrypt'],
  scopes: {
    'sign-transactions': ['eth_sendTransaction', 'eth_signTransaction'],
    'sign-messages': ['eth_sign', 'personal_sign', 'eth_signTypedData']
  }
};
```

```typescript
const defiPermissions: PermissionModel = {
  required: ['view-accounts', 'sign-transactions'],
  optional: ['token-approvals', 'defi-positions'],
  scopes: {
    'token-approvals': ['unlimited', 'per-transaction'],
    'defi-positions': ['read-only', 'manage']
  }
};
```

## Since

0.1.0

## See

[BaseResponderInfo](BaseResponderInfo.md) for permission model usage

## Properties

### optional?

> `optional` **optional**: `string`[]

Defined in: [core/types.ts:991](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L991)

***

### required

> **required**: `string`[]

Defined in: [core/types.ts:990](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L990)

***

### scopes?

> `optional` **scopes**: `Record`\<`string`, `string`[]\>

Defined in: [core/types.ts:992](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L992)
