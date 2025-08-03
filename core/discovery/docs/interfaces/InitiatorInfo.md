[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / InitiatorInfo

# Interface: InitiatorInfo

Defined in: [core/types.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L57)

Initiator information for identification in discovery requests.

Provides responder users with context about the requesting application
to make informed connection decisions. The icon should be a data URI
for Content Security Policy compliance.

## Example

```typescript
const initiatorInfo: InitiatorInfo = {
  name: 'UniSwap Interface',
  url: 'https://app.uniswap.org',
  icon: 'data:image/svg+xml;base64,PHN2Zy4uLg==',
  description: 'Decentralized trading protocol'
};
```

## Since

0.1.0

## See

 - [DiscoveryRequestEvent](DiscoveryRequestEvent.md) for usage in discovery requests
 - [DiscoveryInitiatorConfig](DiscoveryInitiatorConfig.md) for configuration setup

## Properties

### description?

> `optional` **description**: `string`

Defined in: [core/types.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L61)

***

### icon?

> `optional` **icon**: `string`

Defined in: [core/types.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L59)

***

### name

> **name**: `string`

Defined in: [core/types.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L58)

***

### url

> **url**: `string`

Defined in: [core/types.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L60)
