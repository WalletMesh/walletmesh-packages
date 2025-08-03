[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryError

# Interface: DiscoveryError

Defined in: [core/types.ts:1304](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1304)

Discovery error information for error tracking and debugging.

Provides structured error information for discovery protocol failures,
including origin tracking for security analysis and detailed context
for debugging.

## Examples

```typescript
const error: DiscoveryError = {
  code: 'ORIGIN_BLOCKED',
  message: 'Origin is not in allowlist',
  origin: 'https://malicious-site.com',
  sessionId: 'session-123',
  timestamp: Date.now(),
  details: {
    allowedOrigins: ['https://trusted-app.com'],
    attemptedOrigin: 'https://malicious-site.com'
  }
};
```

```typescript
const capabilityError: DiscoveryError = {
  code: 'CAPABILITY_NOT_SUPPORTED',
  message: 'Required chain not supported',
  sessionId: 'session-456',
  timestamp: Date.now(),
  details: {
    requested: ['eip155:1'],
    supported: ['eip155:137']
  }
};
```

## Since

0.1.0

## See

 - [DiscoveryErrorEvent](DiscoveryErrorEvent.md) for protocol error events
 - [DiscoveryErrorEvent](DiscoveryErrorEvent.md) for error event handling
 - [ERROR\_CODES](../variables/ERROR_CODES.md) in constants.ts for standard error codes
 - [SecurityPolicy](SecurityPolicy.md) for origin validation configuration

## Properties

### code

> **code**: `string`

Defined in: [core/types.ts:1305](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1305)

***

### details?

> `optional` **details**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:1310](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1310)

***

### message

> **message**: `string`

Defined in: [core/types.ts:1306](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1306)

***

### origin?

> `optional` **origin**: `string`

Defined in: [core/types.ts:1307](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1307)

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [core/types.ts:1308](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1308)

***

### timestamp

> **timestamp**: `number`

Defined in: [core/types.ts:1309](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1309)
