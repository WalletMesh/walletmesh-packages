[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ErrorFactory

# Class: ErrorFactory

Factory class for creating standardized modal errors

Error Categories:
- 'user': User-initiated errors (usually fatal)
- 'wallet': Wallet/provider errors
- 'network': Network/connection errors (usually recoverable)
- 'general': General application errors
- 'validation': Input validation errors
- 'sandbox': Icon sandbox errors

 ErrorFactory

## Constructors

### Constructor

> **new ErrorFactory**(): `ErrorFactory`

#### Returns

`ErrorFactory`

## Methods

### cleanupFailed()

> `static` **cleanupFailed**(`message`, `operation?`): `ModalErrorImpl`

Create a cleanup failed error (recoverable)

#### Parameters

##### message

`string`

Error message

##### operation?

`string`

Cleanup operation that failed

#### Returns

`ModalErrorImpl`

Cleanup failed error

***

### configurationError()

> `static` **configurationError**(`message`, `details?`): `ModalErrorImpl`

Create a configuration error (not recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`unknown`

Additional error details

#### Returns

`ModalErrorImpl`

Configuration error

***

### connectionFailed()

> `static` **connectionFailed**(`message?`, `data?`): `ModalErrorImpl`

Create a connection failed error (recoverable)

#### Parameters

##### message?

`string` = `'Connection failed'`

Error message

##### data?

`Record`\<`string`, `unknown`\>

Additional error data

#### Returns

`ModalErrorImpl`

Connection failed error

***

### connectorError()

> `static` **connectorError**(`walletId`, `message`, `code?`, `options?`): `ModalErrorImpl`

Create a connector error with proper structure for client handling

This method creates standardized errors for wallet connectors with recovery hints
that help guide users to resolve the issue. The 'component: connector' marker
ensures proper client-side error handling.

#### Parameters

##### walletId

`string`

ID of the wallet/connector (e.g., 'metamask', 'phantom')

##### message

`string`

Human-readable error message for display

##### code?

`string`

Optional specific error code (defaults to 'CONNECTOR_ERROR')

##### options?

Additional error customization options

###### cause?

`unknown`

###### classification?

`"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`

###### data?

`Record`\<`string`, `unknown`\>

Additional error context data

###### maxRetries?

`number`

###### operation?

`string`

Operation that failed (e.g., 'connect', 'signTransaction')

###### originalError?

`unknown`

Original error from the wallet for debugging

###### recoveryHint?

`"retry"` \| `"install_wallet"` \| `"unlock_wallet"` \| `"switch_chain"` \| `"user_action"`

Hint for recovery UI:
  - 'install_wallet': User needs to install the wallet
  - 'unlock_wallet': User needs to unlock their wallet
  - 'switch_chain': User needs to switch to supported chain
  - 'retry': Temporary issue, can retry
  - 'user_action': User needs to take action in wallet

###### recoveryStrategy?

`"retry"` \| `"wait_and_retry"` \| `"manual_action"` \| `"none"`

Recovery strategy for the error

###### retryDelay?

`number`

#### Returns

`ModalErrorImpl`

Structured connector error with recovery information

#### Examples

```ts
// User rejection (fatal)
throw ErrorFactory.connectorError(
  'metamask',
  'User rejected the connection request',
  'USER_REJECTED',
  { recoveryHint: 'user_action' }
);
```

```ts
// Unsupported chain (recoverable)
throw ErrorFactory.connectorError(
  'walletconnect',
  'Chain ID 42161 is not supported',
  'UNSUPPORTED_CHAIN',
  {
    recoveryHint: 'switch_chain',
    data: { requestedChainId: 42161, supportedChains: [1, 137] }
  }
);
```

***

### create()

> `static` **create**(`code`, `message`, `category?`, `data?`): `ModalErrorImpl`

Create a modal error with specific properties

#### Parameters

##### code

`string`

Error code

##### message

`string`

Error message

##### category?

Error category

`"user"` | `"wallet"` | `"network"` | `"general"` | `"validation"` | `"sandbox"`

##### data?

`Record`\<`string`, `unknown`\>

Additional error data

#### Returns

`ModalErrorImpl`

Custom modal error

***

### fromConnectorError()

> `static` **fromConnectorError**(`walletId`, `error`, `operation?`): `ModalErrorImpl`

Transform any external wallet error into a properly structured connector error

This method analyzes error messages from wallets to automatically detect
common patterns and provide appropriate error codes and recovery hints.
It's ideal for wrapping errors from external wallet libraries.

#### Parameters

##### walletId

`string`

ID of the wallet/connector

##### error

`unknown`

Original error from wallet (Error object or string)

##### operation?

`string`

Optional operation context (e.g., 'connect', 'sign')

#### Returns

`ModalErrorImpl`

Transformed connector error with automatic pattern detection:
  - User rejection patterns → USER_REJECTED + user_action hint
  - Wallet locked patterns → WALLET_LOCKED + unlock_wallet hint
  - Not installed patterns → WALLET_NOT_FOUND + install_wallet hint
  - Chain/network patterns → UNSUPPORTED_CHAIN + switch_chain hint
  - Connection patterns → CONNECTION_FAILED + retry hint

#### Examples

```ts
// Wrap MetaMask errors
try {
  await window.ethereum.request({ method: 'eth_requestAccounts' });
} catch (error) {
  // Automatically detects pattern and sets appropriate code/hint
  throw ErrorFactory.fromConnectorError('metamask', error, 'connect');
}
```

```ts
// Wrap WalletConnect errors
try {
  await walletConnectProvider.enable();
} catch (error) {
  // Error message analyzed for patterns
  throw ErrorFactory.fromConnectorError('walletconnect', error);
}
```

***

### fromError()

> `static` **fromError**(`originalError`, `component?`): `ModalErrorImpl`

Create an error from another error (preserves original type)

#### Parameters

##### originalError

`unknown`

Original error

##### component?

`string`

Component that handled the error

#### Returns

`ModalErrorImpl`

Wrapped error

***

### gasEstimationFailed()

> `static` **gasEstimationFailed**(`message`, `details?`): `ModalErrorImpl`

Create a gas estimation failed error (recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Gas estimation details

#### Returns

`ModalErrorImpl`

Gas estimation failed error

***

### iconValidationFailed()

> `static` **iconValidationFailed**(`reason`, `details?`): `ModalErrorImpl`

Create an icon validation failed error (not recoverable)

#### Parameters

##### reason

`string`

Reason for validation failure

##### details?

`Record`\<`string`, `unknown`\>

Additional validation details

#### Returns

`ModalErrorImpl`

Icon validation error

***

### invalidAdapter()

> `static` **invalidAdapter**(`message`, `adapterType?`): `ModalErrorImpl`

Create an invalid adapter error (fatal)

#### Parameters

##### message

`string`

Error message

##### adapterType?

`string`

Type of adapter that is invalid

#### Returns

`ModalErrorImpl`

Invalid adapter error

***

### invalidParams()

> `static` **invalidParams**(`message`, `details?`): `ModalErrorImpl`

Create an invalid parameters error (not recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Parameter details

#### Returns

`ModalErrorImpl`

Invalid parameters error

***

### invalidTransport()

> `static` **invalidTransport**(`message`, `transportType?`): `ModalErrorImpl`

Create an invalid transport error (fatal)

#### Parameters

##### message

`string`

Error message

##### transportType?

`string`

Type of transport that is invalid

#### Returns

`ModalErrorImpl`

Invalid transport error

***

### isModalError()

> `static` **isModalError**(`error`): error is \{ category: "user" \| "wallet" \| "network" \| "general" \| "validation" \| "sandbox"; cause?: unknown; classification?: "network" \| "permission" \| "provider" \| "temporary" \| "permanent" \| "unknown"; code: string; data?: Record\<string, unknown\>; maxRetries?: number; message: string; recoveryStrategy?: "retry" \| "wait\_and\_retry" \| "manual\_action" \| "none"; retryDelay?: number \}

Check if an object is a ModalError

#### Parameters

##### error

`unknown`

Error to check

#### Returns

error is \{ category: "user" \| "wallet" \| "network" \| "general" \| "validation" \| "sandbox"; cause?: unknown; classification?: "network" \| "permission" \| "provider" \| "temporary" \| "permanent" \| "unknown"; code: string; data?: Record\<string, unknown\>; maxRetries?: number; message: string; recoveryStrategy?: "retry" \| "wait\_and\_retry" \| "manual\_action" \| "none"; retryDelay?: number \}

True if the error is a ModalError

***

### messageFailed()

> `static` **messageFailed**(`message`, `data?`): `ModalErrorImpl`

Create a message send failed error (recoverable)

#### Parameters

##### message

`string`

Error message

##### data?

`Record`\<`string`, `unknown`\>

Additional error data

#### Returns

`ModalErrorImpl`

Message failed error

***

### mountFailed()

> `static` **mountFailed**(`message`, `target?`): `ModalErrorImpl`

Create a mount failed error (recoverable)

#### Parameters

##### message

`string`

Error message

##### target?

`string`

Mount target that failed

#### Returns

`ModalErrorImpl`

Mount failed error

***

### networkError()

> `static` **networkError**(`message?`): `ModalErrorImpl`

Create a network error (recoverable)

#### Parameters

##### message?

`string` = `'Network error'`

Error message

#### Returns

`ModalErrorImpl`

Network error

***

### notFound()

> `static` **notFound**(`message`, `details?`): `ModalErrorImpl`

Create a not found error (not recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Additional details

#### Returns

`ModalErrorImpl`

Not found error

***

### renderFailed()

> `static` **renderFailed**(`message`, `component?`): `ModalErrorImpl`

Create a render failed error (recoverable)

#### Parameters

##### message

`string`

Error message

##### component?

`string`

Component that failed to render

#### Returns

`ModalErrorImpl`

Render failed error

***

### sandboxCreationFailed()

> `static` **sandboxCreationFailed**(`reason`, `details?`): `ModalErrorImpl`

Create a sandbox creation failed error (recoverable)

#### Parameters

##### reason

`string`

Reason for sandbox creation failure

##### details?

`Record`\<`string`, `unknown`\>

Additional failure details

#### Returns

`ModalErrorImpl`

Sandbox creation error

***

### simulationFailed()

> `static` **simulationFailed**(`message`, `details?`): `ModalErrorImpl`

Create a simulation failed error (not recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Simulation details

#### Returns

`ModalErrorImpl`

Simulation failed error

***

### timeoutError()

> `static` **timeoutError**(`message?`, `data?`): `ModalErrorImpl`

Create a request timeout error (recoverable)

#### Parameters

##### message?

`string` = `'Request timed out'`

Error message

##### data?

`Record`\<`string`, `unknown`\>

Additional error data

#### Returns

`ModalErrorImpl`

Timeout error

***

### transactionFailed()

> `static` **transactionFailed**(`message`, `details?`): `ModalErrorImpl`

Create a transaction failed error (recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Transaction details

#### Returns

`ModalErrorImpl`

Transaction failed error

***

### transactionReverted()

> `static` **transactionReverted**(`message`, `details?`): `ModalErrorImpl`

Create a transaction reverted error (not recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Transaction details

#### Returns

`ModalErrorImpl`

Transaction reverted error

***

### transportDisconnected()

> `static` **transportDisconnected**(`message`, `reason?`): `ModalErrorImpl`

Create a transport disconnected error (recoverable)

#### Parameters

##### message

`string`

Error message

##### reason?

`string`

Reason for disconnection

#### Returns

`ModalErrorImpl`

Transport disconnected error

***

### transportError()

> `static` **transportError**(`message`, `transportType?`): `ModalErrorImpl`

Create a transport unavailable error (recoverable)

#### Parameters

##### message

`string`

Error message

##### transportType?

`string`

Type of transport that failed

#### Returns

`ModalErrorImpl`

Transport error

***

### unknownError()

> `static` **unknownError**(`message?`): `ModalErrorImpl`

Create a general unknown error (not recoverable)

#### Parameters

##### message?

`string` = `'An unexpected error occurred'`

Error message

#### Returns

`ModalErrorImpl`

Unknown error

***

### userRejected()

> `static` **userRejected**(`operation?`): `ModalErrorImpl`

Create a user rejection error (not recoverable)

#### Parameters

##### operation?

`string`

Operation that was rejected

#### Returns

`ModalErrorImpl`

User rejection error

***

### validation()

> `static` **validation**(`message`, `details?`): `ModalErrorImpl`

Create a validation error (not recoverable)

#### Parameters

##### message

`string`

Error message

##### details?

`Record`\<`string`, `unknown`\>

Additional validation details

#### Returns

`ModalErrorImpl`

Validation error

***

### walletNotFound()

> `static` **walletNotFound**(`walletId?`): `ModalErrorImpl`

Create a wallet not found error (not recoverable)

#### Parameters

##### walletId?

`string`

ID of the wallet that was not found

#### Returns

`ModalErrorImpl`

Wallet not found error
