[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / FormattedError

# Interface: FormattedError

Formatted error information for UI display

## Properties

### code?

> `optional` **code**: `string`

Error code if available

***

### details?

> `optional` **details**: `string`

Additional details that might be helpful

***

### errorType

> **errorType**: [`ErrorType`](../enumerations/ErrorType.md)

Original error type for debugging

***

### message

> **message**: `string`

Main error message to display

***

### recoveryHint?

> `optional` **recoveryHint**: `"retry"` \| `"install_wallet"` \| `"unlock_wallet"` \| `"switch_chain"` \| `"user_action"`

Recovery hint for user actions
