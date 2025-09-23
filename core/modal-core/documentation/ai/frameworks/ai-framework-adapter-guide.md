# Framework Adapter Implementation Guide

This guide provides step-by-step instructions for implementing a custom framework adapter for WalletMesh using the BaseFrameworkAdapter class or one of the framework-specific adapter base classes.

## Getting Started

To implement a custom framework adapter, you need to choose between two approaches:

1. **Extend BaseFrameworkAdapter** - Use this approach when you want full control over the implementation and don't need framework-specific features.
2. **Extend Framework-Specific Adapter** - Use this approach to leverage framework-specific types and helper methods.

## Step 1: Choose Your Framework

First, determine which UI framework you're integrating with:

- React
- Vue
- Svelte
- Lit (Web Components)
- Angular
- Solid
- Other (roll your own)

## Step 2: Create the Adapter Class

### Option 1: Extending BaseFrameworkAdapter

```typescript
import { 
  BaseFrameworkAdapter, 
  BaseFrameworkAdapterConfig, 
  ViewProps 
} from '@walletmesh/modal-core';

class MyFrameworkAdapter extends BaseFrameworkAdapter {
  // Your framework-specific properties
  private app: any = null;
  
  constructor(options: BaseFrameworkAdapterConfig = {}) {
    super(options);
    // Framework-specific initialization
    this.logger.debug('Framework adapter initialized');
  }
  
  render(props: ViewProps): void {
    // Step 1: Check if container exists
    if (!this.container) {
      this.logger.debug('Cannot render - container not found');
      return;
    }
    
    // Step 2: Clean up previous render state if needed
    
    // Step 3: Render the view using your framework
    this.renderFrameworkView(props);
    
    this.logger.debug(`Rendered view: ${props.view}`);
  }
  
  private renderFrameworkView(props: ViewProps): void {
    // Your framework's rendering logic
    // Create and mount components based on props.view
    // Setup event handlers for props.onAction
  }
  
  async destroy(): Promise<void> {
    this.logger.debug('Destroying framework adapter');
    
    // Step 1: Clean up framework-specific resources
    
    // Step 2: Call the base class cleanup method
    await this.cleanup();
    
    this.logger.debug('Framework adapter destroyed');
  }
}
```

### Option 2: Extending Framework-Specific Adapter

```typescript
import { 
  ReactAdapter, 
  ReactAdapterConfig, 
  ViewProps 
} from '@walletmesh/modal-core';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WalletSelectionView, ConnectingView, ConnectedView, ErrorView } from './components';

class MyReactAdapter extends ReactAdapter {
  // React-specific implementations
  private rootElement: any = null;
  
  constructor(options: ReactAdapterConfig = {}) {
    super(options);
    this.logger.debug('React adapter initialized');
  }
  
  protected createRoot(): void {
    if (!this.container) return;
    this.rootElement = createRoot(this.container);
  }
  
  protected unmount(): void {
    if (this.rootElement) {
      this.rootElement.unmount();
      this.rootElement = null;
    }
  }
  
  render(props: ViewProps): void {
    if (!this.container) {
      this.logger.debug('Cannot render - container not found');
      return;
    }
    
    // Create root if it doesn't exist
    if (!this.rootElement) {
      this.createRoot();
    }
    
    // Render the appropriate component based on view
    const component = this.getComponentForView(props);
    
    // Render using React
    this.rootElement.render(component);
    
    this.logger.debug(`Rendered view: ${props.view}`);
  }
  
  private getComponentForView(props: ViewProps) {
    // Select the appropriate component based on view
    const { view, state, onAction } = props;
    
    switch (view) {
      case 'walletSelection':
        return React.createElement(WalletSelectionView, { 
          state, 
          onAction 
        });
      case 'connecting':
        return React.createElement(ConnectingView, { 
          state, 
          onAction 
        });
      case 'connected':
        return React.createElement(ConnectedView, { 
          state, 
          onAction 
        });
      case 'error':
        return React.createElement(ErrorView, { 
          state, 
          onAction 
        });
      default:
        return React.createElement('div', {}, `Unknown view: ${view}`);
    }
  }
  
  async destroy(): Promise<void> {
    this.logger.debug('Destroying React adapter');
    
    // Unmount React components
    this.unmount();
    
    // Clean up base resources
    await this.cleanup();
    
    this.logger.debug('React adapter destroyed');
  }
}
```

## Step 3: Implement Framework-Specific Components

Create components that match the required views:

1. **Wallet Selection View**: Displays available wallets and allows users to select one
2. **Connecting View**: Shows a loading state during wallet connection
3. **Connected View**: Displays the connected wallet state
4. **Error View**: Shows any connection errors

Each component should call the `onAction` callback to communicate user actions to the adapter.

## Step 4: Handle Resource Management

Properly track and clean up resources:

```typescript
// Track resources that need cleanup
this.resourceManager.track({
  id: 'event-listener',
  release: () => {
    // Release the resource when cleanup is called
    button.removeEventListener('click', handleClick);
  }
});
```

## Step 5: Connect the Adapter to the Modal

Use your adapter with the WalletMesh modal system:

```typescript
import { createModal } from '@walletmesh/modal-core';
import { MyFrameworkAdapter } from './my-framework-adapter';

// Create your adapter
const adapter = new MyFrameworkAdapter({
  target: '#modal-container',
  debug: true
});

// Create a modal using your adapter
const modal = createModal({
  wallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'https://example.com/metamask-icon.png',
      chains: ['evm']
    }
  ],
  adapter: adapter
});

// Open the modal
modal.open();
```

## Implementation Details by Framework

### React

For React 18+:

```typescript
import { createRoot, Root } from 'react-dom/client';
import { WalletMeshModal } from './components/WalletMeshModal';

class ReactAdapter extends BaseFrameworkAdapter {
  private root: Root | null = null;

  render(props: ViewProps): void {
    if (!this.container) return;

    // Create root if it doesn't exist
    if (!this.root && this.container) {
      this.root = createRoot(this.container);
    }

    // Render React component
    this.root.render(React.createElement(WalletMeshModal, props));
  }

  async destroy(): Promise<void> {
    // Unmount React component
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    
    await this.cleanup();
  }
}
```

### Vue

For Vue 3:

```typescript
import { createApp, App } from 'vue';
import WalletMeshModal from './components/WalletMeshModal.vue';

class VueAdapter extends BaseFrameworkAdapter {
  private app: App | null = null;

  render(props: ViewProps): void {
    if (!this.container) return;

    // Destroy previous app if it exists
    if (this.app) {
      this.app.unmount();
    }

    // Create new Vue app
    this.app = createApp(WalletMeshModal, {
      view: props.view,
      state: props.state,
      onAction: props.onAction
    });

    // Mount the app
    this.app.mount(this.container);
  }

  async destroy(): Promise<void> {
    // Unmount Vue app
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
    
    await this.cleanup();
  }
}
```

### Svelte

```typescript
import SvelteWalletModal from './SvelteWalletModal.svelte';

class SvelteAdapter extends BaseFrameworkAdapter {
  private app: any = null;

  render(props: ViewProps): void {
    if (!this.container) return;

    // Destroy previous component if it exists
    if (this.app && this.app.$destroy) {
      this.app.$destroy();
    }

    // Create and mount new component
    this.app = new SvelteWalletModal({
      target: this.container,
      props: {
        view: props.view,
        state: props.state,
        onAction: props.onAction
      }
    });
  }

  async destroy(): Promise<void> {
    // Destroy Svelte component
    if (this.app && this.app.$destroy) {
      this.app.$destroy();
      this.app = null;
    }
    
    await this.cleanup();
  }
}
```

## Testing Your Adapter

Create tests to verify your adapter's behavior:

```typescript
// Test rendering different views
it('should render wallet selection view', () => {
  adapter.render({
    view: 'walletSelection',
    state: {
      isOpen: true,
      currentView: 'walletSelection',
      wallets: [/* wallet mocks */]
    },
    onAction: () => {}
  });
  
  // Verify the view was rendered correctly
});

// Test cleanup
it('should clean up resources on destroy', async () => {
  // Setup your adapter
  
  // Track resources before
  const beforeResources = /* count resources */;
  
  // Destroy the adapter
  await adapter.destroy();
  
  // Verify resources were cleaned up
  const afterResources = /* count resources */;
  expect(afterResources).toBe(0);
});
```

## Advanced Features

### Theming

Apply theming to your framework components:

```typescript
protected applyFrameworkTheme(): void {
  if (!this.options.theme) return;
  
  // Apply theme values as CSS variables
  Object.entries(this.options.theme).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      document.documentElement.style.setProperty(
        `--walletmesh-${key}`,
        String(value)
      );
    }
  });
}
```

### View Transitions

Add animations for view transitions:

```typescript
private animateViewTransition(fromView: string, toView: string): void {
  // Implement transition animations between views
}
```

## Conclusion

By following this guide, you can create a fully functional framework adapter for WalletMesh that integrates seamlessly with your UI framework of choice. The adapter will handle rendering, user interactions, and resource cleanup while following the patterns and best practices of your framework.