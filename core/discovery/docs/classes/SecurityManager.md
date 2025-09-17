[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SecurityManager

# Class: SecurityManager

Defined in: [core/discovery/src/security.ts:561](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/security.ts#L561)

Integrated security manager combining all security features.

## Since

0.1.0

## Constructors

### Constructor

> **new SecurityManager**(`policy?`, `logger?`): `SecurityManager`

Defined in: [core/discovery/src/security.ts:566](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/security.ts#L566)

#### Parameters

##### policy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

##### logger?

[`Logger`](../interfaces/Logger.md) = `defaultLogger`

#### Returns

`SecurityManager`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [core/discovery/src/security.ts:628](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/security.ts#L628)

Cleanup resources.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/discovery/src/security.ts:611](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/security.ts#L611)

Get security statistics.

#### Returns

`object`

##### rateLimitStats

> **rateLimitStats**: `object`

###### rateLimitStats.activeOrigins

> **activeOrigins**: `object`[]

##### sessionState

> **sessionState**: [`SessionTrackingState`](../interfaces/SessionTrackingState.md)

***

### updatePolicy()

> **updatePolicy**(`policy`): `void`

Defined in: [core/discovery/src/security.ts:601](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/security.ts#L601)

Update security policy.

#### Parameters

##### policy

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

#### Returns

`void`

***

### validateRequest()

> **validateRequest**(`origin`, `sessionId`): `object`

Defined in: [core/discovery/src/security.ts:575](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/security.ts#L575)

Validate a discovery request comprehensively.

#### Parameters

##### origin

`string`

##### sessionId

`string`

#### Returns

`object`

##### reason?

> `optional` **reason**: `string`

##### valid

> **valid**: `boolean`
