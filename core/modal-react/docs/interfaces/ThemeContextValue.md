[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeContextValue

# Interface: ThemeContextValue

Defined in: [core/modal-react/src/theme/types.ts:227](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L227)

Theme context value provided to components

## Extended by

- [`UseThemeReturn`](UseThemeReturn.md)

## Properties

### isMounted

> **isMounted**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:261](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L261)

Whether the theme system is mounted and ready

***

### refreshSystemTheme()

> **refreshSystemTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:266](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L266)

Force re-evaluation of system theme

#### Returns

`void`

***

### resolvedTheme

> **resolvedTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:236](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L236)

Current resolved theme (never 'system')

***

### setTheme()

> **setTheme**: (`mode`) => `void`

Defined in: [core/modal-react/src/theme/types.ts:251](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L251)

Set the theme mode

#### Parameters

##### mode

`ThemeMode`

#### Returns

`void`

***

### systemTheme

> **systemTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:241](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L241)

System's preferred theme

***

### theme

> **theme**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:231](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L231)

Current active theme mode

***

### themeConfig

> **themeConfig**: [`ThemeConfig`](ThemeConfig.md)

Defined in: [core/modal-react/src/theme/types.ts:246](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L246)

Complete theme configuration

***

### toggleTheme()

> **toggleTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:256](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L256)

Toggle between light and dark themes

#### Returns

`void`
