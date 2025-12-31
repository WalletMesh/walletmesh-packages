[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / getEnhancedParameterInfo

# Function: getEnhancedParameterInfo()

> **getEnhancedParameterInfo**(`pxe`, `contractAddress`, `functionNameOrSelector`): `Promise`\<[`EnhancedParameterInfo`](../interfaces/EnhancedParameterInfo.md)[]\>

Defined in: [helpers.ts:204](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/helpers.ts#L204)

Retrieves enhanced parameter information with full ABI types preserved

This function returns complete parameter information including the full ABI type object,
which enables type-aware value formatting in the UI.

## Parameters

### pxe

`PXE`

An initialized PXE client instance.

### contractAddress

`string`

The Aztec address of the contract as a string.

### functionNameOrSelector

The name of the function (string) or its FunctionSelector.

`string` | `FunctionSelector`

## Returns

`Promise`\<[`EnhancedParameterInfo`](../interfaces/EnhancedParameterInfo.md)[]\>

A promise that resolves to an array of [EnhancedParameterInfo](../interfaces/EnhancedParameterInfo.md) objects.

## Throws

If the contract or function artifact cannot be found.

## Example

```typescript
const paramInfo = await getEnhancedParameterInfo(pxe, contractAddress, 'transfer');
// Returns:
// [
//   { name: 'recipient', abiType: { kind: 'field' }, typeString: 'field' },
//   { name: 'amount', abiType: { kind: 'field' }, typeString: 'field' }
// ]
```
