[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshSandboxedIconProps

# Interface: WalletMeshSandboxedIconProps

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:68](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L68)

Props for the WalletMeshSandboxedIcon component

## Properties

### alt?

> `optional` **alt**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:78](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L78)

Alt text for accessibility

***

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:74](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L74)

CSS class name

***

### cspTimeout?

> `optional` **cspTimeout**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:84](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L84)

Timeout in ms for CSP detection (default: 3000)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:88](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L88)

Whether the icon should appear disabled/greyed out

***

### disabledStyle?

> `optional` **disabledStyle**: `DisabledIconStyle`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:90](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L90)

Custom styling for disabled state

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:82](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L82)

Fallback icon data URI to use if CSP blocks the main icon

***

### onClick()?

> `optional` **onClick**: () => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:76](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L76)

Click handler

#### Returns

`void`

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:86](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L86)

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

***

### size?

> `optional` **size**: `number`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:72](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L72)

Icon size in pixels

***

### src

> **src**: `string`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:70](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L70)

Data URI containing SVG content

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [core/modal-react/src/components/WalletMeshSandboxedIcon.tsx:80](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/components/WalletMeshSandboxedIcon.tsx#L80)

Style overrides
