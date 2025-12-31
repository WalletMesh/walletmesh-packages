[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / connectAztec

# Function: connectAztec()

> **connectAztec**(`provider`, `chainId`, `methods`): `Promise`\<\{ `sessionId`: `string`; `wallet`: [`AztecDappWallet`](../classes/AztecDappWallet.md); \}\>

Defined in: [aztec/rpc-wallet/src/client/helpers.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/client/helpers.ts#L73)

Establishes a connection to an Aztec wallet service and creates an initialized [AztecDappWallet](../classes/AztecDappWallet.md) instance.
This function requests permissions for the specified methods on the given Aztec chain,
then instantiates and initializes the wallet.
Initialization includes fetching and caching essential data like the wallet address and chain ID.

By default, it requests permissions for all methods defined in [ALL\_AZTEC\_METHODS](../variables/ALL_AZTEC_METHODS.md).

## Parameters

### provider

[`AztecRouterProvider`](../classes/AztecRouterProvider.md)

The [AztecRouterProvider](../classes/AztecRouterProvider.md) instance to use for the connection.
                  This provider must be configured with appropriate transport and Aztec serializers.

### chainId

`` `aztec:${string}` ``

The [AztecChainId](../type-aliases/AztecChainId.md) to connect to (e.g., 'aztec:mainnet', 'aztec:31337', 'aztec:testnet').

### methods

readonly keyof [`AztecWalletMethodMap`](../interfaces/AztecWalletMethodMap.md)[] = `ALL_AZTEC_METHODS`

An array of method names for which permissions are requested.
                 Defaults to [ALL\_AZTEC\_METHODS](../variables/ALL_AZTEC_METHODS.md).

## Returns

`Promise`\<\{ `sessionId`: `string`; `wallet`: [`AztecDappWallet`](../classes/AztecDappWallet.md); \}\>

A promise that resolves to an object containing the `sessionId` for the connection
         and a fully initialized [AztecDappWallet](../classes/AztecDappWallet.md) instance.

## Throws

If the connection or wallet initialization fails.

## Example

```typescript
const provider = new AztecRouterProvider(myTransport);
const { sessionId, wallet } = await connectAztec(provider, 'aztec:testnet');
const address = wallet.getAddress(); // Wallet is ready to use
console.log('Connected with session ID:', sessionId, 'Wallet address:', address.toString());
```
