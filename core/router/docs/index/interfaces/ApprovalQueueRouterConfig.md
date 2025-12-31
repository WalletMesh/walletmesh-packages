[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ApprovalQueueRouterConfig

# Interface: ApprovalQueueRouterConfig

Defined in: [core/router/src/router.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/router.ts#L36)

Configuration for the approval queue system.
Enables request-based approval tracking to prevent race conditions.

## Properties

### defaultTimeout?

> `optional` **defaultTimeout**: `number`

Defined in: [core/router/src/router.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/router.ts#L50)

Timeout in milliseconds for approval requests.
After this time, the request will be automatically rejected.

#### Default

```ts
300000 (5 minutes)
```

***

### methodsRequiringApproval

> **methodsRequiringApproval**: `string`[]

Defined in: [core/router/src/router.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/router.ts#L44)

Array of method names that require user approval.
Each request for these methods will be queued and blocked until
explicitly approved or denied by the user.

#### Example

```ts
['aztec_wmExecuteTx', 'aztec_wmDeployContract', 'aztec_createAuthWit']
```

***

### onApprovalQueued

> **onApprovalQueued**: [`OnApprovalQueuedCallback`](../type-aliases/OnApprovalQueuedCallback.md)

Defined in: [core/router/src/router.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/router.ts#L58)

Callback invoked when a new approval is queued.
The wallet UI should use this to display the approval dialog.
The wallet must call `router.resolveApproval(requestId, approved)` to resolve.

#### Param

The approval context with request details
