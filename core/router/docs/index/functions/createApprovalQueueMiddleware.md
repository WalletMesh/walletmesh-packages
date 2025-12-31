[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / createApprovalQueueMiddleware

# Function: createApprovalQueueMiddleware()

> **createApprovalQueueMiddleware**(`manager`, `config`, `onApprovalQueued`): `JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

Defined in: [core/router/src/approval/approvalQueueMiddleware.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/approval/approvalQueueMiddleware.ts#L77)

Creates middleware for request-based approval queuing.

This middleware:
1. Intercepts requests for methods that require approval
2. Uses the unique JSON-RPC request ID as the approval key (NOT method name)
3. Generates a txStatusId for correlation with transaction tracking
4. Creates a Promise that BLOCKS until user approves/denies
5. Calls onApprovalQueued to notify the wallet UI

The key security fix is using `request.id` as the unique key instead of
method name. This ensures concurrent requests for the same method each
get their own approval requirement.

## Parameters

### manager

[`ApprovalQueueManager`](../classes/ApprovalQueueManager.md)

The approval queue manager instance

### config

[`ApprovalQueueMiddlewareConfig`](../interfaces/ApprovalQueueMiddlewareConfig.md)

Configuration for which methods require approval

### onApprovalQueued

[`OnApprovalQueuedCallback`](../type-aliases/OnApprovalQueuedCallback.md)

Callback to notify wallet UI of pending approval

## Returns

`JSONRPCMiddleware`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), [`RouterContext`](../interfaces/RouterContext.md)\>

Middleware function for approval handling

## Example

```typescript
const manager = new ApprovalQueueManager({ debug: true });

const middleware = createApprovalQueueMiddleware(
  manager,
  {
    methodsRequiringApproval: [
      'aztec_wmExecuteTx',
      'aztec_wmDeployContract',
      'aztec_wmBatchExecute',
      'aztec_createAuthWit',
    ],
  },
  async (approvalContext) => {
    // Show approval dialog in wallet UI
    const approved = await showApprovalDialog(approvalContext);
    // Resolve the approval
    manager.resolveApproval(approvalContext.requestId, approved);
  }
);

router.addMiddleware(middleware);
```
