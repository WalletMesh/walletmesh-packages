[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponderConfig

# Interface: DiscoveryResponderConfig

Defined in: [core/types.ts:1518](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1518)

Configuration for responder-side discovery announcer.

Defines responder information, security policies, and session management
settings for responding to discovery requests from initiators.

## Example

```typescript
const config: DiscoveryResponderConfig = {
  responderInfo: {
    name: 'My Wallet',
    rdns: 'com.example.wallet',
    uuid: crypto.randomUUID(),
    version: '1.0.0',
    protocolVersion: '0.1.0',
    type: 'extension',
    icon: 'data:image/svg+xml;base64,...',
    chains: [], // chain capabilities
    features: [] // responder features
  },
  securityPolicy: {
    allowedOrigins: ['https://trusted-dapp.com'],
    requireHttps: true,
    rateLimit: {
      enabled: true,
      maxRequests: 5,
      windowMs: 60000
    }
  }
};
```

## Since

0.1.0

## See

[DiscoveryResponder](../classes/DiscoveryResponder.md) for implementation

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [core/types.ts:1522](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1522)

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [core/types.ts:1523](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1523)

***

### responderInfo

> **responderInfo**: [`ResponderInfo`](../type-aliases/ResponderInfo.md)

Defined in: [core/types.ts:1519](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1519)

***

### securityPolicy?

> `optional` **securityPolicy**: [`SecurityPolicy`](SecurityPolicy.md)

Defined in: [core/types.ts:1520](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1520)

***

### sessionOptions?

> `optional` **sessionOptions**: [`SessionOptions`](SessionOptions.md)

Defined in: [core/types.ts:1521](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1521)
