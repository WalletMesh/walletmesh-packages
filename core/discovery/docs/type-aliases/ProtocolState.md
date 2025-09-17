[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ProtocolState

# Type Alias: ProtocolState

> **ProtocolState** = `"IDLE"` \| `"DISCOVERING"` \| `"COMPLETED"` \| `"ERROR"`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/844d707e640904b18c79eae02c3d132c85900a84/core/discovery/src/core/ProtocolStateMachine.ts#L15)

Protocol states as defined in the specification.

Discovery protocol uses a 4-state model with error handling:
- IDLE: No active discovery session
- DISCOVERING: Collecting responder announcements
- COMPLETED: Discovery finished, responders collected
- ERROR: Discovery failed due to security violations or protocol errors

## Since

0.2.0
