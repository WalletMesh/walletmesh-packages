[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / InitiatorStateMachineConfig

# Interface: InitiatorStateMachineConfig

Defined in: [initiator/InitiatorStateMachine.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L24)

Configuration for the InitiatorStateMachine.

## Since

0.2.0

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [initiator/InitiatorStateMachine.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L29)

Event target for dispatching discovery messages.
Defaults to window in browser environments.

***

### initiatorInfo

> **initiatorInfo**: [`InitiatorInfo`](InitiatorInfo.md)

Defined in: [initiator/InitiatorStateMachine.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L45)

Information about the initiator application.

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [initiator/InitiatorStateMachine.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L65)

Optional logger instance.

***

### origin

> **origin**: `string`

Defined in: [initiator/InitiatorStateMachine.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L40)

Origin of the initiator application.

***

### preferences?

> `optional` **preferences**: [`CapabilityPreferences`](CapabilityPreferences.md)

Defined in: [initiator/InitiatorStateMachine.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L55)

Optional capability preferences for discovery.

***

### requirements

> **requirements**: [`CapabilityRequirements`](CapabilityRequirements.md)

Defined in: [initiator/InitiatorStateMachine.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L50)

Required capability requirements for discovery.

***

### sessionId

> **sessionId**: `string`

Defined in: [initiator/InitiatorStateMachine.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L35)

Session ID for the discovery session.
Should be generated using crypto.randomUUID().

***

### timeouts?

> `optional` **timeouts**: `Partial`\<[`StateTimeouts`](StateTimeouts.md)\>

Defined in: [initiator/InitiatorStateMachine.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/InitiatorStateMachine.ts#L60)

Custom timeouts for state transitions.
