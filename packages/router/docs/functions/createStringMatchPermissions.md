[**@walletmesh/router v0.1.4**](../README.md)

***

[@walletmesh/router](../globals.md) / createStringMatchPermissions

# Function: createStringMatchPermissions()

> **createStringMatchPermissions**(`allowedPatterns`): [`PermissionCallback`](../type-aliases/PermissionCallback.md)

Creates a permission callback that uses string/wildcard pattern matching.
Patterns can include '*' for wildcards, e.g.:
- "eip155:1:eth_*" matches all eth_ methods on Ethereum mainnet
- "eip155:*:eth_call" matches eth_call on any EIP-155 chain
- "*:eth_call" matches eth_call on any chain
- "eip155:*:*" matches any method on any EIP-155 chain
- "*" matches everything

## Parameters

### allowedPatterns

`string`[]

## Returns

[`PermissionCallback`](../type-aliases/PermissionCallback.md)

## Defined in

[packages/router/src/permissions.ts:73](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/permissions.ts#L73)
