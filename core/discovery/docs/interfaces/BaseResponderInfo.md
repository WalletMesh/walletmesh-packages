[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / BaseResponderInfo

# Interface: BaseResponderInfo

Defined in: [core/types.ts:1036](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1036)

Base responder information schema for discovery protocol.

Comprehensive responder metadata including identification, capabilities,
security features, and platform requirements. Used for capability
matching and user selection during discovery.

## Example

```typescript
const responderInfo: BaseResponderInfo = {
  name: 'Example Wallet',
  icon: 'data:image/svg+xml;base64,...',
  rdns: 'com.example.wallet',
  uuid: crypto.randomUUID(),
  version: '1.2.3',
  protocolVersion: '0.1.0',
  type: 'extension',
  chains: [{
    chainId: 'eip155:1',
    chainType: 'evm',
    // ... chain capabilities
  }],
  features: [{
    id: 'hardware-wallet',
    name: 'Hardware Security'
  }],
  // NEW: Transport configuration
  transportConfig: {
    type: 'extension',
    extensionId: 'abcdefghijklmnop',
    walletAdapter: 'MetaMaskAdapter'
  }
};
```

## Since

0.1.0

## See

 - [ExtensionResponderInfo](ExtensionResponderInfo.md) for browser extension responders
 - [WebResponderInfo](WebResponderInfo.md) for web-based responders
 - [DiscoveryResponder](../classes/DiscoveryResponder.md) for announcement implementation

## Extended by

- [`ExtensionResponderInfo`](ExtensionResponderInfo.md)
- [`WebResponderInfo`](WebResponderInfo.md)

## Properties

### chains

> **chains**: [`ChainCapability`](ChainCapability.md)[]

Defined in: [core/types.ts:1052](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1052)

***

### features

> **features**: [`ResponderFeature`](ResponderFeature.md)[]

Defined in: [core/types.ts:1053](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1053)

***

### icon

> **icon**: `string`

Defined in: [core/types.ts:1039](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1039)

***

### name

> **name**: `string`

Defined in: [core/types.ts:1038](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1038)

***

### permissions?

> `optional` **permissions**: [`PermissionModel`](PermissionModel.md)

Defined in: [core/types.ts:1060](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1060)

***

### platform?

> `optional` **platform**: [`ResponderPlatform`](ResponderPlatform.md)

Defined in: [core/types.ts:1049](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1049)

***

### protocolVersion

> **protocolVersion**: `string`

Defined in: [core/types.ts:1045](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1045)

***

### rdns

> **rdns**: `string`

Defined in: [core/types.ts:1040](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1040)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/types.ts:1056](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1056)

***

### type

> **type**: [`ResponderType`](../type-aliases/ResponderType.md)

Defined in: [core/types.ts:1048](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1048)

***

### uuid

> **uuid**: `string`

Defined in: [core/types.ts:1041](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1041)

***

### verification?

> `optional` **verification**: [`VerificationInfo`](VerificationInfo.md)

Defined in: [core/types.ts:1059](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1059)

***

### version

> **version**: `string`

Defined in: [core/types.ts:1044](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1044)
