[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RESPONDER\_PRESETS

# Variable: RESPONDER\_PRESETS

> `const` **RESPONDER\_PRESETS**: `Record`\<`string`, [`TechnologyCapability`](../interfaces/TechnologyCapability.md)\>

Defined in: [core/discovery/src/presets/index.ts:149](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/presets/index.ts#L149)

Pre-configured technology capabilities for wallet responders.

Use these presets to quickly configure wallet capabilities
for different blockchain ecosystems.

## Example

```typescript
const responderInfo = {
  // ... other responder fields
  technologies: [RESPONDER_PRESETS.ethereum],
  features: FEATURE_PRESETS.basic
};
```

## Since

0.1.0
