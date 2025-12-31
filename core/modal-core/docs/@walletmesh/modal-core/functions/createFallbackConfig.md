[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createFallbackConfig

# Function: createFallbackConfig()

> **createFallbackConfig**(`options`): [`FallbackIconConfig`](../interfaces/FallbackIconConfig.md)

Creates a framework-agnostic configuration for fallback icon elements

This function generates the necessary configuration to create a circular
text-based fallback when the original icon fails to load. The configuration
can be used by any framework (React, Vue, vanilla DOM) to create consistent
fallback elements.

## Parameters

### options

[`CreateFallbackOptions`](../interfaces/CreateFallbackOptions.md)

Configuration options for the fallback

## Returns

[`FallbackIconConfig`](../interfaces/FallbackIconConfig.md)

Configuration object with styles, content, and attributes

## Example

```typescript
const config = createFallbackConfig({
  size: 32,
  alt: 'MetaMask',
  errorType: 'csp'
});

// Use in vanilla DOM
const div = document.createElement('div');
Object.assign(div.style, config.styles);
div.textContent = config.content;
Object.entries(config.attributes).forEach(([key, value]) => {
  div.setAttribute(key, value);
});

// Use in React
<div style={config.styles} {...config.attributes}>
  {config.content}
</div>
```
