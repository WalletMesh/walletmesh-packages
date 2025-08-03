[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ResponderType

# Type Alias: ResponderType

> **ResponderType** = `"extension"` \| `"web"` \| `"mobile"` \| `"desktop"` \| `"hardware"`

Defined in: [core/types.ts:866](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L866)

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
