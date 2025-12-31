[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ProtocolState

# Type Alias: ProtocolState

> **ProtocolState** = `"IDLE"` \| `"DISCOVERING"` \| `"COMPLETED"` \| `"ERROR"`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/core/ProtocolStateMachine.ts#L15)

Protocol states as defined in the specification.

Discovery protocol uses a 4-state model with error handling:
- IDLE: No active discovery session
- DISCOVERING: Collecting responder announcements
- COMPLETED: Discovery finished, responders collected
- ERROR: Discovery failed due to security violations or protocol errors

## Since

0.2.0
