[**@walletmesh/modal-core v0.0.2**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / AnyTransportConfig

# Type Alias: AnyTransportConfig

> **AnyTransportConfig** = [`TransportConfig`](../../../../@walletmesh/modal-core/interfaces/TransportConfig.md) \| [`PopupConfig`](../../../../@walletmesh/modal-core/interfaces/PopupConfig.md) \| [`ChromeExtensionConfig`](../../../../@walletmesh/modal-core/interfaces/ChromeExtensionConfig.md)

Union type for all transport configurations

## Remarks

Combines all possible transport configuration types.
Use this when accepting transport configuration that could be for any transport type.
The actual transport type is determined by the TransportType enum value passed
alongside this configuration.

## Examples

```typescript
function createTransport(type: TransportType, config: AnyTransportConfig) {
  switch (type) {
    case TransportType.POPUP:
      return new PopupTransport(config as PopupConfig);
    case TransportType.CHROME_EXTENSION:
      return new ChromeExtensionTransport(config as ChromeExtensionConfig);
    default:
      return new WebSocketTransport(config);
  }
}
```

```typescript
// Dynamic transport selection based on wallet type
function getTransportConfig(wallet: WalletInfo): AnyTransportConfig {
  if (wallet.type === 'extension') {
    return { extensionId: wallet.extensionId, retries: 5 };
  } else if (wallet.type === 'web') {
    return { url: wallet.url, width: 400, height: 600 };
  } else {
    return { url: wallet.wsUrl, reconnect: true };
  }
}
```
