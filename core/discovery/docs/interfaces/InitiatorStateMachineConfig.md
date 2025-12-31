[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / InitiatorStateMachineConfig

# Interface: InitiatorStateMachineConfig

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L23)

Configuration for the InitiatorStateMachine.

## Since

0.2.0

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L28)

Event target for dispatching discovery messages.
Defaults to window in browser environments.

***

### initiatorInfo

> **initiatorInfo**: [`InitiatorInfo`](InitiatorInfo.md)

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L44)

Information about the initiator application.

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L64)

Optional logger instance.

***

### origin

> **origin**: `string`

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L39)

Origin of the initiator application.

***

### preferences?

> `optional` **preferences**: [`CapabilityPreferences`](CapabilityPreferences.md)

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L54)

Optional capability preferences for discovery.

***

### rebroadcastEnabled?

> `optional` **rebroadcastEnabled**: `boolean`

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L76)

Whether to enable rebroadcasting of discovery requests.
Default: true in browser environments

***

### rebroadcastInterval?

> `optional` **rebroadcastInterval**: `number`

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L70)

Interval for rebroadcasting discovery requests in milliseconds.
Default: 200ms

***

### requirements

> **requirements**: [`CapabilityRequirements`](CapabilityRequirements.md)

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L49)

Required capability requirements for discovery.

***

### sessionId

> **sessionId**: `string`

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L34)

Session ID for the discovery session.
Should be generated using crypto.randomUUID().

***

### timeouts?

> `optional` **timeouts**: `Partial`\<[`StateTimeouts`](StateTimeouts.md)\>

Defined in: [core/discovery/src/initiator/InitiatorStateMachine.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/InitiatorStateMachine.ts#L59)

Custom timeouts for state transitions.
