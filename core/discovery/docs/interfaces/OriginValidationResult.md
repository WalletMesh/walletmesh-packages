[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / OriginValidationResult

# Interface: OriginValidationResult

Defined in: [core/types.ts:1395](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1395)

Origin validation result for security checks.

Contains the outcome of origin validation including the validated origin,
validation status, and any failure reasons for audit logging.

## Examples

```typescript
const valid: OriginValidationResult = {
  valid: true,
  origin: 'https://trusted-app.com',
  timestamp: Date.now()
};
```

```typescript
const invalid: OriginValidationResult = {
  valid: false,
  origin: 'http://insecure-app.com',
  reason: 'HTTPS required but HTTP used',
  timestamp: Date.now()
};
```

```typescript
const blocked: OriginValidationResult = {
  valid: false,
  origin: 'https://blocked-site.com',
  reason: 'Origin is in blocklist',
  timestamp: Date.now()
};
```

## Since

0.1.0

## See

[OriginValidator](../classes/OriginValidator.md) for validation implementation

## Properties

### origin

> **origin**: `string`

Defined in: [core/types.ts:1397](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1397)

***

### reason?

> `optional` **reason**: `string`

Defined in: [core/types.ts:1398](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1398)

***

### timestamp

> **timestamp**: `number`

Defined in: [core/types.ts:1399](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1399)

***

### valid

> **valid**: `boolean`

Defined in: [core/types.ts:1396](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1396)
