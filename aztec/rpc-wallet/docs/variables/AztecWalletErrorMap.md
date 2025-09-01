[**@walletmesh/aztec-rpc-wallet v0.5.0**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletErrorMap

# Variable: AztecWalletErrorMap

> `const` `readonly` **AztecWalletErrorMap**: `Record`\<`AztecWalletErrorType`, \{ `code`: `number`; `message`: `string`; \}\>

Defined in: [aztec/rpc-wallet/src/errors.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/fd734440d9c5e6ff3c77f868722c74b1be65d39d/aztec/rpc-wallet/src/errors.ts#L59)

A map associating each AztecWalletErrorType with a specific JSON-RPC error code
and a human-readable message. This map is used by the [AztecWalletError](../classes/AztecWalletError.md) class
to construct standardized error objects.

The error codes are chosen from the range typically reserved for server-defined errors
in JSON-RPC (e.g., -32000 to -32099).
