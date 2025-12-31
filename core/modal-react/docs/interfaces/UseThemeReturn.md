[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseThemeReturn

# Interface: UseThemeReturn

Defined in: [core/modal-react/src/theme/types.ts:320](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L320)

Hook return type for useTheme

## Extends

- [`ThemeContextValue`](ThemeContextValue.md)

## Properties

### isMounted

> **isMounted**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:272](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L272)

Whether the theme system is mounted and ready

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`isMounted`](ThemeContextValue.md#ismounted)

***

### refreshSystemTheme()

> **refreshSystemTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:277](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L277)

Force re-evaluation of system theme

#### Returns

`void`

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`refreshSystemTheme`](ThemeContextValue.md#refreshsystemtheme)

***

### resolvedTheme

> **resolvedTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:247](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L247)

Current resolved theme (never 'system')

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`resolvedTheme`](ThemeContextValue.md#resolvedtheme)

***

### setTheme()

> **setTheme**: (`mode`) => `void`

Defined in: [core/modal-react/src/theme/types.ts:262](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L262)

Set the theme mode

#### Parameters

##### mode

`ThemeMode`

#### Returns

`void`

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`setTheme`](ThemeContextValue.md#settheme)

***

### systemTheme

> **systemTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:252](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L252)

System's preferred theme

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`systemTheme`](ThemeContextValue.md#systemtheme)

***

### theme

> **theme**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:242](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L242)

Current active theme mode

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`theme`](ThemeContextValue.md#theme)

***

### themeConfig

> **themeConfig**: [`ThemeConfig`](ThemeConfig.md)

Defined in: [core/modal-react/src/theme/types.ts:257](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L257)

Complete theme configuration

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`themeConfig`](ThemeContextValue.md#themeconfig)

***

### toggleTheme()

> **toggleTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:267](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/theme/types.ts#L267)

Toggle between light and dark themes

#### Returns

`void`

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`toggleTheme`](ThemeContextValue.md#toggletheme)
