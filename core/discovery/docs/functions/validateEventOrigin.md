[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / validateEventOrigin

# Function: validateEventOrigin()

> **validateEventOrigin**(`eventOrigin`, `claimedOrigin`, `policy?`): [`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Defined in: [security/OriginValidator.ts:571](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/security/OriginValidator.ts#L571)

Convenience function to validate event origin matches claimed origin.

Creates a temporary OriginValidator instance and performs anti-spoofing
validation. Essential for preventing session poisoning attacks in
cross-origin communication.

## Parameters

### eventOrigin

`string`

Actual origin from the event

### claimedOrigin

`string`

Origin claimed in the message

### policy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

Optional security policy (uses defaults if not provided)

## Returns

[`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Validation result with mismatch detection

## Example

```typescript
// Validate CustomEvent origin consistency
const result = validateEventOrigin(
  event.origin || window.location.origin,
  capabilityRequest.origin
);

if (!result.valid) {
  console.warn('Possible spoofing attack:', result.reason);
  return; // Reject the message
}
```

## Since

0.1.0

## See

[OriginValidator.validateEventOrigin](../classes/OriginValidator.md#validateeventorigin) for instance method
