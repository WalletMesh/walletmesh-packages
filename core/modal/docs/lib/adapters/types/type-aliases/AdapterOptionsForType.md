[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / AdapterOptionsForType

# Type Alias: AdapterOptionsForType\<T\>

> **AdapterOptionsForType**\<`T`\>: `T` *extends* [`WalletMeshAztec`](../enumerations/AdapterType.md#walletmeshaztec) ? [`AztecAdapterOptions`](../interfaces/AztecAdapterOptions.md) : [`BaseAdapterOptions`](../interfaces/BaseAdapterOptions.md)

Defined in: [core/modal/src/lib/adapters/types.ts:256](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L256)

Type helper to extract the correct options type for a given adapter type.

Uses TypeScript's conditional types to map adapter types to their
corresponding options interfaces.

## Type Parameters

• **T** *extends* [`AdapterType`](../enumerations/AdapterType.md)

Type extending AdapterType

## Example

```typescript
// Type will be AztecAdapterOptions
type Options = AdapterOptionsForType<AdapterType.WalletMeshAztec>;

// Type will be BaseAdapterOptions
type BaseOptions = AdapterOptionsForType<AdapterType.ObsidionAztec>;
```
