[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AztecConnectButtonProps

# Interface: AztecConnectButtonProps

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:25](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecConnectButton.tsx#L25)

## Extends

- `Omit`\<[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md), `"label"` \| `"connectedLabel"`\>

## Properties

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:20](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L20)

Custom className for styling

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`className`](WalletMeshConnectButtonProps.md#classname)

***

### connectedLabel?

> `optional` **connectedLabel**: `string`

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:37](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecConnectButton.tsx#L37)

Button label when connected

#### Default

```ts
'Disconnect'
```

***

### connectingLabel?

> `optional` **connectingLabel**: `string`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:16](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L16)

Custom label for the connecting button

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`connectingLabel`](WalletMeshConnectButtonProps.md#connectinglabel)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:36](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L36)

Whether the button should be disabled

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`disabled`](WalletMeshConnectButtonProps.md#disabled)

***

### label?

> `optional` **label**: `string`

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:31](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecConnectButton.tsx#L31)

Button label when disconnected

#### Default

```ts
'Connect Aztec Wallet'
```

***

### onConnectedClick()?

> `optional` **onConnectedClick**: () => `void`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:34](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L34)

Custom click handler for when connected (instead of opening modal)

#### Returns

`void`

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`onConnectedClick`](WalletMeshConnectButtonProps.md#onconnectedclick)

***

### onProvingComplete()?

> `optional` **onProvingComplete**: () => `void`

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:53](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecConnectButton.tsx#L53)

Callback when proof generation completes

#### Returns

`void`

***

### onProvingStart()?

> `optional` **onProvingStart**: () => `void`

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:48](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecConnectButton.tsx#L48)

Callback when proof generation starts

#### Returns

`void`

***

### showAddress?

> `optional` **showAddress**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:28](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L28)

Whether to show the address when connected

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`showAddress`](WalletMeshConnectButtonProps.md#showaddress)

***

### showChain?

> `optional` **showChain**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:30](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L30)

Whether to show the chain when connected

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`showChain`](WalletMeshConnectButtonProps.md#showchain)

***

### showProvingStatus?

> `optional` **showProvingStatus**: `boolean`

Defined in: [core/modal-react/src/components/AztecConnectButton.tsx:43](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/AztecConnectButton.tsx#L43)

Show proof generation status indicator

#### Default

```ts
true
```

***

### showWalletName?

> `optional` **showWalletName**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:32](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L32)

Whether to show the wallet name when connected

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`showWalletName`](WalletMeshConnectButtonProps.md#showwalletname)

***

### size?

> `optional` **size**: `"sm"` \| `"md"` \| `"lg"`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:24](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L24)

Size variant

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`size`](WalletMeshConnectButtonProps.md#size)

***

### style?

> `optional` **style**: `CSSProperties`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:22](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L22)

Custom styles object

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`style`](WalletMeshConnectButtonProps.md#style)

***

### targetChainType?

> `optional` **targetChainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:38](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L38)

Target chain type for chain-specific buttons

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`targetChainType`](WalletMeshConnectButtonProps.md#targetchaintype)

***

### variant?

> `optional` **variant**: `"primary"` \| `"secondary"` \| `"outline"`

Defined in: [core/modal-react/src/components/WalletMeshConnectButton.tsx:26](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshConnectButton.tsx#L26)

Color variant

#### Inherited from

[`WalletMeshConnectButtonProps`](WalletMeshConnectButtonProps.md).[`variant`](WalletMeshConnectButtonProps.md#variant)
