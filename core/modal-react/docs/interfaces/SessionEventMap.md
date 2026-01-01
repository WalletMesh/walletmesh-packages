[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionEventMap

# Interface: SessionEventMap

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:533

Session event types

## Properties

### session:account-switched

> **session:account-switched**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:550

#### selectionRecord

> **selectionRecord**: [`AccountSelectionRecord`](AccountSelectionRecord.md)

#### sessionId

> **sessionId**: `string`

***

### session:accounts-discovered

> **session:accounts-discovered**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:554

#### accounts

> **accounts**: `AccountInfo`[]

#### sessionId

> **sessionId**: `string`

***

### session:chain-switched

> **session:chain-switched**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:546

#### sessionId

> **sessionId**: `string`

#### switchRecord

> **switchRecord**: [`ChainSwitchRecord`](ChainSwitchRecord.md)

***

### session:created

> **session:created**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:534

#### session

> **session**: [`SessionState`](SessionState.md)

***

### session:ended

> **session:ended**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:558

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

***

### session:error

> **session:error**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:566

#### error

> **error**: `Error`

#### sessionId

> **sessionId**: `string`

***

### session:expired

> **session:expired**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:562

#### expiresAt

> **expiresAt**: `number`

#### sessionId

> **sessionId**: `string`

***

### session:status-changed

> **session:status-changed**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:541

#### previousStatus

> **previousStatus**: `SessionStatus`

#### sessionId

> **sessionId**: `string`

#### status

> **status**: `SessionStatus`

***

### session:updated

> **session:updated**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:537

#### changes

> **changes**: `Partial`\<[`SessionState`](SessionState.md)\>

#### session

> **session**: [`SessionState`](SessionState.md)
