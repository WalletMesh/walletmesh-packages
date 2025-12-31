[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMetadata

# Interface: WalletMetadata

Defined in: core/modal-core/dist/types.d.ts:167

Interface for wallet metadata

## Remarks

Contains essential display information for a wallet.
Used for presenting wallet options in the UI.
This interface defines the minimal metadata required to display
a wallet option to users in selection interfaces.

## Examples

```typescript
const metadata: WalletMetadata = {
  name: 'MetaMask',
  icon: 'https://example.com/metamask-icon.png',
  description: 'Connect to the decentralized web'
};
```

```typescript
// Using a data URI for the icon
const walletMetadata: WalletMetadata = {
  name: 'Rainbow',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0i...',
  description: 'A fun, simple, and secure Ethereum wallet'
};
```

## Properties

### description?

> `optional` **description**: `string`

Defined in: core/modal-core/dist/types.d.ts:193

Optional description of the wallet

#### Remarks

A brief description explaining the wallet's key features or benefits.
Keep it concise (under 100 characters) for UI display purposes.

#### Examples

```ts
"Connect to the decentralized web"
```

```ts
"Your key to the world of Ethereum"
```

***

### icon

> **icon**: `string`

Defined in: core/modal-core/dist/types.d.ts:184

URL or data URI of the wallet's icon

#### Remarks

- Can be an HTTPS URL pointing to an image file
- Can be a data URI for embedded images
- Should be square format (1:1 aspect ratio) for best display
- Recommended size: at least 64x64 pixels

#### Examples

```ts
"https://example.com/wallet-icon.png"
```

```ts
"data:image/png;base64,iVBORw0KGgo..."
```

***

### name

> **name**: `string`

Defined in: core/modal-core/dist/types.d.ts:173

Display name of the wallet

#### Remarks

This should be the official wallet name as recognized by users

#### Example

```ts
"MetaMask", "Rainbow", "Coinbase Wallet"
```
