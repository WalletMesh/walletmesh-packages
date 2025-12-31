[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ApprovalQueueManager

# Class: ApprovalQueueManager

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L94)

Manages a queue of pending approval requests with Promise-based blocking.

Key features:
- Each request is keyed by its unique JSON-RPC request ID
- Requests block on a Promise until explicitly resolved
- Automatic timeout handling with cleanup
- Thread-safe for concurrent request handling

## Example

```typescript
const manager = new ApprovalQueueManager({
  defaultTimeout: 60000, // 1 minute
  onTimeout: (ctx) => console.log(`Request ${ctx.requestId} timed out`),
});

// Queue an approval (blocks until resolved)
const approved = await manager.queueApproval({
  requestId: 'req-123',
  chainId: 'aztec:31337',
  method: 'aztec_wmExecuteTx',
  params: { ... },
  origin: 'https://app.example.com',
  state: 'pending',
  queuedAt: Date.now(),
});

// In wallet UI, resolve the approval
manager.resolveApproval('req-123', true); // or false to deny
```

## Constructors

### Constructor

> **new ApprovalQueueManager**(`config`): `ApprovalQueueManager`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L107)

#### Parameters

##### config

[`ApprovalQueueConfig`](../interfaces/ApprovalQueueConfig.md) = `{}`

#### Returns

`ApprovalQueueManager`

## Methods

### cleanup()

> **cleanup**(`requestId`): `void`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:276](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L276)

Clean up resources for a specific request ID.

#### Parameters

##### requestId

The request ID to clean up

`string` | `number`

#### Returns

`void`

***

### cleanupAll()

> **cleanupAll**(): `void`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:295](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L295)

Clean up all pending approvals.
This will reject all pending Promises.

#### Returns

`void`

***

### getAllPending()

> **getAllPending**(): [`ApprovalContext`](../interfaces/ApprovalContext.md)[]

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:248](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L248)

Get all pending approval contexts.

#### Returns

[`ApprovalContext`](../interfaces/ApprovalContext.md)[]

Array of all pending approval contexts

***

### getPending()

> **getPending**(`requestId`): `undefined` \| [`ApprovalContext`](../interfaces/ApprovalContext.md)

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:239](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L239)

Get a pending approval context by request ID.

#### Parameters

##### requestId

The request ID to look up

`string` | `number`

#### Returns

`undefined` \| [`ApprovalContext`](../interfaces/ApprovalContext.md)

The approval context if found, undefined otherwise

***

### getPendingCount()

> **getPendingCount**(): `number`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:257](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L257)

Get the count of pending approvals.

#### Returns

`number`

Number of pending approval requests

***

### hasPending()

> **hasPending**(`requestId`): `boolean`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:267](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L267)

Check if there is a pending approval for a request ID.

#### Parameters

##### requestId

The request ID to check

`string` | `number`

#### Returns

`boolean`

true if there is a pending approval

***

### queueApproval()

> **queueApproval**(`context`, `timeout?`): `Promise`\<`boolean`\>

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L136)

Queue an approval request and block until it is resolved.

This method creates a Promise that will not resolve until either:
1. `resolveApproval()` is called with the same requestId
2. The timeout expires (rejects with error)

#### Parameters

##### context

[`ApprovalContext`](../interfaces/ApprovalContext.md)

The approval context containing request details

##### timeout?

`number`

Optional timeout in ms (defaults to config.defaultTimeout)

#### Returns

`Promise`\<`boolean`\>

Promise that resolves to true if approved, false if denied

#### Throws

Error if the request times out or is already pending

***

### resolveApproval()

> **resolveApproval**(`requestId`, `approved`): `boolean`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:210](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/approval/ApprovalQueueManager.ts#L210)

Resolve an approval request with the user's decision.

This unblocks the Promise returned by `queueApproval()` for this request.

#### Parameters

##### requestId

The unique request ID to resolve

`string` | `number`

##### approved

`boolean`

true if user approved, false if denied

#### Returns

`boolean`

true if the approval was found and resolved, false otherwise
