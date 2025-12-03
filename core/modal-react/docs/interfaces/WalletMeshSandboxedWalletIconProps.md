[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshSandboxedWalletIconProps

# Interface: WalletMeshSandboxedWalletIconProps

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:455](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L455)

Props for the WalletMeshSandboxedWalletIcon component

## Properties

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:465](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L465)

CSS class name

***

### cspTimeout?

> `optional` **cspTimeout**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:473](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L473)

Timeout in ms for CSP detection (default: 3000)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:477](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L477)

Whether the wallet should appear disabled/greyed out

***

### disabledStyle?

> `optional` **disabledStyle**: `DisabledIconStyle`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:479](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L479)

Custom styling for disabled state

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:471](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L471)

Fallback icon data URI to use if CSP blocks the main icon

***

### onClick()?

> `optional` **onClick**: (`walletId`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:467](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L467)

Click handler that receives the wallet ID

#### Parameters

##### walletId

`string`

#### Returns

`void`

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:475](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L475)

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

***

### size?

> `optional` **size**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:463](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L463)

Icon size in pixels

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:469](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L469)

Style overrides

***

### wallet

> **wallet**: `object`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:457](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L457)

Wallet information containing icon and name

#### icon

> **icon**: `string`

#### id

> **id**: `string`

#### name

> **name**: `string`
