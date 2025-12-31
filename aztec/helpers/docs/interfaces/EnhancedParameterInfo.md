[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / EnhancedParameterInfo

# Interface: EnhancedParameterInfo

Defined in: [types.ts:16](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L16)

Enhanced parameter information that preserves full ABI type

This extends the basic parameter info to include the complete AbiType object
from the contract artifact, enabling type-aware value formatting.

## Properties

### abiType

> **abiType**: `AbiType`

Defined in: [types.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L21)

The full ABI type object from Aztec

***

### name

> **name**: `string`

Defined in: [types.ts:18](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L18)

The parameter name from the contract

***

### typeString

> **typeString**: `string`

Defined in: [types.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/types.ts#L24)

Human-readable type string for display
