[**@walletmesh/router v0.4.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / HumanReadableChainPermissions

# Type Alias: HumanReadableChainPermissions

> **HumanReadableChainPermissions**: `object`

Defined in: [core/router/src/types.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/types.ts#L80)

A structured representation of permissions in a human-readable format.
Used for displaying and communicating permission states to users and applications.

## Index Signature

\[`chainId`: `string`\]: `object`

## Example

```typescript
{
  "eip155:1": {
    "eth_sendTransaction": {
      allowed: true,
      shortDescription: "Send transactions",
      longDescription: "Allow sending Ethereum transactions from your account"
    }
  }
}
```
