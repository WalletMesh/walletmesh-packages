[**@walletmesh/aztec-helpers v0.5.7**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / formatArgumentValue

# Function: formatArgumentValue()

> **formatArgumentValue**(`value`, `abiType`): [`FormattedValue`](../interfaces/FormattedValue.md)

Defined in: [formatters.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/aztec/helpers/src/formatters.ts#L34)

Format argument value based on ABI type for display

## Parameters

### value

`unknown`

The argument value to format

### abiType

`AbiType`

The ABI type from the contract artifact

## Returns

[`FormattedValue`](../interfaces/FormattedValue.md)

Formatted value with display and raw representations

## Example

```typescript
const formatted = formatArgumentValue(
  '0x07ad992ffcf83a154156605c4afeba3fdd3edd124a71a6653b66914659407d4d',
  { kind: 'field' }
);
console.log(formatted.display); // '0x07ad99...59407d4d'
console.log(formatted.raw); // Full hex string
console.log(formatted.copyable); // true
```
