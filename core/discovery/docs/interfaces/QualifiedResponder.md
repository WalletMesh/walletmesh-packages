[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / QualifiedResponder

# Interface: QualifiedResponder

Defined in: [core/types.ts:1161](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1161)

Qualified responder information for user selection.

Simplified responder representation containing only the information
needed for user selection after capability matching. Includes
the capability intersection to show what the responder can provide.

## Example

```typescript
const qualified: QualifiedResponder = {
  responderId: 'ephemeral-uuid',
  rdns: 'com.example.wallet',
  name: 'Example Wallet',
  icon: 'data:image/svg+xml;base64,...',
  matched: {
    required: {
      chains: ['eip155:1'],
      features: ['account-management'],
      interfaces: ['eip-1193']
    }
  },
  // NEW: Transport configuration
  transportConfig: {
    type: 'extension',
    extensionId: 'abcdefghijklmnop',
    walletAdapter: 'MetaMaskAdapter'
  },
  metadata: {
    version: '1.2.3',
    responseTimestamp: Date.now()
  }
};
```

## Since

0.1.0

## See

 - [DiscoveryResponseEvent](DiscoveryResponseEvent.md) for source data
 - [DiscoveryInitiator](../classes/DiscoveryInitiator.md) for collection

## Properties

### icon

> **icon**: `string`

Defined in: [core/types.ts:1165](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1165)

***

### matched

> **matched**: [`CapabilityIntersection`](CapabilityIntersection.md)

Defined in: [core/types.ts:1166](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1166)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:1168](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1168)

***

### name

> **name**: `string`

Defined in: [core/types.ts:1164](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1164)

***

### rdns

> **rdns**: `string`

Defined in: [core/types.ts:1163](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1163)

***

### responderId

> **responderId**: `string`

Defined in: [core/types.ts:1162](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1162)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/types.ts:1167](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1167)
