[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / StateTransitionEvent

# Interface: StateTransitionEvent

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/ProtocolStateMachine.ts#L23)

State transition events.

## Since

0.2.0

## Properties

### fromState

> **fromState**: [`ProtocolState`](../type-aliases/ProtocolState.md)

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/ProtocolStateMachine.ts#L24)

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/ProtocolStateMachine.ts#L27)

***

### timestamp

> **timestamp**: `number`

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/ProtocolStateMachine.ts#L26)

***

### toState

> **toState**: [`ProtocolState`](../type-aliases/ProtocolState.md)

Defined in: [core/discovery/src/core/ProtocolStateMachine.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/ProtocolStateMachine.ts#L25)
