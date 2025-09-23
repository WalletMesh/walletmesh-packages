# Creating Framework Adapters

This guide explains how to create custom framework adapters for WalletMesh modal integration. Framework adapters allow WalletMesh to render UI components using different UI frameworks like React, Vue, Svelte, etc.

## Understanding the Adapter Architecture

Framework adapters in WalletMesh implement the `FrameworkAdapter` interface, which defines how the modal system interacts with different UI frameworks. The base implementation, `BaseFrameworkAdapter`, handles common functionality such as:

- Container management
- Theme application
- Resource cleanup
- Error handling

Your custom adapter will extend this base implementation, focusing only on the framework-specific rendering logic.

## Implementation Requirements

To create a custom framework adapter, you need to:

1. **Extend `BaseFrameworkAdapter`**
2. **Implement `render(props: ViewProps): void`**
   - Render the UI based on the provided props
   - Use the container element provided by the base class
3. **Implement `destroy(): Promise<void>`**
   - Clean up framework-specific resources
   - Call `super.cleanup()` to handle base class cleanup

## Implementation Example

Here's a basic implementation pattern for a custom framework adapter (using a fictional UI framework):

```typescript
import { ViewProps } from '../../types.js';
import { BaseFrameworkAdapter, BaseFrameworkAdapterConfig } from './baseFrameworkAdapter.js';
import { FunctionResource } from '../core/resources/commonResources.js';

// 1. Define your framework-specific options
export interface CustomFrameworkAdapterOptions extends BaseFrameworkAdapterConfig {
  // Add any framework-specific options here
  frameworkSpecificOption?: string;
}

// 2. Implement your adapter class
export class CustomFrameworkAdapter extends BaseFrameworkAdapter {
  // Framework-specific state
  private frameworkRoot: any = null;
  private frameworkInstance: any = null;
  
  constructor(options: CustomFrameworkAdapterOptions = {}) {
    super(options);
    
    // Initialize framework-specific state
    // ...
    
    this.logger.debug('CustomFrameworkAdapter initialized');
  }
  
  // 3. Implement render method
  render(props: ViewProps): void {
    // Check if container exists
    if (!this.container) {
      this.logger.debug('Cannot render - container not found');
      return;
    }
    
    this.logger.debug(`Rendering view: ${props.view}`);
    
    // Clean up any previous rendering if needed
    if (this.frameworkRoot) {
      // Framework-specific cleanup for previous render
      // ...
    }
    
    // Create framework-specific component/instance
    this.frameworkInstance = new MyFramework.Instance();
    
    // Framework-specific rendering
    this.frameworkRoot = this.frameworkInstance.render(
      MyFramework.createElement('ModalView', {
        view: props.view,
        state: props.state,
        onAction: props.onAction
      }),
      this.container
    );
    
    // Track resources for cleanup
    const frameworkResource = new FunctionResource(
      () => this.frameworkRoot,
      (root) => {
        // Framework-specific resource cleanup
        if (root) {
          MyFramework.unmount(root);
        }
      },
      'framework-root',
      Symbol('framework-instance')
    );
    
    this.resourceManager.track(frameworkResource);
    
    this.logger.debug('Rendered view successfully');
  }
  
  // 4. Implement destroy method
  async destroy(): Promise<void> {
    this.logger.debug('Destroying CustomFrameworkAdapter');
    
    // Framework-specific cleanup
    if (this.frameworkInstance) {
      // Clean up framework instance
      this.frameworkInstance.dispose();
      this.frameworkInstance = null;
    }
    
    // Clear the framework root reference
    this.frameworkRoot = null;
    
    // IMPORTANT: Call base class cleanup to handle resource management
    // This will clean up the tracked resources including our framework root
    await super.cleanup();
    
    this.logger.debug('CustomFrameworkAdapter destroyed');
  }
}
```

## Using the Resource Manager

The `BaseFrameworkAdapter` provides a resource management system to ensure proper cleanup. Use it to track resources that need cleanup:

```typescript
// Create a resource
const myResource = new FunctionResource(
  // Acquisition function - returns the resource
  () => resourceValue,
  // Cleanup function - called when the resource is released
  (value) => {
    // Clean up the resource
    value.dispose();
  },
  // Resource type (for logging)
  'my-resource-type',
  // Unique identifier
  Symbol('my-resource')
);

// Track the resource for automatic cleanup
this.resourceManager.track(myResource);
```

## Testing Your Framework Adapter

When testing your adapter, make sure to verify:

1. Proper rendering of different view types
2. Handling of container management
3. Proper cleanup and resource management
4. Error handling and recovery

Here's a basic test structure:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CustomFrameworkAdapter } from './customFrameworkAdapter';
import { ViewProps } from '../../types';

describe('CustomFrameworkAdapter', () => {
  let adapter: CustomFrameworkAdapter;
  
  beforeEach(() => {
    // Initialize adapter
    adapter = new CustomFrameworkAdapter();
  });
  
  afterEach(async () => {
    // Clean up
    await adapter.destroy();
  });
  
  it('should render the wallet selection view', () => {
    // Create test props
    const props: ViewProps = {
      view: 'walletSelection',
      state: {
        isOpen: true,
        currentView: 'walletSelection',
        wallets: [
          { id: 'test-wallet', name: 'Test Wallet', icon: '', chains: [] }
        ]
      },
      onAction: vi.fn()
    };
    
    // Render the view
    adapter.render(props);
    
    // Assert rendering behavior
    const container = adapter.getContainer();
    expect(container).not.toBeNull();
    // Check for framework-specific elements or behavior
    // ...
  });
  
  // Test other views and behaviors
});
```

## Framework-Specific Considerations

When implementing adapters for specific frameworks, consider the following:

### React

- Use ReactDOM for rendering
- Consider concurrent mode (React 18+)
- Use createRoot or hydrateRoot

### Vue

- Handle different Vue versions (2 vs 3)
- Use createApp for Vue 3
- Consider composition API vs options API

### Svelte

- Use Svelte's component constructor
- Handle reactivity properly
- Consider SvelteKit environments

### Lit

- Use shadow DOM appropriately
- Use the custom element registry
- Handle element upgrades

## Conclusion

By following this guide, you can create custom framework adapters that integrate WalletMesh with any UI framework. The key is to properly implement the rendering logic and ensure thorough cleanup when the adapter is destroyed.

Remember that the adapter's role is to translate the abstract view props into concrete UI components for your framework, while letting the base implementation handle the common concerns like container management and resource cleanup.