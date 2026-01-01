[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BackgroundTransactionIndicatorProps

# Interface: BackgroundTransactionIndicatorProps

Defined in: [core/modal-react/src/components/BackgroundTransactionIndicator.tsx:8](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/BackgroundTransactionIndicator.tsx#L8)

## Properties

### completedDuration?

> `optional` **completedDuration**: `number`

Defined in: [core/modal-react/src/components/BackgroundTransactionIndicator.tsx:23](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/BackgroundTransactionIndicator.tsx#L23)

Duration in ms to show completed transactions before auto-hiding.

#### Default

```ts
3000
```

***

### container?

> `optional` **container**: `null` \| `Element`

Defined in: [core/modal-react/src/components/BackgroundTransactionIndicator.tsx:27](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/BackgroundTransactionIndicator.tsx#L27)

Optional custom container element to render into. Defaults to `document.body`.

***

### onTransactionClick()?

> `optional` **onTransactionClick**: (`transactionId`) => `void`

Defined in: [core/modal-react/src/components/BackgroundTransactionIndicator.tsx:31](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/BackgroundTransactionIndicator.tsx#L31)

Called when a transaction is clicked.

#### Parameters

##### transactionId

`string`

#### Returns

`void`

***

### position?

> `optional` **position**: `"top-left"` \| `"top-right"` \| `"bottom-left"` \| `"bottom-right"`

Defined in: [core/modal-react/src/components/BackgroundTransactionIndicator.tsx:13](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/BackgroundTransactionIndicator.tsx#L13)

Position of the indicator on the screen.

#### Default

```ts
'bottom-right'
```

***

### showCompleted?

> `optional` **showCompleted**: `boolean`

Defined in: [core/modal-react/src/components/BackgroundTransactionIndicator.tsx:18](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/components/BackgroundTransactionIndicator.tsx#L18)

Whether to show the indicator for completed transactions briefly before hiding.

#### Default

```ts
true
```
