[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ApprovalQueueConfig

# Interface: ApprovalQueueConfig

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/ApprovalQueueManager.ts#L44)

Configuration options for the approval queue manager.

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/ApprovalQueueManager.ts#L50)

Enable debug logging

***

### defaultTimeout?

> `optional` **defaultTimeout**: `number`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/ApprovalQueueManager.ts#L46)

Default timeout in milliseconds. Defaults to 5 minutes (300000ms)

***

### onTimeout()?

> `optional` **onTimeout**: (`context`) => `void`

Defined in: [core/router/src/approval/ApprovalQueueManager.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/ApprovalQueueManager.ts#L48)

Callback invoked when an approval request times out

#### Parameters

##### context

[`ApprovalContext`](ApprovalContext.md)

#### Returns

`void`
