[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletClient

# Interface: WalletClient

Defined in: [core/router/src/types.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L27)

Interface for wallet clients that can be used with the router.
Wallet clients provide a standardized way to interact with different blockchain wallets,
supporting both method calls and event handling.

## Example

```typescript
class EthereumWalletClient implements WalletClient {
  async call<T>(method: string, params?: unknown): Promise<T> {
    // Forward to Ethereum wallet
    return ethereum.request({ method, params });
  }

  on(event: string, handler: (data: unknown) => void): void {
    // Listen for Ethereum events
    ethereum.on(event, handler);
  }

  off(event: string, handler: (data: unknown) => void): void {
    ethereum.removeListener(event, handler);
  }
}
```

## Methods

### call()

> **call**\<`T`\>(`method`, `params`?): `Promise`\<`T`\>

Defined in: [core/router/src/types.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L36)

Call a method on the wallet

#### Type Parameters

• **T** = `unknown`

The expected return type of the method call

#### Parameters

##### method

`string`

Method name to invoke (e.g., 'eth_accounts', 'eth_sendTransaction')

##### params?

`unknown`

Method parameters, can be an array for positional params or an object for named params

#### Returns

`Promise`\<`T`\>

Promise resolving to the method result of type T

#### Throws

If the method call fails or is rejected by the wallet

***

### getSupportedMethods()?

> `optional` **getSupportedMethods**(): `Promise`\<`string`[]\>

Defined in: [core/router/src/types.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L43)

Get supported capabilities of the wallet

#### Returns

`Promise`\<`string`[]\>

Promise resolving to the list of supported method names

#### Throws

If the capabilities request fails

***

### off()?

> `optional` **off**(`event`, `handler`): `void`

Defined in: [core/router/src/types.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L60)

Remove a previously registered event handler

#### Parameters

##### event

`string`

Event name to stop listening for

##### handler

(`data`) => `void`

Handler function to remove (must be the same reference as used in 'on')

#### Returns

`void`

***

### on()?

> `optional` **on**(`event`, `handler`): `void`

Defined in: [core/router/src/types.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L53)

Register an event handler for wallet events
Events include:
- 'disconnect': Emitted when the wallet disconnects

#### Parameters

##### event

`string`

Event name to listen for

##### handler

(`data`) => `void`

Function to call when the event occurs

#### Returns

`void`
