[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createInitiatorStateMachine

# Function: createInitiatorStateMachine()

> **createInitiatorStateMachine**(`config`): [`InitiatorStateMachine`](../classes/InitiatorStateMachine.md)

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:312](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/initiator/InitiatorStateMachine.ts#L312)

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
