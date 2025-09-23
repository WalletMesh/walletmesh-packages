[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeProviderProps

# Interface: ThemeProviderProps

Defined in: [core/modal-react/src/theme/ThemeContext.tsx:41](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/ThemeContext.tsx#L41)

Props for ThemeProvider component

## Extends

- [`ThemeProviderConfig`](ThemeProviderConfig.md)

## Properties

### children

> **children**: `ReactNode`

Defined in: [core/modal-react/src/theme/ThemeContext.tsx:42](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/ThemeContext.tsx#L42)

***

### cssPrefix?

> `optional` **cssPrefix**: `string`

Defined in: [core/modal-react/src/theme/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L215)

CSS class prefix for theme variables

#### Default

```ts
'wm'
```

#### Inherited from

[`ThemeProviderConfig`](ThemeProviderConfig.md).[`cssPrefix`](ThemeProviderConfig.md#cssprefix)

***

### customization?

> `optional` **customization**: [`ThemeCustomization`](ThemeCustomization.md)

Defined in: [core/modal-react/src/theme/types.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L203)

Custom theme overrides

#### Inherited from

[`ThemeProviderConfig`](ThemeProviderConfig.md).[`customization`](ThemeProviderConfig.md#customization)

***

### disableTransitionsOnChange?

> `optional` **disableTransitionsOnChange**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:221](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L221)

Disable theme transitions during initial load

#### Default

```ts
true
```

#### Inherited from

[`ThemeProviderConfig`](ThemeProviderConfig.md).[`disableTransitionsOnChange`](ThemeProviderConfig.md#disabletransitionsonchange)

***

### mode?

> `optional` **mode**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L192)

Initial theme mode

#### Default

```ts
'system'
```

#### Inherited from

[`ThemeProviderConfig`](ThemeProviderConfig.md).[`mode`](ThemeProviderConfig.md#mode)

***

### persist?

> `optional` **persist**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:198](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L198)

Whether to persist theme choice in localStorage

#### Default

```ts
true
```

#### Inherited from

[`ThemeProviderConfig`](ThemeProviderConfig.md).[`persist`](ThemeProviderConfig.md#persist)

***

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [core/modal-react/src/theme/types.ts:209](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L209)

Storage key for persisting theme

#### Default

```ts
'walletmesh-theme'
```

#### Inherited from

[`ThemeProviderConfig`](ThemeProviderConfig.md).[`storageKey`](ThemeProviderConfig.md#storagekey)
