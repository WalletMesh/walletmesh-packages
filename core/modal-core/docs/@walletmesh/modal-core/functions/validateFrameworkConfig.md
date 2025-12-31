[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / validateFrameworkConfig

# Function: validateFrameworkConfig()

> **validateFrameworkConfig**(`config`): `asserts config is FrameworkConfig`

Validate framework configuration before transformation

Performs basic validation on framework configuration to ensure required
properties are present and have valid values.

## Parameters

### config

`unknown`

Framework configuration to validate

## Returns

`asserts config is FrameworkConfig`

## Throws

If configuration is invalid

## Example

```typescript
try {
  validateFrameworkConfig(config);
  const coreConfig = transformFrameworkConfig(config);
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

## Since

3.0.0
