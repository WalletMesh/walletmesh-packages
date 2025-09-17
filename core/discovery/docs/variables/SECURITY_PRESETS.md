[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SECURITY\_PRESETS

# Variable: SECURITY\_PRESETS

> `const` **SECURITY\_PRESETS**: `Record`\<`string`, [`SecurityPolicy`](../interfaces/SecurityPolicy.md)\>

Defined in: [core/discovery/src/presets/security.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/presets/security.ts#L32)

Pre-configured security policies for different environments.

Use these presets to quickly configure appropriate security settings
for your deployment environment.

## Example

```typescript
const initiator = new DiscoveryInitiator(
  CAPABILITY_PRESETS.ethereum,
  { name: 'My App', url: 'https://localhost:3000' },
  { security: SECURITY_PRESETS.development }
);
```

## Since

0.1.0
