[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeContextValue

# Interface: ThemeContextValue

Defined in: [core/modal-react/src/theme/types.ts:238](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L238)

Theme context value provided to components

## Extended by

- [`UseThemeReturn`](UseThemeReturn.md)

## Properties

### isMounted

> **isMounted**: `boolean`

Defined in: [core/modal-react/src/theme/types.ts:272](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L272)

Whether the theme system is mounted and ready

***

### refreshSystemTheme()

> **refreshSystemTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:277](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L277)

Force re-evaluation of system theme

#### Returns

`void`

***

### resolvedTheme

> **resolvedTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:247](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L247)

Current resolved theme (never 'system')

***

### setTheme()

> **setTheme**: (`mode`) => `void`

Defined in: [core/modal-react/src/theme/types.ts:262](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L262)

Set the theme mode

#### Parameters

##### mode

`ThemeMode`

#### Returns

`void`

***

### systemTheme

> **systemTheme**: `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:252](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L252)

System's preferred theme

***

### theme

> **theme**: `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:242](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L242)

Current active theme mode

***

### themeConfig

> **themeConfig**: [`ThemeConfig`](ThemeConfig.md)

Defined in: [core/modal-react/src/theme/types.ts:257](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L257)

Complete theme configuration

***

### toggleTheme()

> **toggleTheme**: () => `void`

Defined in: [core/modal-react/src/theme/types.ts:267](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L267)

Toggle between light and dark themes

#### Returns

`void`
