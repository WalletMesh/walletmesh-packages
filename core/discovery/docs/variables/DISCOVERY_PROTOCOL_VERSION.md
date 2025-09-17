[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DISCOVERY\_PROTOCOL\_VERSION

# Variable: DISCOVERY\_PROTOCOL\_VERSION

> `const` `readonly` **DISCOVERY\_PROTOCOL\_VERSION**: `"0.1.0"` = `'0.1.0'`

Defined in: [core/discovery/src/core/constants.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/core/constants.ts#L22)

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
