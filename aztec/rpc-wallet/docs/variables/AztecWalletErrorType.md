[**@walletmesh/aztec-rpc-wallet v0.4.1**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletErrorType

# Variable: AztecWalletErrorType

> `const` `readonly` **AztecWalletErrorType**: `object`

Defined in: [aztec/rpc-wallet/src/errors.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/f1347d218211e86257a0135557abd77e48e06e17/aztec/rpc-wallet/src/errors.ts#L20)

An object acting as an enum for specific Aztec Wallet RPC error types.
Each key represents a distinct error condition that can occur within the Aztec wallet system.
These keys are used to look up corresponding error codes and messages in [AztecWalletErrorMap](AztecWalletErrorMap.md).

## Type declaration

### authWitnessNotFound

> `readonly` **authWitnessNotFound**: `"authWitnessNotFound"` = `'authWitnessNotFound'`

### blockNotFound

> `readonly` **blockNotFound**: `"blockNotFound"` = `'blockNotFound'`

### chainNotSupported

> `readonly` **chainNotSupported**: `"chainNotSupported"` = `'chainNotSupported'`

### contractClassNotRegistered

> `readonly` **contractClassNotRegistered**: `"contractClassNotRegistered"` = `'contractClassNotRegistered'`

### contractInstanceNotRegistered

> `readonly` **contractInstanceNotRegistered**: `"contractInstanceNotRegistered"` = `'contractInstanceNotRegistered'`

### invalidParams

> `readonly` **invalidParams**: `"invalidParams"` = `'invalidParams'`

### invalidRequest

> `readonly` **invalidRequest**: `"invalidRequest"` = `'invalidRequest'`

### invalidResponse

> `readonly` **invalidResponse**: `"invalidResponse"` = `'invalidResponse'`

### notConnected

> `readonly` **notConnected**: `"notConnected"` = `'notConnected'`

### permissionDenied

> `readonly` **permissionDenied**: `"permissionDenied"` = `'permissionDenied'`

### refused

> `readonly` **refused**: `"refused"` = `'refused'`

### senderNotRegistered

> `readonly` **senderNotRegistered**: `"senderNotRegistered"` = `'senderNotRegistered'`

### sessionExpired

> `readonly` **sessionExpired**: `"sessionExpired"` = `'sessionExpired'`

### sessionNotFound

> `readonly` **sessionNotFound**: `"sessionNotFound"` = `'sessionNotFound'`

### transactionNotFound

> `readonly` **transactionNotFound**: `"transactionNotFound"` = `'transactionNotFound'`

### unknownInternalError

> `readonly` **unknownInternalError**: `"unknownInternalError"` = `'unknownInternalError'`

### walletNotConnected

> `readonly` **walletNotConnected**: `"walletNotConnected"` = `'walletNotConnected'`
