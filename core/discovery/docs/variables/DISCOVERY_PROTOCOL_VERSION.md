[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DISCOVERY\_PROTOCOL\_VERSION

# Variable: DISCOVERY\_PROTOCOL\_VERSION

> `const` `readonly` **DISCOVERY\_PROTOCOL\_VERSION**: `"0.1.0"` = `'0.1.0'`

Defined in: [core/constants.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/constants.ts#L22)

Current version of the WalletMesh discovery protocol.

Used to ensure compatibility between different implementations.
All protocol messages include this version for validation.

## Example

```typescript
const message = {
  type: 'wallet:discovery:capability-request',
  version: DISCOVERY_PROTOCOL_VERSION,
  // ... other fields
};
```

## Since

0.1.0
