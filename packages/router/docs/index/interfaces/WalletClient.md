[**@walletmesh/router v0.2.6**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletClient

# Interface: WalletClient

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

#### Defined in

[packages/router/src/types.ts:36](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L36)

***

### getSupportedMethods()?

> `optional` **getSupportedMethods**(): `Promise`\<`string`[]\>

Get supported capabilities of the wallet

#### Returns

`Promise`\<`string`[]\>

Promise resolving to the list of supported method names

#### Throws

If the capabilities request fails

#### Defined in

[packages/router/src/types.ts:43](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L43)

***

### off()?

> `optional` **off**(`event`, `handler`): `void`

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

#### Defined in

[packages/router/src/types.ts:60](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L60)

***

### on()?

> `optional` **on**(`event`, `handler`): `void`

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

#### Defined in

[packages/router/src/types.ts:53](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L53)
