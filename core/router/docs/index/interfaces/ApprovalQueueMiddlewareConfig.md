[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ApprovalQueueMiddlewareConfig

# Interface: ApprovalQueueMiddlewareConfig

Defined in: [core/router/src/approval/approvalQueueMiddleware.ts:18](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/approvalQueueMiddleware.ts#L18)

Configuration for the approval queue middleware.

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/router/src/approval/approvalQueueMiddleware.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/approvalQueueMiddleware.ts#L24)

Enable debug logging

***

### methodsRequiringApproval

> **methodsRequiringApproval**: `string`[]

Defined in: [core/router/src/approval/approvalQueueMiddleware.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/approvalQueueMiddleware.ts#L20)

Array of method names that require user approval

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [core/router/src/approval/approvalQueueMiddleware.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/approvalQueueMiddleware.ts#L22)

Timeout in milliseconds for approval requests. Defaults to 5 minutes
