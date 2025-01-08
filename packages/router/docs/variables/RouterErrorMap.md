[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterErrorMap

# Variable: RouterErrorMap

> `const` **RouterErrorMap**: `object`

Error codes and messages for the multi-chain router

## Type declaration

### insufficientPermissions

> `readonly` **insufficientPermissions**: `object`

#### insufficientPermissions.code

> `readonly` **code**: `-32002` = `-32002`

#### insufficientPermissions.message

> `readonly` **message**: `"Insufficient permissions for method"` = `'Insufficient permissions for method'`

### invalidRequest

> `readonly` **invalidRequest**: `object`

#### invalidRequest.code

> `readonly` **code**: `-32006` = `-32006`

#### invalidRequest.message

> `readonly` **message**: `"Invalid request parameters"` = `'Invalid request parameters'`

### invalidSession

> `readonly` **invalidSession**: `object`

#### invalidSession.code

> `readonly` **code**: `-32001` = `-32001`

#### invalidSession.message

> `readonly` **message**: `"Invalid or expired session"` = `'Invalid or expired session'`

### methodNotSupported

> `readonly` **methodNotSupported**: `object`

#### methodNotSupported.code

> `readonly` **code**: `-32003` = `-32003`

#### methodNotSupported.message

> `readonly` **message**: `"Method not supported by chain"` = `'Method not supported by chain'`

### partialFailure

> `readonly` **partialFailure**: `object`

#### partialFailure.code

> `readonly` **code**: `-32005` = `-32005`

#### partialFailure.message

> `readonly` **message**: `"Partial failure"` = `'Partial failure'`

### unknownChain

> `readonly` **unknownChain**: `object`

#### unknownChain.code

> `readonly` **code**: `-32000` = `-32000`

#### unknownChain.message

> `readonly` **message**: `"Unknown chain ID"` = `'Unknown chain ID'`

### unknownError

> `readonly` **unknownError**: `object`

#### unknownError.code

> `readonly` **code**: `-32603` = `-32603`

#### unknownError.message

> `readonly` **message**: `"Internal error"` = `'Internal error'`

### walletNotAvailable

> `readonly` **walletNotAvailable**: `object`

#### walletNotAvailable.code

> `readonly` **code**: `-32004` = `-32004`

#### walletNotAvailable.message

> `readonly` **message**: `"Wallet service not available"` = `'Wallet service not available'`

## Defined in

[packages/router/src/errors.ts:6](https://github.com/WalletMesh/wm-core/blob/620c3136154d532bc396983d09d14c899368e16f/packages/router/src/errors.ts#L6)
