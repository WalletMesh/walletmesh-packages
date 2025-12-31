[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ApprovalContext

# Interface: ApprovalContext

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L20)

Context information for an approval request.
Each request has its own context keyed by the unique JSON-RPC request ID.

## Properties

### chainId

> **chainId**: `string`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L24)

Chain ID where the request will be executed

***

### method

> **method**: `string`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L26)

Method name being called

***

### origin?

> `optional` **origin**: `string`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L30)

Origin of the request (e.g., "https://app.example.com")

***

### params?

> `optional` **params**: `unknown`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L28)

Method parameters

***

### queuedAt

> **queuedAt**: `number`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L38)

Timestamp when the approval was queued

***

### requestId

> **requestId**: `string` \| `number`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L22)

Unique JSON-RPC request ID - the key that prevents race conditions

***

### sessionId?

> `optional` **sessionId**: `string`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L32)

Session ID for the request

***

### state

> **state**: [`ApprovalState`](../type-aliases/ApprovalState.md)

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L36)

Current state of the approval

***

### txStatusId?

> `optional` **txStatusId**: `string`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L34)

Unique transaction status ID for correlation with transaction tracking
