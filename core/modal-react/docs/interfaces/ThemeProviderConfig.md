[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeProviderConfig

# Interface: ThemeProviderConfig

Defined in: [core/modal-react/src/theme/types.ts:198](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L198)

Theme provider configuration options

## Extended by

- [`ThemeProviderProps`](ThemeProviderProps.md)

## Properties

### cssPrefix?

> `optional` **cssPrefix**: `string`

Defined in: [core/modal-react/src/theme/types.ts:226](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L226)

CSS class prefix for theme variables

#### Default

```ts
'wm'
```

***

### customization?

> `optional` **customization**: [`ThemeCustomization`](ThemeCustomization.md)

Defined in: [core/modal-react/src/theme/types.ts:214](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L214)

Custom theme overrides

***

### disableTransitionsOnChange?

> `optional` **disableTransitionsOnChange**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:232](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L232)

Disable theme transitions during initial load

#### Default

```ts
true
```

***

### mode?

> `optional` **mode**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L203)

Initial theme mode

#### Default

```ts
'system'
```

***

### persist?

> `optional` **persist**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:209](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L209)

Whether to persist theme choice in localStorage

#### Default

```ts
true
```

***

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [core/modal-react/src/theme/types.ts:220](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L220)

Storage key for persisting theme

#### Default

```ts
'walletmesh-theme'
```
