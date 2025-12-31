[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / OnApprovalQueuedCallback

# Type Alias: OnApprovalQueuedCallback()

> **OnApprovalQueuedCallback** = (`context`) => `void`

Defined in: [core/router/src/approval/approvalQueueMiddleware.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/approvalQueueMiddleware.ts#L31)

Callback invoked when a new approval is queued.
The wallet UI should use this to show the approval dialog.

## Parameters

### context

[`ApprovalContext`](../interfaces/ApprovalContext.md)

## Returns

`void`
