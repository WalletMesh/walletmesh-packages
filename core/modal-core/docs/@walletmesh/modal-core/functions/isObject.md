[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isObject

# Function: isObject()

> **isObject**(`value`): `value is Record<string, unknown>`

Type guard for checking if value is an object (non-null)

Validates that a value is a plain object, excluding arrays and null.
Useful for safely accessing object properties without runtime errors.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is Record<string, unknown>`

True if value is a non-null object (not an array)

## Example

```typescript
function processConfig(config: unknown) {
  if (isObject(config)) {
    // Safe to access properties
    const timeout = config.timeout ?? 5000;
    const retries = config.retries ?? 3;
  } else {
    throw new Error('Config must be an object');
  }
}
```
