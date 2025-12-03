[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseThemeReturn

# Interface: UseThemeReturn

Defined in: [core/modal-react/src/theme/types.ts:309](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L309)

Hook return type for useTheme

## Extends

- [`ThemeContextValue`](ThemeContextValue.md)

## Properties

### isMounted

> **isMounted**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:261](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L261)

Whether the theme system is mounted and ready

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`isMounted`](ThemeContextValue.md#ismounted)

***

### refreshSystemTheme()

> **refreshSystemTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:266](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L266)

Force re-evaluation of system theme

#### Returns

`void`

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`refreshSystemTheme`](ThemeContextValue.md#refreshsystemtheme)

***

### resolvedTheme

> **resolvedTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:236](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L236)

Current resolved theme (never 'system')

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`resolvedTheme`](ThemeContextValue.md#resolvedtheme)

***

### setTheme()

> **setTheme**: (`mode`) => `void`

Defined in: [core/modal-react/src/theme/types.ts:251](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L251)

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

Defined in: [core/modal-react/src/theme/types.ts:241](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L241)

System's preferred theme

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`systemTheme`](ThemeContextValue.md#systemtheme)

***

### theme

> **theme**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:231](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L231)

Current active theme mode

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`theme`](ThemeContextValue.md#theme)

***

### themeConfig

> **themeConfig**: [`ThemeConfig`](ThemeConfig.md)

Defined in: [core/modal-react/src/theme/types.ts:246](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L246)

Complete theme configuration

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`themeConfig`](ThemeContextValue.md#themeconfig)

***

### toggleTheme()

> **toggleTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:256](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/theme/types.ts#L256)

Toggle between light and dark themes

#### Returns

`void`

#### Inherited from

[`ThemeContextValue`](ThemeContextValue.md).[`toggleTheme`](ThemeContextValue.md#toggletheme)
