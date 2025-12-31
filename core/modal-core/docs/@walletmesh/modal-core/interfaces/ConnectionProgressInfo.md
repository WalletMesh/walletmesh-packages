[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionProgressInfo

# Interface: ConnectionProgressInfo

Connection progress information

Note: This is distinct from ConnectionService's ConnectionProgress interface.
ConnectionProgressInfo provides framework-agnostic progress tracking with stages,
while ConnectionService's interface is used internally for service communication.

## Properties

### details?

> `optional` **details**: `string`

Optional step details

***

### progress

> **progress**: `number`

Progress percentage (0-100)

***

### stage

> **stage**: [`ConnectionStage`](../type-aliases/ConnectionStage.md)

Current stage

***

### step

> **step**: `string`

Step description
