[**@walletmesh/aztec-helpers v0.5.0**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getFunctionParameterInfoFromContractAddress

# Function: getFunctionParameterInfoFromContractAddress()

> **getFunctionParameterInfoFromContractAddress**(`pxe`, `contractAddress`, `functionNameOrSelector`): `Promise`\<[`FunctionParameterInfo`](../type-aliases/FunctionParameterInfo.md)[]\>

Defined in: [helpers.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/helpers/src/helpers.ts#L89)

Retrieves simplified parameter information (name and type string) for a specific function.

## Parameters

### pxe

`PXE`

An initialized PXE client instance.

### contractAddress

`string`

The Aztec address of the contract as a string.

### functionNameOrSelector

The name of the function (string) or its FunctionSelector.

`string` | `FunctionSelector`

## Returns

`Promise`\<[`FunctionParameterInfo`](../type-aliases/FunctionParameterInfo.md)[]\>

A promise that resolves to an array of [FunctionParameterInfo](../type-aliases/FunctionParameterInfo.md) objects.

## Throws

If the contract or function artifact cannot be found.
