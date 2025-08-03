[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ResponderType

# Type Alias: ResponderType

> **ResponderType** = `"extension"` \| `"web"` \| `"mobile"` \| `"desktop"` \| `"hardware"`

Defined in: [core/types.ts:866](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L866)

Responder deployment type classification.

Categorizes responders by their deployment model, which affects
integration patterns, security considerations, and user experience.

## Example

```typescript
const browserExtension: ResponderType = 'extension';
const webResponder: ResponderType = 'web';
const mobileApp: ResponderType = 'mobile';
const hardwareDevice: ResponderType = 'hardware';
```

## Since

0.1.0

## See

 - [ResponderInfo](ResponderInfo.md) for usage context
 - [ResponderPlatform](../interfaces/ResponderPlatform.md) for platform-specific requirements
 - [TransportConfig](../interfaces/TransportConfig.md) for connection configuration by type
