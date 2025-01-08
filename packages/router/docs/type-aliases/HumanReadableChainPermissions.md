[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / HumanReadableChainPermissions

# Type Alias: HumanReadableChainPermissions

> **HumanReadableChainPermissions**: `object`

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

## Defined in

[packages/router/src/types.ts:80](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/types.ts#L80)
