[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletError

# Class: WalletError

Defined in: [core/modal/src/lib/client/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L32)

Custom error class for wallet-related errors.

Extends the native Error class to provide additional context about wallet errors.
Categorizes errors by type to help with error handling and debugging.

## Example

```typescript
throw new WalletError(
  'Failed to connect to wallet',
  'transport',
  new Error('Connection refused')
);
```

## Extends

- `Error`

## Constructors

### new WalletError()

> **new WalletError**(`message`, `type`, `cause`?): [`WalletError`](WalletError.md)

Defined in: [core/modal/src/lib/client/types.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L37)

#### Parameters

##### message

`string`

##### type

`"client"` | `"adapter"` | `"transport"` | `"storage"` | `"timeout"`

##### cause?

`Error`

#### Returns

[`WalletError`](WalletError.md)

#### Overrides

`Error.constructor`

## Properties

### name

> **name**: `string` = `'WalletError'`

Defined in: [core/modal/src/lib/client/types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L33)

Always set to 'WalletError'

#### Overrides

`Error.name`

***

### cause?

> `optional` **cause**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L34)

Optional underlying error that caused this error

#### Overrides

`Error.cause`

***

### type

> `readonly` **type**: `"client"` \| `"adapter"` \| `"transport"` \| `"storage"` \| `"timeout"`

Defined in: [core/modal/src/lib/client/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L35)

Categorizes the error source:
  - 'client': Errors from the WalletMeshClient
  - 'adapter': Errors from wallet protocol adapters
  - 'transport': Communication/messaging errors
  - 'storage': Session storage/persistence errors
  - 'timeout': Operation timeout errors

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`
