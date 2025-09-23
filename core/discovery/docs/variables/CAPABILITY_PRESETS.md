[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CAPABILITY\_PRESETS

# Variable: CAPABILITY\_PRESETS

> `const` **CAPABILITY\_PRESETS**: `Record`\<`string`, [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)\>

Defined in: [core/discovery/src/presets/index.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/presets/index.ts#L44)

Pre-configured capability requirements for popular blockchain ecosystems.

Use these presets as starting points for common integration scenarios.
They can be customized by spreading and overriding specific properties.

## Examples

```typescript
const initiator = new DiscoveryInitiator(
  CAPABILITY_PRESETS.ethereum,
  { name: 'My App', url: 'https://myapp.com' }
);
```

```typescript
const customRequirements = {
  ...CAPABILITY_PRESETS.ethereum,
  features: [...CAPABILITY_PRESETS.ethereum.features, 'hardware-wallet']
};
```

## Since

0.1.0
