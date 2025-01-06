[**@walletmesh/router v0.2.2**](../README.md)

***

[@walletmesh/router](../globals.md) / MethodCall

# Interface: MethodCall

Represents a method call to be executed on a wallet.
Encapsulates both the method name and its parameters.

## Properties

### method

> **method**: `string`

Method name to invoke on the wallet (e.g., "eth_sendTransaction")

#### Defined in

[packages/router/src/types.ts:253](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L253)

***

### params?

> `optional` **params**: `unknown`

Method parameters to pass to the wallet method. Type depends on the specific method being called.

#### Defined in

[packages/router/src/types.ts:255](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L255)
