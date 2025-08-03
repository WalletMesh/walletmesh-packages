[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterErrorMap

# Variable: RouterErrorMap

> `const` **RouterErrorMap**: `object`

Defined in: [core/router/src/errors.ts:6](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/router/src/errors.ts#L6)

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

### walletError

> `readonly` **walletError**: `object`

#### walletError.code

> `readonly` **code**: `-32007` = `-32007`

#### walletError.message

> `readonly` **message**: `"Wallet returned an error"` = `'Wallet returned an error'`

### walletNotAvailable

> `readonly` **walletNotAvailable**: `object`

#### walletNotAvailable.code

> `readonly` **code**: `-32004` = `-32004`

#### walletNotAvailable.message

> `readonly` **message**: `"Wallet service not available"` = `'Wallet service not available'`
