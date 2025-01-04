[**@walletmesh/router v0.2.1**](../README.md)

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

[packages/router/src/types.ts:80](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/router/src/types.ts#L80)
