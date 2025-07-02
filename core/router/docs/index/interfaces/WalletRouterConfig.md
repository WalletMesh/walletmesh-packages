[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletRouterConfig

# Interface: WalletRouterConfig

Defined in: [core/router/src/router.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L27)

Configuration options for the WalletRouter.

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [core/router/src/router.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L50)

Optional flag to enable debug logging for router operations.
If true, detailed logs will be output to the console.
This also enables debug logging for underlying JSONRPCProxy instances
unless overridden in `proxyConfig`.

#### Default

```ts
false
```

***

### proxyConfig?

> `optional` **proxyConfig**: `Omit`\<`JSONRPCProxyConfig`, `"chainId"`\>

Defined in: [core/router/src/router.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L42)

Optional base configuration for JSONRPCProxy instances created by the router.
This configuration is applied to each wallet proxy, with `chainId` being
automatically set per proxy.

#### See

JSONRPCProxyConfig

***

### sessionStore?

> `optional` **sessionStore**: [`SessionStore`](SessionStore.md)

Defined in: [core/router/src/router.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/router.ts#L35)

Optional session store instance for persisting session data.
Defaults to an in-memory store if not provided.

#### See

 - [SessionStore](SessionStore.md)
 - [MemorySessionStore](../classes/MemorySessionStore.md)
 - [LocalStorageSessionStore](../classes/LocalStorageSessionStore.md)
