[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / createFunctionArgNamesMiddleware

# Function: createFunctionArgNamesMiddleware()

> **createFunctionArgNamesMiddleware**(`pxe`): `JSONRPCMiddleware`\<`AztecWalletMethodMap`, `AztecHandlerContext` & `object`\>

Defined in: [middlewares/functionArgNamesMiddleware.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/functionArgNamesMiddleware.ts#L131)

Middleware that extracts function parameter information for Aztec transactions.
This enriches the context with parameter names and types for better transaction display.
Updated to support the latest @walletmesh/aztec-rpc-wallet methods.

## Parameters

### pxe

`PXE`

## Returns

`JSONRPCMiddleware`\<`AztecWalletMethodMap`, `AztecHandlerContext` & `object`\>
