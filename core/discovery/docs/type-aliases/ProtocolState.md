[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ProtocolState

# Type Alias: ProtocolState

> **ProtocolState** = `"IDLE"` \| `"DISCOVERING"` \| `"COMPLETED"` \| `"ERROR"`

Defined in: [core/ProtocolStateMachine.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/ProtocolStateMachine.ts#L15)

Protocol states as defined in the specification.

Discovery protocol uses a 4-state model with error handling:
- IDLE: No active discovery session
- DISCOVERING: Collecting responder announcements
- COMPLETED: Discovery finished, responders collected
- ERROR: Discovery failed due to security violations or protocol errors

## Since

0.2.0
