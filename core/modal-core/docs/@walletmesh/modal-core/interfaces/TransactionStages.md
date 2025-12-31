[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionStages

# Interface: TransactionStages

Stage timing information for all transaction lifecycle stages

Tracks the duration of each stage for performance monitoring and UI display.
Each stage records start and optionally end times.
Uses Aztec-native terminology aligned with official Aztec.js SDK.

## Properties

### confirmed?

> `optional` **confirmed**: `object`

Confirmed stage (includes timestamp of confirmation)

#### timestamp

> **timestamp**: `number`

***

### confirming?

> `optional` **confirming**: [`StageTiming`](StageTiming.md)

Awaiting confirmation stage

***

### pending?

> `optional` **pending**: [`StageTiming`](StageTiming.md)

Pending network inclusion stage

***

### proving?

> `optional` **proving**: [`StageTiming`](StageTiming.md)

Zero-knowledge proof generation stage (Aztec only)

***

### sending?

> `optional` **sending**: [`StageTiming`](StageTiming.md)

Transaction sending/submission stage (maps to Aztec's send())

***

### simulating?

> `optional` **simulating**: [`StageTiming`](StageTiming.md)

Transaction simulation stage (maps to Aztec's simulate())
