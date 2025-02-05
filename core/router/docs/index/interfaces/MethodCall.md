[**@walletmesh/router v0.4.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodCall

# Interface: MethodCall\<M\>

Defined in: [core/router/src/types.ts:251](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/types.ts#L251)

Represents a method call to be executed on a wallet.
Encapsulates both the method name and its parameters.

## Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](RouterMethodMap.md) = keyof [`RouterMethodMap`](RouterMethodMap.md)

## Properties

### method

> **method**: `M`

Defined in: [core/router/src/types.ts:253](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/types.ts#L253)

Method name to invoke on the wallet (e.g., "eth_sendTransaction")

***

### params?

> `optional` **params**: [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

Defined in: [core/router/src/types.ts:255](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/types.ts#L255)

Method parameters to pass to the wallet method. Type depends on the specific method being called.
