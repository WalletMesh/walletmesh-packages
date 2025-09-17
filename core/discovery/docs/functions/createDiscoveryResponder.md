[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createDiscoveryResponder

# Function: createDiscoveryResponder()

> **createDiscoveryResponder**(`config`): `DiscoveryResponder`

Defined in: [core/discovery/src/responder/factory.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/responder/factory.ts#L64)

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

`DiscoveryResponder`

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
    technologies: [], // technology capabilities
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
