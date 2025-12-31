[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodCall

# Interface: MethodCall\<M\>

Defined in: [core/router/src/types.ts:228](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L228)

Represents a method call to be executed on a wallet.
Encapsulates both the method name and its parameters.

## Type Parameters

### M

`M` *extends* keyof [`RouterMethodMap`](RouterMethodMap.md) = keyof [`RouterMethodMap`](RouterMethodMap.md)

## Properties

### method

> **method**: `M`

Defined in: [core/router/src/types.ts:230](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L230)

Method name to invoke on the wallet (e.g., "eth_sendTransaction")

***

### params?

> `optional` **params**: [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

Defined in: [core/router/src/types.ts:232](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L232)

Method parameters to pass to the wallet method. Type depends on the specific method being called.
