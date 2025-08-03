[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createProtocolStateMachine

# Function: createProtocolStateMachine()

> **createProtocolStateMachine**(`timeouts?`): [`ProtocolStateMachine`](../classes/ProtocolStateMachine.md)

Defined in: [core/ProtocolStateMachine.ts:490](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/ProtocolStateMachine.ts#L490)

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
