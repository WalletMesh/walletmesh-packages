[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createInitiatorStateMachine

# Function: createInitiatorStateMachine()

> **createInitiatorStateMachine**(`config`): [`InitiatorStateMachine`](../classes/InitiatorStateMachine.md)

Defined in: [initiator/InitiatorStateMachine.ts:313](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L313)

Create an initiator state machine with automatic message dispatch.

## Parameters

### config

[`InitiatorStateMachineConfig`](../interfaces/InitiatorStateMachineConfig.md)

Configuration for the state machine

## Returns

[`InitiatorStateMachine`](../classes/InitiatorStateMachine.md)

Configured InitiatorStateMachine instance

## Example

```typescript
const stateMachine = createInitiatorStateMachine({
  sessionId: crypto.randomUUID(),
  origin: window.location.origin,
  initiatorInfo: { ... },
  requirements: { ... },
  timeouts: {
    DISCOVERING: 5000 // 5 second timeout
  }
});
```

## Since

0.2.0
