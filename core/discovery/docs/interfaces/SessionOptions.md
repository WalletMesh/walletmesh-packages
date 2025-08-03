[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SessionOptions

# Interface: SessionOptions

Defined in: [core/types.ts:1255](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1255)

Session tracking and management options.

Configures how discovery sessions are tracked, validated, and cleaned up.
Essential for preventing session replay attacks and managing resource usage.

## Examples

```typescript
const sessionOptions: SessionOptions = {
  maxAge: 300000,              // 5 minutes
  cleanupInterval: 60000,      // 1 minute
  maxSessionsPerOrigin: 10     // Limit concurrent sessions
};
```

```typescript
const devSessionOptions: SessionOptions = {
  maxAge: 3600000,             // 1 hour
  cleanupInterval: 300000,     // 5 minutes
  maxSessionsPerOrigin: 100    // Higher limit for testing
};
```

## Since

0.1.0

## See

[DiscoveryResponderConfig](DiscoveryResponderConfig.md) for session configuration

## Properties

### cleanupInterval

> **cleanupInterval**: `number`

Defined in: [core/types.ts:1257](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1257)

***

### maxAge

> **maxAge**: `number`

Defined in: [core/types.ts:1256](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1256)

***

### maxSessionsPerOrigin

> **maxSessionsPerOrigin**: `number`

Defined in: [core/types.ts:1258](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1258)
