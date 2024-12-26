[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / MethodCall

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

[packages/router/src/types.ts:166](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L166)

___

### params

• `Optional` **params**: `unknown`

Method parameters to pass to the wallet method. Type depends on the specific method being called.

#### Defined in

[packages/router/src/types.ts:168](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L168)
