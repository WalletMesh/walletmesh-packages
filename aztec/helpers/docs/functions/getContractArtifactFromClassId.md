[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getContractArtifactFromClassId

# Function: getContractArtifactFromClassId()

> **getContractArtifactFromClassId**(`pxe`, `contractClassId`): `Promise`\<`ContractArtifact`\>

Defined in: [helpers.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/helpers.ts#L71)

Retrieves the contract artifact for a given contract class ID.
Fetches from the PXE service and caches the result.
This is useful when the contract instance doesn't exist yet but the class is registered.

## Parameters

### pxe

`PXE`

An initialized PXE client instance.

### contractClassId

The contract class ID (can be string or object with toString()).

`string` | \{ `toString`: `string`; \}

## Returns

`Promise`\<`ContractArtifact`\>

A promise that resolves to the ContractArtifact.

## Throws

If the contract class or its artifact is not registered in the PXE.
