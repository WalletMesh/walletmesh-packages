[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionProgressTracker

# Class: ConnectionProgressTracker

Connection progress tracker

Provides a stateful progress tracker with stage management.

## Constructors

### Constructor

> **new ConnectionProgressTracker**(): `ConnectionProgressTracker`

#### Returns

`ConnectionProgressTracker`

## Methods

### getCurrent()

> **getCurrent**(): [`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Get current progress

#### Returns

[`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Current progress information

***

### getCurrentStage()

> **getCurrentStage**(): [`ConnectionStage`](../type-aliases/ConnectionStage.md)

Get current stage

#### Returns

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

Current connection stage

***

### isComplete()

> **isComplete**(): `boolean`

Check if connection is complete (connected or failed)

#### Returns

`boolean`

True if connection is complete

***

### isInProgress()

> **isInProgress**(): `boolean`

Check if connection is in progress

#### Returns

`boolean`

True if connection is in progress

***

### reset()

> **reset**(): `void`

Reset to initial state

#### Returns

`void`

***

### updateCustom()

> **updateCustom**(`progress`, `step`, `details?`): [`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Update with custom progress

#### Parameters

##### progress

`number`

Progress percentage (0-100)

##### step

`string`

Step description

##### details?

`string`

Optional additional details

#### Returns

[`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Current progress information

***

### updateStage()

> **updateStage**(`stage`, `details?`): [`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Update to a new stage

#### Parameters

##### stage

[`ConnectionStage`](../type-aliases/ConnectionStage.md)

New connection stage

##### details?

`string`

Optional additional details

#### Returns

[`ConnectionProgressInfo`](../interfaces/ConnectionProgressInfo.md)

Current progress information
