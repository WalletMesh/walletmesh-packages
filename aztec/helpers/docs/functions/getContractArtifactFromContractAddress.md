[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getContractArtifactFromContractAddress

# Function: getContractArtifactFromContractAddress()

> **getContractArtifactFromContractAddress**(`pxe`, `contractAddress`): `Promise`\<`ContractArtifact`\>

Defined in: [helpers.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/helpers.ts#L29)

Retrieves the contract artifact for a given contract address.
Fetches from the PXE service and caches the result.

## Parameters

### pxe

`PXE`

An initialized PXE client instance.

### contractAddress

`string`

The Aztec address of the contract as a string.

## Returns

`Promise`\<`ContractArtifact`\>

A promise that resolves to the ContractArtifact.

## Throws

If the contract or its artifact is not registered in the PXE.
