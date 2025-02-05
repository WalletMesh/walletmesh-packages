[**@walletmesh/router v0.4.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / OperationBuilder

# Class: OperationBuilder\<T\>

Defined in: [core/router/src/operation.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/operation.ts#L50)

A builder class that enables chaining multiple RPC method calls into a single operation.
This provides a fluent interface for constructing sequences of wallet method calls
that can be executed together.

## Example

```typescript
// Create a new operation builder
const operation = provider.chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .call('eth_getCode', ['0x456...']);

// Execute all calls in sequence
const [balance, code] = await operation.execute();
```

## Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[] = readonly \[\]

Tuple type tracking the sequence of method calls

## Constructors

### new OperationBuilder()

> **new OperationBuilder**\<`T`\>(`chainId`, `provider`, `calls`): [`OperationBuilder`](OperationBuilder.md)\<`T`\>

Defined in: [core/router/src/operation.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/operation.ts#L51)

#### Parameters

##### chainId

`string`

##### provider

[`WalletRouterProvider`](WalletRouterProvider.md)

##### calls

`T` = `...`

#### Returns

[`OperationBuilder`](OperationBuilder.md)\<`T`\>

## Methods

### call()

> **call**\<`M`\>(`method`, `params`?): [`OperationBuilder`](OperationBuilder.md)\<readonly \[`T`, [`MethodCall`](../interfaces/MethodCall.md)\<`M`\>\]\>

Defined in: [core/router/src/operation.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/operation.ts#L73)

Adds a new method call to the operation chain.
Returns a new builder instance with the updated call sequence.

#### Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

The specific method key from RouterMethodMap

#### Parameters

##### method

`M`

The RPC method name to call

##### params?

[`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

Optional parameters for the method

#### Returns

[`OperationBuilder`](OperationBuilder.md)\<readonly \[`T`, [`MethodCall`](../interfaces/MethodCall.md)\<`M`\>\]\>

A new OperationBuilder instance with the added method call

#### Example

```typescript
const operation = provider.chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .call('eth_getCode', ['0x456...']);
```

***

### execute()

> **execute**(`timeout`?): `Promise`\<`ExecuteResult`\<`T`\>\>

Defined in: [core/router/src/operation.ts:108](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/operation.ts#L108)

Executes all method calls in the operation chain in sequence.
For a single call, returns the direct result.
For multiple calls, returns an array of results in the same order as the calls.

#### Parameters

##### timeout?

`number`

#### Returns

`Promise`\<`ExecuteResult`\<`T`\>\>

For one call: the direct result. For multiple calls: array of results.

#### Example

```typescript
// Single call
const balance = await provider
  .chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .execute();

// Multiple calls
const [balance, code] = await provider
  .chain('eip155:1')
  .call('eth_getBalance', ['0x123...'])
  .call('eth_getCode', ['0x456...'])
  .execute();
```

#### Throws

If no operations are queued or if result validation fails
