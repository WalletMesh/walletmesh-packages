[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionEventMap

# Interface: SessionEventMap

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:406

Session event types

## Properties

### session:account-switched

> **session:account-switched**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:423

#### selectionRecord

> **selectionRecord**: [`AccountSelectionRecord`](AccountSelectionRecord.md)

#### sessionId

> **sessionId**: `string`

***

### session:accounts-discovered

> **session:accounts-discovered**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:427

#### accounts

> **accounts**: `AccountInfo`[]

#### sessionId

> **sessionId**: `string`

***

### session:chain-switched

> **session:chain-switched**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:419

#### sessionId

> **sessionId**: `string`

#### switchRecord

> **switchRecord**: [`ChainSwitchRecord`](ChainSwitchRecord.md)

***

### session:created

> **session:created**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:407

#### session

> **session**: [`SessionState`](SessionState.md)

***

### session:ended

> **session:ended**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:431

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

***

### session:error

> **session:error**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:439

#### error

> **error**: `Error`

#### sessionId

> **sessionId**: `string`

***

### session:expired

> **session:expired**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:435

#### expiresAt

> **expiresAt**: `number`

#### sessionId

> **sessionId**: `string`

***

### session:status-changed

> **session:status-changed**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:414

#### previousStatus

> **previousStatus**: [`SessionStatus`](../type-aliases/SessionStatus.md)

#### sessionId

> **sessionId**: `string`

#### status

> **status**: [`SessionStatus`](../type-aliases/SessionStatus.md)

***

### session:updated

> **session:updated**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:410

#### changes

> **changes**: `Partial`\<[`SessionState`](SessionState.md)\>

#### session

> **session**: [`SessionState`](SessionState.md)
