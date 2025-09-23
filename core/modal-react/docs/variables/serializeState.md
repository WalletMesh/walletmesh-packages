[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / serializeState

# Variable: serializeState()

> `const` **serializeState**: (`state`) => `string` = `ssrState.serialize`

Defined in: [core/modal-react/src/utils/ssr-walletmesh.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/utils/ssr-walletmesh.ts#L177)

Serialize WalletMesh state for SSR hydration

Converts the WalletMesh state into a JSON-serializable format that can be
safely transmitted from server to client. This function removes non-serializable
elements like functions, providers, and circular references.

Key features:
- Removes function references (actions, providers)
- Preserves wallet connection state
- Maintains session information
- Strips circular references
- Handles undefined values properly

## Parameters

### state

`HeadlessModalState`

The WalletMesh state to serialize

## Returns

`string`

A JSON-serializable representation of the state

## Examples

```typescript
// On the server (Next.js getServerSideProps)
export async function getServerSideProps() {
  const client = createUniversalWalletMesh(config);
  const state = client.getState();

  return {
    props: {
      walletMeshState: serializeState(state)
    }
  };
}
```

```typescript
// Next.js App Router (RSC)
async function WalletData() {
  const client = createUniversalWalletMesh(config);
  const state = client.getState();
  const serialized = serializeState(state);

  return <ClientComponent initialState={serialized} />;
}
```
