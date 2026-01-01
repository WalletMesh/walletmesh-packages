[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createIconContainerConfig

# Function: createIconContainerConfig()

> **createIconContainerConfig**(`options`): [`IconContainerConfig`](../interfaces/IconContainerConfig.md)

Creates framework-agnostic container configuration for icon display

This utility generates the necessary styling and attributes for creating
consistent icon containers across different UI frameworks.

## Parameters

### options

[`CreateIconContainerOptions`](../interfaces/CreateIconContainerOptions.md)

Container configuration options

## Returns

[`IconContainerConfig`](../interfaces/IconContainerConfig.md)

Configuration object for container setup

## Example

```typescript
const config = createIconContainerConfig({
  size: 32,
  disabled: false,
  clickable: true,
  loading: true
});

// Use in vanilla DOM
const container = document.createElement('div');
Object.assign(container.style, config.containerStyles);
Object.entries(config.attributes).forEach(([key, value]) => {
  container.setAttribute(key, value);
});

// Use in React
<div
  style={config.containerStyles}
  {...config.attributes}
  className={config.className}
>
  {loading && <div style={config.loading.styles}>{config.loading.content}</div>}
</div>
```
