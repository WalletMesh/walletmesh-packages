[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isSolanaProvider

# Function: isSolanaProvider()

> **isSolanaProvider**(`provider`): provider is \{ connect: () =\> Promise\<\{ publicKey: string \}\>; getPublicKey: () =\> null \| string; signMessage: (message: string) =\> Promise\<string\>; signTransaction: (transaction: unknown) =\> Promise\<string\> \}

Type guard to check if a provider is a Solana provider

Solana providers follow the Solana Wallet Standard and have Solana-specific
methods like connect(), signTransaction(), and signMessage(). They typically
work with publicKey instead of addresses.

## Parameters

### provider

`unknown`

The provider to check

## Returns

provider is \{ connect: () =\> Promise\<\{ publicKey: string \}\>; getPublicKey: () =\> null \| string; signMessage: (message: string) =\> Promise\<string\>; signTransaction: (transaction: unknown) =\> Promise\<string\> \}

True if provider has the Solana provider interface

## Example

```typescript
if (isSolanaProvider(provider)) {
  // Use Solana-specific methods
  const connection = await provider.connect();
  console.log('Connected pubkey:', connection.publicKey);

  const signature = await provider.signTransaction(transaction);
  const messageSignature = await provider.signMessage('Hello Solana!');
}
```
