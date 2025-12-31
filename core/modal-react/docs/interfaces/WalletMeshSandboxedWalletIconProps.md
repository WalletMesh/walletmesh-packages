[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshSandboxedWalletIconProps

# Interface: WalletMeshSandboxedWalletIconProps

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:520](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L520)

Props for the WalletMeshSandboxedWalletIcon component

## Properties

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:530](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L530)

CSS class name

***

### cspTimeout?

> `optional` **cspTimeout**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:538](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L538)

Timeout in ms for CSP detection (default: 3000)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:542](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L542)

Whether the wallet should appear disabled/greyed out

***

### disabledStyle?

> `optional` **disabledStyle**: `DisabledIconStyle`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:544](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L544)

Custom styling for disabled state

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:536](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L536)

Fallback icon data URI to use if CSP blocks the main icon

***

### onClick()?

> `optional` **onClick**: (`walletId`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:532](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L532)

Click handler that receives the wallet ID

#### Parameters

##### walletId

`string`

#### Returns

`void`

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:540](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L540)

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

***

### size?

> `optional` **size**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:528](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L528)

Icon size in pixels

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:534](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L534)

Style overrides

***

### wallet

> **wallet**: `object`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:522](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L522)

Wallet information containing icon and name

#### icon

> **icon**: `string`

#### id

> **id**: `string`

#### name

> **name**: `string`
