# WalletMesh Lit Integration Guide for AI Agents

This guide provides AI-specific instructions for integrating WalletMesh with Lit web components.

## Table of Contents
1. [Basic Integration](#basic-integration)
2. [Controllers](#controllers)
3. [Component Patterns](#component-patterns)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)

## Basic Integration

### Installation Setup

```typescript
// 1. Install dependencies
// npm install @walletmesh/modal-core @walletmesh/modal-lit lit

// 2. Import components
import { 
  WalletElement,
  WalletController,
  WalletStateController
} from '@walletmesh/modal-lit';
```

### Element Setup

```typescript
// app.ts
import { WalletElement } from '@walletmesh/modal-lit';

// Register the wallet element
customElements.define('wallet-provider', WalletElement);

// Use in HTML
<wallet-provider
  chains="[1, 137]"
  theme="light"
  defaultProvider="eip1193"
>
  <your-app></your-app>
</wallet-provider>
```

## Controllers

### WalletController

```typescript
// Component using WalletController
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { WalletController } from '@walletmesh/modal-lit';

@customElement('wallet-connect')
export class WalletConnect extends LitElement {
  private wallet = new WalletController(this);

  async handleConnect() {
    try {
      await this.wallet.connect();
    } catch (error) {
      // Handle error
    }
  }

  render() {
    return html`
      <button @click=${this.handleConnect}>
        Connect Wallet
      </button>
    `;
  }
}
```

### WalletStateController

```typescript
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { WalletStateController } from '@walletmesh/modal-lit';

@customElement('wallet-status')
export class WalletStatus extends LitElement {
  private walletState = new WalletStateController(this);

  @state()
  private status = this.walletState.status;

  @state()
  private account = this.walletState.account;

  @state()
  private error = this.walletState.error;

  render() {
    const isConnected = this.status === 'connected';
    const hasError = Boolean(this.error);

    return html`
      <div>
        <div>Status: ${this.status}</div>
        ${isConnected ? html`
          <div>Account: ${this.account}</div>
        ` : null}
        ${hasError ? html`
          <div>Error: ${this.error.message}</div>
        ` : null}
      </div>
    `;
  }
}
```

## Component Patterns

### Connection Button

```typescript
@customElement('wallet-button')
export class WalletButton extends LitElement {
  private wallet = new WalletController(this);
  private walletState = new WalletStateController(this);

  @state()
  private status = this.walletState.status;

  async handleClick() {
    if (this.status === 'connected') {
      await this.wallet.disconnect();
    } else {
      await this.wallet.connect();
    }
  }

  get buttonText() {
    switch (this.status) {
      case 'connected':
        return 'Disconnect';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Connect Wallet';
      default:
        return 'Connect';
    }
  }

  render() {
    return html`
      <button
        @click=${this.handleClick}
        ?disabled=${this.status === 'connecting'}
      >
        ${this.buttonText}
      </button>
    `;
  }
}
```

### Chain Selector

```typescript
@customElement('chain-selector')
export class ChainSelector extends LitElement {
  private wallet = new WalletController(this);
  private walletState = new WalletStateController(this);

  @state()
  private chainId = this.walletState.chainId;

  private chains = [
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' }
  ];

  async handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const newChainId = Number(select.value);
    await this.wallet.switchChain(newChainId);
  }

  render() {
    return html`
      <select
        .value=${this.chainId}
        @change=${this.handleChange}
      >
        ${this.chains.map(chain => html`
          <option value=${chain.id}>
            ${chain.name}
          </option>
        `)}
      </select>
    `;
  }
}
```

## Error Handling

### Error Boundary Element

```typescript
@customElement('wallet-error-boundary')
export class WalletErrorBoundary extends LitElement {
  @state()
  private hasError = false;

  private error: Error | null = null;

  errorCallback(error: Error) {
    this.hasError = true;
    this.error = error;
    // Log error to monitoring service
    console.error('Wallet error:', error);
  }

  render() {
    if (this.hasError) {
      return html`
        <div class="error">
          <h3>Something went wrong</h3>
          <p>${this.error?.message}</p>
          <button @click=${() => this.hasError = false}>
            Try Again
          </button>
        </div>
      `;
    }

    return html`<slot></slot>`;
  }
}
```

### Error Handler Controller

```typescript
class WalletErrorController implements ReactiveController {
  host: ReactiveControllerHost;
  private walletState = new WalletStateController(this.host);

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    // Monitor wallet state for errors
    this.walletState.addEventListener('error', this.handleError);
  }

  hostDisconnected() {
    this.walletState.removeEventListener('error', this.handleError);
  }

  private handleError = async (error: Error) => {
    if (error.code === 'NETWORK_ERROR') {
      // Implement retry logic
      await this.retryConnection();
    }
  };

  private async retryConnection() {
    // Retry connection logic
  }
}
```

## Performance Optimization

### Controller Optimization

```typescript
// 1. Shared Controller Instance
const sharedWalletController = new WalletController(document);

@customElement('optimized-wallet')
class OptimizedWallet extends LitElement {
  // Reuse controller instance
  private wallet = sharedWalletController;
}

// 2. Selective Updates
class SelectiveWalletController implements ReactiveController {
  private lastUpdate = 0;
  private updateThreshold = 1000; // 1 second

  hostUpdate() {
    const now = Date.now();
    if (now - this.lastUpdate > this.updateThreshold) {
      this.lastUpdate = now;
      this.host.requestUpdate();
    }
  }
}

// 3. Batched Updates
class BatchedWalletController implements ReactiveController {
  private updates: Set<string> = new Set();
  private updateScheduled = false;

  queueUpdate(property: string) {
    this.updates.add(property);
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      queueMicrotask(() => this.processUpdates());
    }
  }

  private processUpdates() {
    this.updateScheduled = false;
    this.host.requestUpdate();
    this.updates.clear();
  }
}
```

### Render Optimization

```typescript
@customElement('optimized-wallet-display')
class OptimizedWalletDisplay extends LitElement {
  // 1. Use cached values
  @state()
  private status = '';

  @state()
  private account = '';

  // 2. Template caching
  static statusTemplate(status: string) {
    return html`<div>Status: ${status}</div>`;
  }

  static accountTemplate(account: string) {
    return html`<div>Account: ${account}</div>`;
  }

  // 3. Conditional rendering with cache
  render() {
    return html`
      ${this.status ? 
        OptimizedWalletDisplay.statusTemplate(this.status) : 
        null
      }
      ${this.account ? 
        OptimizedWalletDisplay.accountTemplate(this.account) : 
        null
      }
    `;
  }
}
```

## Testing Patterns

### Component Testing

```typescript
// 1. Mock Controller
class MockWalletController implements WalletController {
  connect = vi.fn();
  disconnect = vi.fn();
  switchChain = vi.fn();
}

// 2. Element Testing
describe('WalletButton', () => {
  let element: WalletButton;
  let mockController: MockWalletController;

  beforeEach(() => {
    mockController = new MockWalletController();
    element = fixture(html`
      <wallet-button></wallet-button>
    `);
    element.wallet = mockController;
  });

  it('should handle connection', async () => {
    const button = element.shadowRoot!.querySelector('button');
    button!.click();
    
    expect(mockController.connect).toHaveBeenCalled();
  });
});

// 3. State Testing
describe('WalletStatus', () => {
  it('should display account when connected', async () => {
    const element = fixture(html`
      <wallet-status></wallet-status>
    `);
    
    element.walletState.status = 'connected';
    element.walletState.account = '0x123';
    
    await element.updateComplete;
    
    expect(element).shadowDom.to.include.text('0x123');
  });
});
```

## Common Issues & Solutions

### 1. State Update Race Conditions

```typescript
class SafeWalletController implements ReactiveController {
  private updateQueue: Promise<void>[] = [];

  async queueUpdate(update: () => Promise<void>) {
    const updatePromise = (async () => {
      try {
        await Promise.all(this.updateQueue);
        await update();
      } finally {
        this.updateQueue = this.updateQueue.filter(
          p => p !== updatePromise
        );
      }
    })();
    
    this.updateQueue.push(updatePromise);
    return updatePromise;
  }
}
```

### 2. Event Listener Memory Leaks

```typescript
@customElement('safe-wallet')
class SafeWallet extends LitElement {
  private handlers = new Map<string, EventListener>();

  connectedCallback() {
    super.connectedCallback();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupEventListeners();
  }

  private setupEventListeners() {
    this.handlers.set('connect', this.handleConnect);
    this.handlers.forEach((handler, event) => {
      this.addEventListener(event, handler);
    });
  }

  private cleanupEventListeners() {
    this.handlers.forEach((handler, event) => {
      this.removeEventListener(event, handler);
    });
    this.handlers.clear();
  }
}
```

### 3. Property Change Detection

```typescript
class WalletPropertyController implements ReactiveController {
  private lastValues = new Map<string, any>();

  detectChanges(props: Record<string, any>) {
    const changes = new Map<string, {
      oldValue: any;
      newValue: any;
    }>();

    Object.entries(props).forEach(([key, value]) => {
      const oldValue = this.lastValues.get(key);
      if (!Object.is(oldValue, value)) {
        changes.set(key, { oldValue, newValue: value });
        this.lastValues.set(key, value);
      }
    });

    return changes;
  }
}
