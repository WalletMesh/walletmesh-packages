[**@walletmesh/modal v0.0.6**](../../../README.md)

***

[@walletmesh/modal](../../../modules.md) / [components/WalletProvider](../README.md) / WalletProvider

# Function: WalletProvider()

> **WalletProvider**(`props`, `deprecatedLegacyContext`?): `ReactNode`

Defined in: [core/modal/src/components/WalletProvider.tsx:59](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/components/WalletProvider.tsx#L59)

Provider component that enables wallet integration in a React application.
This component wraps your application and provides wallet connectivity features 
through React Context. It handles wallet connections, state management, and 
renders the wallet selection modal. Supports configurable timeouts for wallet 
operations.

## Parameters

### props

[`WalletProviderProps`](../interfaces/WalletProviderProps.md)

### deprecatedLegacyContext?

`any`

**Deprecated**

**See**

[React Docs](https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-lifecycle-methods)

## Returns

`ReactNode`

## Example

```tsx
// Basic usage with timeouts
const config = WalletMeshConfig.create()
  .addWallet({
    id: "my_wallet",
    name: "My Wallet",
    adapter: { type: AdapterType.WalletMeshAztec },
    transport: { type: TransportType.PostMessage }
  })
  .setTimeout({
    connectionTimeout: 30000, // 30s for initial connections
    operationTimeout: 10000   // 10s for other operations
  })
  .setDappInfo({
    name: "My DApp",
    description: "A decentralized application",
    origin: "https://mydapp.com"
  })
  .build();

function App() {
  return (
    <WalletProvider config={config} onError={console.error}>
      <YourApp />
    </WalletProvider>
  );
}
```
