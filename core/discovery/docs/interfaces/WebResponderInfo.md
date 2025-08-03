[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / WebResponderInfo

# Interface: WebResponderInfo

Defined in: [core/types.ts:1106](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1106)

Web-based responder information for hosted responders.

Extends base responder info with web-specific metadata like
the responder's web interface URL.

## Example

```typescript
const webResponder: WebResponderInfo = {
  // ... base responder properties
  type: 'web',
  url: 'https://wallet.example.com'
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

Defined in: [core/types.ts:1052](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1052)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`chains`](BaseResponderInfo.md#chains)

***

### features

> **features**: [`ResponderFeature`](ResponderFeature.md)[]

Defined in: [core/types.ts:1053](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1053)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`features`](BaseResponderInfo.md#features)

***

### icon

> **icon**: `string`

Defined in: [core/types.ts:1039](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1039)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`icon`](BaseResponderInfo.md#icon)

***

### name

> **name**: `string`

Defined in: [core/types.ts:1038](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1038)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`name`](BaseResponderInfo.md#name)

***

### permissions?

> `optional` **permissions**: [`PermissionModel`](PermissionModel.md)

Defined in: [core/types.ts:1060](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1060)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`permissions`](BaseResponderInfo.md#permissions)

***

### platform?

> `optional` **platform**: [`ResponderPlatform`](ResponderPlatform.md)

Defined in: [core/types.ts:1049](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1049)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`platform`](BaseResponderInfo.md#platform)

***

### protocolVersion

> **protocolVersion**: `string`

Defined in: [core/types.ts:1045](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1045)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`protocolVersion`](BaseResponderInfo.md#protocolversion)

***

### rdns

> **rdns**: `string`

Defined in: [core/types.ts:1040](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1040)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`rdns`](BaseResponderInfo.md#rdns)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/types.ts:1056](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1056)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`transportConfig`](BaseResponderInfo.md#transportconfig)

***

### type

> **type**: `"web"`

Defined in: [core/types.ts:1107](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1107)

#### Overrides

[`BaseResponderInfo`](BaseResponderInfo.md).[`type`](BaseResponderInfo.md#type)

***

### url

> **url**: `string`

Defined in: [core/types.ts:1108](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1108)

***

### uuid

> **uuid**: `string`

Defined in: [core/types.ts:1041](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1041)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`uuid`](BaseResponderInfo.md#uuid)

***

### verification?

> `optional` **verification**: [`VerificationInfo`](VerificationInfo.md)

Defined in: [core/types.ts:1059](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1059)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`verification`](BaseResponderInfo.md#verification)

***

### version

> **version**: `string`

Defined in: [core/types.ts:1044](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1044)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`version`](BaseResponderInfo.md#version)
