[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / MethodCall

# Interface: MethodCall

Represents a method call to be executed on a wallet

## Table of contents

### Properties

- [method](MethodCall.md#method)
- [params](MethodCall.md#params)

## Properties

### method

• **method**: `string`

Method name to invoke on the wallet

#### Defined in

[packages/router/src/types.ts:121](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L121)

___

### params

• `Optional` **params**: `unknown`

Method parameters to pass to the wallet method. Type depends on the specific method being called.

#### Defined in

[packages/router/src/types.ts:123](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L123)
