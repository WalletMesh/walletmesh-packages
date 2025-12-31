[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / HumanReadableChainPermissions

# Type Alias: HumanReadableChainPermissions

> **HumanReadableChainPermissions** = `object`

Defined in: [core/router/src/types.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L53)

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
