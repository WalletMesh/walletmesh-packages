[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SecurityManager

# Class: SecurityManager

Defined in: [core/discovery/src/security.ts:542](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/security.ts#L542)

Integrated security manager combining all security features.

## Since

0.1.0

## Constructors

### Constructor

> **new SecurityManager**(`policy?`, `logger?`): `SecurityManager`

Defined in: [core/discovery/src/security.ts:547](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/security.ts#L547)

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

Defined in: [core/discovery/src/security.ts:609](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/security.ts#L609)

Cleanup resources.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/discovery/src/security.ts:592](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/security.ts#L592)

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

Defined in: [core/discovery/src/security.ts:582](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/security.ts#L582)

Update security policy.

#### Parameters

##### policy

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

#### Returns

`void`

***

### validateRequest()

> **validateRequest**(`origin`, `sessionId`): `object`

Defined in: [core/discovery/src/security.ts:556](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/security.ts#L556)

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
