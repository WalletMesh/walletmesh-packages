[**@walletmesh/router v0.1.0**](../README.md)

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

[packages/router/src/permissions.ts:73](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/permissions.ts#L73)
