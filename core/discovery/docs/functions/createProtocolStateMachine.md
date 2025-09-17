[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createProtocolStateMachine

# Function: createProtocolStateMachine()

> **createProtocolStateMachine**(`timeouts?`): [`ProtocolStateMachine`](../classes/ProtocolStateMachine.md)

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:517](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/core/ProtocolStateMachine.ts#L517)

Create a protocol state machine with custom configuration.

## Parameters

### timeouts?

`Partial`\<[`StateTimeouts`](../interfaces/StateTimeouts.md)\>

Custom timeout configuration

## Returns

[`ProtocolStateMachine`](../classes/ProtocolStateMachine.md)

Configured state machine instance

## Example

```typescript
const stateMachine = createProtocolStateMachine({
  DISCOVERING: 5000,  // 5 seconds
  CONNECTING: 60000,  // 1 minute
});
```

## Since

0.2.0
