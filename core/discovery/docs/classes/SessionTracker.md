[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SessionTracker

# Class: SessionTracker

Defined in: [core/discovery/src/security.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L196)

Session tracker for preventing replay attacks.

## Since

0.1.0

## Constructors

### Constructor

> **new SessionTracker**(`options?`, `logger?`): `SessionTracker`

Defined in: [core/discovery/src/security.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L203)

#### Parameters

##### options?

[`SessionOptions`](../interfaces/SessionOptions.md)

##### logger?

[`Logger`](../interfaces/Logger.md) = `defaultLogger`

#### Returns

`SessionTracker`

## Methods

### clear()

> **clear**(): `void`

Defined in: [core/discovery/src/security.ts:297](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L297)

Clear all sessions.

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [core/discovery/src/security.ts:345](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L345)

Dispose of the tracker and cleanup resources.

#### Returns

`void`

***

### getState()

> **getState**(): [`SessionTrackingState`](../interfaces/SessionTrackingState.md)

Defined in: [core/discovery/src/security.ts:259](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L259)

Get tracking state.

#### Returns

[`SessionTrackingState`](../interfaces/SessionTrackingState.md)

***

### hasSession()

> **hasSession**(`origin`, `sessionId`): `boolean`

Defined in: [core/discovery/src/security.ts:251](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L251)

Check if a session exists.

#### Parameters

##### origin

`string`

##### sessionId

`string`

#### Returns

`boolean`

***

### trackSession()

> **trackSession**(`origin`, `sessionId`): `boolean`

Defined in: [core/discovery/src/security.ts:220](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L220)

Track a new session, returns false if it's a replay.

#### Parameters

##### origin

`string`

##### sessionId

`string`

#### Returns

`boolean`
