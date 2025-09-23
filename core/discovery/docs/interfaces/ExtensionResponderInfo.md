[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ExtensionResponderInfo

# Interface: ExtensionResponderInfo

Defined in: [core/discovery/src/types/capabilities.ts:383](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L383)

Extension responder information.

## Since

0.1.0

## Extends

- [`BaseResponderInfo`](BaseResponderInfo.md)

## Properties

### description?

> `optional` **description**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:369](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L369)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`description`](BaseResponderInfo.md#description)

***

### downloadUrl?

> `optional` **downloadUrl**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:386](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L386)

***

### extensionId?

> `optional` **extensionId**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:385](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L385)

***

### extensionPermissions?

> `optional` **extensionPermissions**: `string`[]

Defined in: [core/discovery/src/types/capabilities.ts:388](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L388)

***

### features

> **features**: [`ResponderFeature`](ResponderFeature.md)[]

Defined in: [core/discovery/src/types/capabilities.ts:368](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L368)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`features`](BaseResponderInfo.md#features)

***

### homepage?

> `optional` **homepage**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:370](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L370)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`homepage`](BaseResponderInfo.md#homepage)

***

### icon

> **icon**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:363](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L363)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`icon`](BaseResponderInfo.md#icon)

***

### manifestVersion?

> `optional` **manifestVersion**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:387](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L387)

***

### name

> **name**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:362](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L362)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`name`](BaseResponderInfo.md#name)

***

### permissions?

> `optional` **permissions**: [`PermissionModel`](PermissionModel.md)

Defined in: [core/discovery/src/types/capabilities.ts:373](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L373)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`permissions`](BaseResponderInfo.md#permissions)

***

### platform?

> `optional` **platform**: [`ResponderPlatform`](ResponderPlatform.md)

Defined in: [core/discovery/src/types/capabilities.ts:371](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L371)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`platform`](BaseResponderInfo.md#platform)

***

### protocolVersion

> **protocolVersion**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:366](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L366)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`protocolVersion`](BaseResponderInfo.md#protocolversion)

***

### rdns

> **rdns**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:361](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L361)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`rdns`](BaseResponderInfo.md#rdns)

***

### technologies

> **technologies**: [`TechnologyCapability`](TechnologyCapability.md)[]

Defined in: [core/discovery/src/types/capabilities.ts:367](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L367)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`technologies`](BaseResponderInfo.md#technologies)

***

### transportConfig?

> `optional` **transportConfig**: [`TransportConfig`](TransportConfig.md)

Defined in: [core/discovery/src/types/capabilities.ts:374](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L374)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`transportConfig`](BaseResponderInfo.md#transportconfig)

***

### type

> **type**: `"extension"`

Defined in: [core/discovery/src/types/capabilities.ts:384](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L384)

#### Overrides

[`BaseResponderInfo`](BaseResponderInfo.md).[`type`](BaseResponderInfo.md#type)

***

### uuid

> **uuid**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:360](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L360)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`uuid`](BaseResponderInfo.md#uuid)

***

### verification?

> `optional` **verification**: [`VerificationInfo`](VerificationInfo.md)

Defined in: [core/discovery/src/types/capabilities.ts:372](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L372)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`verification`](BaseResponderInfo.md#verification)

***

### version

> **version**: `string`

Defined in: [core/discovery/src/types/capabilities.ts:365](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/types/capabilities.ts#L365)

#### Inherited from

[`BaseResponderInfo`](BaseResponderInfo.md).[`version`](BaseResponderInfo.md#version)
