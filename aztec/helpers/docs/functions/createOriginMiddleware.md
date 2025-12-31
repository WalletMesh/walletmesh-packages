[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / createOriginMiddleware

# Function: createOriginMiddleware()

> **createOriginMiddleware**(`dappOrigin?`): `JSONRPCMiddleware`\<`RouterMethodMap`, `RouterContext`\>

Defined in: [middlewares/originMiddleware.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/originMiddleware.ts#L55)

Creates middleware that injects the origin into the router context.
The origin is determined by looking at the dApp that opened this wallet window.

## Parameters

### dappOrigin?

`string`

Optional dApp origin that was already determined (e.g., from window.opener)

## Returns

`JSONRPCMiddleware`\<`RouterMethodMap`, `RouterContext`\>

Middleware function that sets the origin in context
