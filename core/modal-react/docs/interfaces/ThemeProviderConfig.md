[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeProviderConfig

# Interface: ThemeProviderConfig

Defined in: [core/modal-react/src/theme/types.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L187)

Theme provider configuration options

## Extended by

- [`ThemeProviderProps`](ThemeProviderProps.md)

## Properties

### cssPrefix?

> `optional` **cssPrefix**: `string`

Defined in: [core/modal-react/src/theme/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L215)

CSS class prefix for theme variables

#### Default

```ts
'wm'
```

***

### customization?

> `optional` **customization**: [`ThemeCustomization`](ThemeCustomization.md)

Defined in: [core/modal-react/src/theme/types.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L203)

Custom theme overrides

***

### disableTransitionsOnChange?

> `optional` **disableTransitionsOnChange**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:221](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L221)

Disable theme transitions during initial load

#### Default

```ts
true
```

***

### mode?

> `optional` **mode**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L192)

Initial theme mode

#### Default

```ts
'system'
```

***

### persist?

> `optional` **persist**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:198](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L198)

Whether to persist theme choice in localStorage

#### Default

```ts
true
```

***

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [core/modal-react/src/theme/types.ts:209](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L209)

Storage key for persisting theme

#### Default

```ts
'walletmesh-theme'
```
