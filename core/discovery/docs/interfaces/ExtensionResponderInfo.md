[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ExtensionResponderInfo

# Interface: ExtensionResponderInfo

Defined in: [core/types.ts:1082](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1082)

Extension-specific responder information for browser extensions.

Extends base responder info with extension-specific metadata like
extension ID for enhanced security.

## Example

```typescript
const extensionResponder: ExtensionResponderInfo = {
  // ... base responder properties
  type: 'extension',
  extensionId: 'abcdefghijklmnop'
};
```

## Since

0.1.0

## See

[BaseResponderInfo](BaseResponderInfo.md) for common properties

## Extends

- [`BaseResponderInfo`](BaseResponderInfo.md)

## Properties

### chains

> **chains**: [`ChainCapability`](ChainCapability.md)[]

Defined in: [core/types.ts:1052](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1052)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`chains`](BaseResponderInfo.md#chains)

***

### extensionId?

> `optional` **extensionId**: `string`

Defined in: [core/types.ts:1084](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1084)

***

### features

> **features**: [`ResponderFeature`](ResponderFeature.md)[]

Defined in: [core/types.ts:1053](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1053)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`features`](BaseResponderInfo.md#features)

***

### icon

> **icon**: `string`

Defined in: [core/types.ts:1039](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1039)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`icon`](BaseResponderInfo.md#icon)

***

### name

> **name**: `string`

Defined in: [core/types.ts:1038](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1038)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`name`](BaseResponderInfo.md#name)

***

### permissions?

> `optional` **permissions**: [`PermissionModel`](PermissionModel.md)

Defined in: [core/types.ts:1060](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1060)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`permissions`](BaseResponderInfo.md#permissions)

***

### platform?

> `optional` **platform**: [`ResponderPlatform`](ResponderPlatform.md)

Defined in: [core/types.ts:1049](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1049)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`platform`](BaseResponderInfo.md#platform)

***

### protocolVersion

> **protocolVersion**: `string`

Defined in: [core/types.ts:1045](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1045)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`protocolVersion`](BaseResponderInfo.md#protocolversion)

***

### rdns

> **rdns**: `string`

Defined in: [core/types.ts:1040](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1040)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`rdns`](BaseResponderInfo.md#rdns)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/types.ts:1056](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1056)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`transportConfig`](BaseResponderInfo.md#transportconfig)

***

### type

> **type**: `"extension"`

Defined in: [core/types.ts:1083](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1083)

#### Overrides

[`BaseResponderInfo`](BaseResponderInfo.md).[`type`](BaseResponderInfo.md#type)

***

### uuid

> **uuid**: `string`

Defined in: [core/types.ts:1041](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1041)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`uuid`](BaseResponderInfo.md#uuid)

***

### verification?

> `optional` **verification**: [`VerificationInfo`](VerificationInfo.md)

Defined in: [core/types.ts:1059](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1059)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`verification`](BaseResponderInfo.md#verification)

***

### version

> **version**: `string`

Defined in: [core/types.ts:1044](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1044)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`version`](BaseResponderInfo.md#version)
