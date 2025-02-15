[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletError

# Class: WalletError

Defined in: [core/modal/src/lib/client/types.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L45)

Specialized error class for wallet-related errors.

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

Defined in: [core/modal/src/lib/client/types.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L50)

#### Parameters

##### message

`string`

##### type

`"client"` | `"connector"` | `"transport"` | `"storage"` | `"timeout"`

##### cause?

`Error`

#### Returns

[`WalletError`](WalletError.md)

#### Overrides

`Error.constructor`

## Properties

### name

> **name**: `string` = `'WalletError'`

Defined in: [core/modal/src/lib/client/types.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L46)

Always set to 'WalletError'

#### Overrides

`Error.name`

***

### cause?

> `optional` **cause**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L47)

Optional underlying error that caused this error

#### Overrides

`Error.cause`

***

### type

> `readonly` **type**: `"client"` \| `"connector"` \| `"transport"` \| `"storage"` \| `"timeout"`

Defined in: [core/modal/src/lib/client/types.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L48)

Categorizes the error source:
  - 'client': Errors from the WalletMeshClient
  - 'connector': Errors from wallet protocol connectors
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
