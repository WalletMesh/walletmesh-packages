[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isMethodSupported

# Function: isMethodSupported()

> **isMethodSupported**(`provider`, `method`, `chainType?`): `boolean`

Check if a provider supports a specific method

## Parameters

### provider

`unknown`

Provider to check

### method

`string`

Method name to check for

### chainType?

[`ChainType`](../enumerations/ChainType.md)

Optional chain type for context

## Returns

`boolean`

True if the method is likely supported

## Example

```typescript
if (isMethodSupported(provider, 'eth_requestAccounts', 'evm')) {
  await provider.request({ method: 'eth_requestAccounts' });
}
```
