[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / extractFunctionArgNamesForSingle

# Function: extractFunctionArgNamesForSingle()

> **extractFunctionArgNamesForSingle**(`pxe`, `executionPayload`): `Promise`\<[`FunctionArgNames`](../type-aliases/FunctionArgNames.md)\>

Defined in: [middlewares/functionArgNamesMiddleware.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/functionArgNamesMiddleware.ts#L68)

Extracts function argument names for a single execution payload.
This is a helper function that can be used in router-level middleware.

## Parameters

### pxe

`PXE`

The PXE instance to query contract ABIs

### executionPayload

`ExecutionPayload`

Single execution payload containing calls

## Returns

`Promise`\<[`FunctionArgNames`](../type-aliases/FunctionArgNames.md)\>

Function argument names organized by contract address and function name
