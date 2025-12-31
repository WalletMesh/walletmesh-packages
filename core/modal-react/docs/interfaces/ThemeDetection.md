[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeDetection

# Interface: ThemeDetection

Defined in: [core/modal-react/src/theme/types.ts:290](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L290)

Theme detection utilities

## Methods

### getStoredTheme()

> **getStoredTheme**(`storageKey`): `null` \| `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:299](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L299)

Get stored theme preference

#### Parameters

##### storageKey

`string`

#### Returns

`null` \| `ThemeMode`

***

### getSystemTheme()

> **getSystemTheme**(): `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:294](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L294)

Detect system theme preference

#### Returns

`"light"` \| `"dark"`

***

### onSystemThemeChange()

> **onSystemThemeChange**(`callback`): () => `void`

Defined in: [core/modal-react/src/theme/types.ts:314](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L314)

Listen for system theme changes

#### Parameters

##### callback

(`theme`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### removeStoredTheme()

> **removeStoredTheme**(`storageKey`): `void`

Defined in: [core/modal-react/src/theme/types.ts:309](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L309)

Remove stored theme preference

#### Parameters

##### storageKey

`string`

#### Returns

`void`

***

### storeTheme()

> **storeTheme**(`mode`, `storageKey`): `void`

Defined in: [core/modal-react/src/theme/types.ts:304](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/theme/types.ts#L304)

Store theme preference

#### Parameters

##### mode

`ThemeMode`

##### storageKey

`string`

#### Returns

`void`
