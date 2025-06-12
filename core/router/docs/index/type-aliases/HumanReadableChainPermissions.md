[**@walletmesh/router v0.5.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / HumanReadableChainPermissions

# Type Alias: HumanReadableChainPermissions

> **HumanReadableChainPermissions** = `object`

Defined in: [core/router/src/types.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/types.ts#L53)

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
