[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SECURITY\_PRESETS

# Variable: SECURITY\_PRESETS

> `const` **SECURITY\_PRESETS**: `Record`\<`"development"` \| `"testing"` \| `"production"` \| `"strict"`, [`SecurityPolicy`](../interfaces/SecurityPolicy.md)\>

Defined in: [core/discovery/src/presets/security.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/presets/security.ts#L33)

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
