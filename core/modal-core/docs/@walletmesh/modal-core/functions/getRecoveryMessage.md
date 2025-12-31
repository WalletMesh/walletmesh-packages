[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getRecoveryMessage

# Function: getRecoveryMessage()

> **getRecoveryMessage**(`hint`): `undefined` \| `string`

Get user-friendly recovery message based on recovery hint

Provides actionable instructions for users to resolve common wallet errors.

## Parameters

### hint

The recovery hint from the formatted error

`undefined` | `"retry"` | `"install_wallet"` | `"unlock_wallet"` | `"switch_chain"` | `"user_action"`

## Returns

`undefined` \| `string`

User-friendly recovery message or undefined if no hint

## Example

```typescript
const formatted = formatError(error);
const recoveryMessage = getRecoveryMessage(formatted.recoveryHint);
if (recoveryMessage) {
  showToast(recoveryMessage);
}
```

## Since

3.0.0
