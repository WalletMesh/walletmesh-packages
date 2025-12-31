[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / createFunctionArgNamesMiddleware

# Function: createFunctionArgNamesMiddleware()

> **createFunctionArgNamesMiddleware**(`pxe`): `JSONRPCMiddleware`\<`AztecWalletMethodMap`, `AztecHandlerContext` & `object`\>

Defined in: [middlewares/functionArgNamesMiddleware.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/middlewares/functionArgNamesMiddleware.ts#L131)

Middleware that extracts function parameter information for Aztec transactions.
This enriches the context with parameter names and types for better transaction display.
Updated to support the latest @walletmesh/aztec-rpc-wallet methods.

## Parameters

### pxe

`PXE`

## Returns

`JSONRPCMiddleware`\<`AztecWalletMethodMap`, `AztecHandlerContext` & `object`\>
