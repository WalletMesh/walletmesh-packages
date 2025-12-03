[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshSandboxedIconProps

# Interface: WalletMeshSandboxedIconProps

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:67](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L67)

Props for the WalletMeshSandboxedIcon component

## Properties

### alt?

> `optional` **alt**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:77](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L77)

Alt text for accessibility

***

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:73](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L73)

CSS class name

***

### cspTimeout?

> `optional` **cspTimeout**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:83](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L83)

Timeout in ms for CSP detection (default: 3000)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:87](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L87)

Whether the icon should appear disabled/greyed out

***

### disabledStyle?

> `optional` **disabledStyle**: `DisabledIconStyle`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:89](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L89)

Custom styling for disabled state

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:81](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L81)

Fallback icon data URI to use if CSP blocks the main icon

***

### onClick()?

> `optional` **onClick**: () => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:75](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L75)

Click handler

#### Returns

`void`

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:85](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L85)

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

***

### size?

> `optional` **size**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:71](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L71)

Icon size in pixels

***

### src

> **src**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:69](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L69)

Data URI containing SVG content

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:79](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L79)

Style overrides
