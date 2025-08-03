[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createDiscoveryResponder

# Function: createDiscoveryResponder()

> **createDiscoveryResponder**(`config`): [`DiscoveryResponder`](../classes/DiscoveryResponder.md)

Defined in: [responder/factory.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/responder/factory.ts#L65)

Create a discovery announcer with comprehensive validation and configuration helpers.

Factory function that creates and configures a DiscoveryResponder instance for
wallet-side discovery protocol participation. Includes built-in validation of
wallet information and security policies.

## Parameters

### config

Configuration object for the discovery announcer

#### eventTarget?

`EventTarget`

#### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

#### securityPolicy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

## Returns

[`DiscoveryResponder`](../classes/DiscoveryResponder.md)

Configured DiscoveryResponder instance ready for listening

## Throws

If configuration validation fails

## Examples

```typescript
const announcer = createDiscoveryResponder({
  responderInfo: {
    uuid: crypto.randomUUID(),
    rdns: 'com.mycompany.wallet',
    name: 'My Wallet',
    icon: 'data:image/svg+xml;base64,...',
    type: 'extension',
    version: '1.0.0',
    protocolVersion: '0.1.0',
    chains: [], // chain capabilities
    features: [] // wallet features
  },
  securityPolicy: {
    requireHttps: true,
    allowedOrigins: ['https://trusted-dapp.com']
  }
});

announcer.startListening();
```

```typescript
const announcer = createDiscoveryResponder({
  responderInfo: myResponderInfo,
  securityPolicy: {
    requireHttps: false,
    allowLocalhost: true,
    rateLimit: { enabled: false, maxRequests: 100, windowMs: 60000 }
  }
});
```

## Since

0.1.0

## See

 - [DiscoveryResponder](../classes/DiscoveryResponder.md) for the created instance
 - [createResponderInfo](../variables/createResponderInfo.md) for responder info helpers
