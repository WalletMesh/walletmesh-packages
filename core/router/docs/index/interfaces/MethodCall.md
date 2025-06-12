[**@walletmesh/router v0.5.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodCall

# Interface: MethodCall\<M\>

Defined in: [core/router/src/types.ts:224](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/types.ts#L224)

Represents a method call to be executed on a wallet.
Encapsulates both the method name and its parameters.

## Type Parameters

### M

`M` *extends* keyof [`RouterMethodMap`](RouterMethodMap.md) = keyof [`RouterMethodMap`](RouterMethodMap.md)

## Properties

### method

> **method**: `M`

Defined in: [core/router/src/types.ts:226](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/types.ts#L226)

Method name to invoke on the wallet (e.g., "eth_sendTransaction")

***

### params?

> `optional` **params**: [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

Defined in: [core/router/src/types.ts:228](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/types.ts#L228)

Method parameters to pass to the wallet method. Type depends on the specific method being called.
