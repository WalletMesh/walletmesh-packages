[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletRouterConfig

# Interface: WalletRouterConfig

Defined in: [core/router/src/router.ts:64](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L64)

Configuration options for the WalletRouter.

## Properties

### approvalQueue?

> `optional` **approvalQueue**: [`ApprovalQueueRouterConfig`](ApprovalQueueRouterConfig.md)

Defined in: [core/router/src/router.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L119)

Optional approval queue configuration.
When provided, enables request-based approval tracking to prevent
race conditions where concurrent requests could bypass user approval.

#### Example

```typescript
const router = new WalletRouter(transport, wallets, permissionManager, {
  approvalQueue: {
    methodsRequiringApproval: ['aztec_wmExecuteTx', 'aztec_createAuthWit'],
    onApprovalQueued: async (ctx) => {
      const approved = await showApprovalDialog(ctx);
      router.resolveApproval(ctx.requestId, approved);
    },
  },
});
```

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/router/src/router.ts:87](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L87)

Optional flag to enable debug logging for router operations.
If true, detailed logs will be output to the console.
This also enables debug logging for underlying JSONRPCProxy instances
unless overridden in `proxyConfig`.

#### Default

```ts
false
```

***

### onSessionCreated()?

> `optional` **onSessionCreated**: (`sessionId`, `origin`) => `void`

Defined in: [core/router/src/router.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L94)

Optional callback invoked when a new session is created.
Called after the session is successfully stored in the session store.

#### Parameters

##### sessionId

`string`

The ID of the newly created session

##### origin

`string`

The origin that created the session

#### Returns

`void`

***

### onSessionDeleted()?

> `optional` **onSessionDeleted**: (`sessionId`) => `void`

Defined in: [core/router/src/router.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L100)

Optional callback invoked when a session is deleted.
Called after the session is removed from the session store.

#### Parameters

##### sessionId

`string`

The ID of the deleted session

#### Returns

`void`

***

### proxyConfig?

> `optional` **proxyConfig**: `Omit`\<`JSONRPCProxyConfig`, `"chainId"`\>

Defined in: [core/router/src/router.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L79)

Optional base configuration for JSONRPCProxy instances created by the router.
This configuration is applied to each wallet proxy, with `chainId` being
automatically set per proxy.

#### See

JSONRPCProxyConfig from @walletmesh/jsonrpc

***

### sessionStore?

> `optional` **sessionStore**: [`SessionStore`](SessionStore.md)

Defined in: [core/router/src/router.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/router.ts#L72)

Optional session store instance for persisting session data.
Defaults to an in-memory store if not provided.

#### See

 - [SessionStore](SessionStore.md)
 - [MemorySessionStore](../classes/MemorySessionStore.md)
 - [LocalStorageSessionStore](../classes/LocalStorageSessionStore.md)
