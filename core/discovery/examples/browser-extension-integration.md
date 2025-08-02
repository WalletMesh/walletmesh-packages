# Browser Extension Integration with WalletMesh Discovery

This guide demonstrates how to integrate a browser extension wallet (specifically an Aztec wallet) with the WalletMesh discovery system that modal-react applications use to find and connect to wallets.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Extension Implementation](#extension-implementation)
3. [dApp Integration](#dapp-integration)
4. [Security Considerations](#security-considerations)
5. [Testing and Debugging](#testing-and-debugging)
6. [Production Deployment](#production-deployment)

## Architecture Overview

The integration consists of three main components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   dApp Page     │    │ Extension        │    │ Extension       │
│                 │    │ Content Script   │    │ Background      │
│ modal-react     │◄──►│                  │◄──►│                 │
│ useConnect()    │    │ Message Bridge   │    │ Discovery       │
│ WalletMesh      │    │                  │    │ Announcer       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
         ▼                        ▼                       ▼
   Discovery Events ──────► Page Events ─────► Extension Events
   (CustomEvents)          (window.dispatchEvent)    (chrome.runtime)
```

### Key Components

1. **dApp Side**: Uses modal-react hooks to discover and connect to wallets
2. **Content Script**: Minimal bridge that forwards discovery events between page and extension
3. **Background Script**: Runs the discovery announcer and handles wallet operations

## Extension Implementation

### 1. Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "Aztec Wallet",
  "version": "1.0.0",
  "description": "Privacy-preserving Aztec wallet",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["injected.js"],
      "matches": ["<all_urls>"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Aztec Wallet"
  }
}
```

### 2. Content Script Bridge

```typescript
// content.js
/**
 * Minimal content script that bridges discovery events between page and extension
 */

// Forward discovery requests from page to extension
window.addEventListener('discovery:request', (event: CustomEvent) => {
  chrome.runtime.sendMessage({
    type: 'discovery-request',
    data: event.detail,
    origin: window.location.origin
  });
});

// Forward discovery responses from extension to page
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'discovery-response') {
    const event = new CustomEvent('responder:announce', {
      detail: message.data
    });
    window.dispatchEvent(event);
  }
});

// Forward connection requests from page to extension
window.addEventListener('initiator:connect', (event: CustomEvent) => {
  chrome.runtime.sendMessage({
    type: 'connection-request',
    data: event.detail,
    origin: window.location.origin
  });
});

console.log('Aztec Wallet content script loaded');
```

### 3. Background Script with Discovery Integration

```typescript
// background.ts
import { createResponderInfo, createDiscoveryResponder } from '@walletmesh/discovery/responder';
import type { CapabilityRequest, DiscoveryResponder } from '@walletmesh/discovery/responder';

/**
 * Aztec wallet background script with WalletMesh discovery integration
 */
class AztecWalletBackground {
  private announcer: DiscoveryResponder | null = null;
  private eventTarget: EventTarget;

  constructor() {
    this.eventTarget = new EventTarget();
    this.setupDiscovery();
    this.setupMessageHandlers();
  }

  private setupDiscovery(): void {
    // Create Aztec wallet configuration
    const walletInfo = createResponderInfo.aztec({
      uuid: crypto.randomUUID(),
      rdns: 'com.aztec.wallet',
      name: 'Aztec Wallet',
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANS...', // Your wallet icon
      type: 'extension',
      chains: ['aztec:mainnet', 'aztec:testnet'],
      features: [
        'private-transactions',
        'transaction-signing',
        'message-signing',
        'account-management'
      ],
      // Transport configuration - CRITICAL for extension discovery
      transportConfig: {
        type: 'extension',
        extensionId: chrome.runtime.id,
        walletAdapter: 'AztecWalletAdapter',
        adapterConfig: {
          pxeUrl: 'http://localhost:8080',
          supportedMethods: [
            'aztec_getAccounts',
            'aztec_sendTransaction',
            'aztec_createAuthWitness',
            'aztec_signMessage',
            'aztec_getPublicKey'
          ],
          apiVersion: 'v1',
          features: {
            privateTransactions: true,
            publicTransactions: true,
            noteManagement: true,
            contractDeployment: false
          }
        }
      }
    });

    // Create discovery announcer with security policy
    this.announcer = createDiscoveryResponder({
      responderInfo: walletInfo,
      securityPolicy: {
        requireHttps: true,
        allowLocalhost: true, // Allow localhost for development
        allowedOrigins: [
          // Add trusted dApp origins here
          'https://aztec-dapp.com',
          'https://app.aztec.network'
        ],
        rateLimit: {
          enabled: true,
          maxRequests: 10,
          windowMs: 60000 // 1 minute
        }
      },
      eventTarget: this.eventTarget
    });

    // Start listening for discovery requests
    this.announcer.startListening();
    console.log('Aztec Wallet discovery announcer started');
  }

  private setupMessageHandlers(): void {
    // Handle messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'discovery-request':
          this.handleDiscoveryRequest(message.data, message.origin, sender);
          break;
        case 'connection-request':
          this.handleConnectionRequest(message.data, message.origin, sender);
          break;
      }
    });

    // Listen for responses from discovery announcer
    this.eventTarget.addEventListener('responder:announce', (event: CustomEvent) => {
      this.forwardResponseToPage(event.detail);
    });
  }

  private handleDiscoveryRequest(
    request: CapabilityRequest,
    origin: string,
    sender: chrome.runtime.MessageSender
  ): void {
    console.log('Received discovery request from:', origin);
    
    // Validate that the request is from a legitimate page
    if (!sender.tab?.url) {
      console.warn('Discovery request from invalid sender');
      return;
    }

    // Verify origin matches sender
    const senderOrigin = new URL(sender.tab.url).origin;
    if (senderOrigin !== origin) {
      console.warn('Origin mismatch in discovery request');
      return;
    }

    // Forward to discovery announcer by dispatching event
    const event = new CustomEvent('discovery:request', {
      detail: request
    });
    this.eventTarget.dispatchEvent(event);
  }

  private handleConnectionRequest(
    request: any,
    origin: string,
    sender: chrome.runtime.MessageSender
  ): void {
    console.log('Received connection request from:', origin);
    
    // Validate and handle connection
    if (!this.announcer) {
      console.error('Discovery announcer not initialized');
      return;
    }

    // Handle connection request with user consent
    this.requestUserConsent(request, origin)
      .then((approved) => {
        if (approved) {
          this.announcer!.handleConnectionApproval(request.sessionId, true);
          this.establishConnection(request, sender);
        } else {
          this.announcer!.handleConnectionApproval(request.sessionId, false);
        }
      })
      .catch((error) => {
        console.error('Connection request failed:', error);
        this.announcer!.handleConnectionApproval(request.sessionId, false);
      });
  }

  private async requestUserConsent(
    request: any,
    origin: string
  ): Promise<boolean> {
    // Show user consent UI (popup window)
    return new Promise((resolve) => {
      chrome.windows.create({
        url: chrome.runtime.getURL(`popup.html?origin=${encodeURIComponent(origin)}&action=connect`),
        type: 'popup',
        width: 400,
        height: 600,
        focused: true
      }, (window) => {
        // Listen for user response
        const handleMessage = (message: any) => {
          if (message.type === 'user-consent-response' && message.windowId === window?.id) {
            chrome.runtime.onMessage.removeListener(handleMessage);
            resolve(message.approved);
          }
        };
        chrome.runtime.onMessage.addListener(handleMessage);
      });
    });
  }

  private async establishConnection(
    request: any,
    sender: chrome.runtime.MessageSender
  ): Promise<void> {
    try {
      // Initialize Aztec wallet connection
      const accounts = await this.getAccounts();
      const publicKey = await this.getPublicKey(accounts[0]);

      // Send connection success to content script
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'connection-established',
          data: {
            accounts,
            publicKey,
            chainId: 'aztec:mainnet'
          }
        });
      }
    } catch (error) {
      console.error('Failed to establish connection:', error);
      
      // Send connection failure to content script
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'connection-failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private forwardResponseToPage(response: any): void {
    // Send response to all active tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'discovery-response',
            data: response
          });
        }
      });
    });
  }

  private async getAccounts(): Promise<string[]> {
    // Implement your Aztec account retrieval logic
    // This would typically interact with your PXE or wallet storage
    return ['0x1234567890abcdef1234567890abcdef12345678'];
  }

  private async getPublicKey(account: string): Promise<string> {
    // Implement your Aztec public key retrieval logic
    return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
  }

  cleanup(): void {
    if (this.announcer) {
      this.announcer.cleanup();
    }
  }
}

// Initialize the background service
const aztecWallet = new AztecWalletBackground();

// Cleanup on extension unload
self.addEventListener('beforeunload', () => {
  aztecWallet.cleanup();
});
```

### 4. Popup UI for User Consent

```typescript
// popup.ts
/**
 * Popup UI for handling user consent and wallet interactions
 */

interface ConsentRequest {
  origin: string;
  action: 'connect' | 'sign' | 'transaction';
  details?: any;
}

class PopupController {
  private request: ConsentRequest | null = null;

  constructor() {
    this.parseRequest();
    this.setupUI();
  }

  private parseRequest(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const origin = urlParams.get('origin');
    const action = urlParams.get('action') as ConsentRequest['action'];

    if (origin && action) {
      this.request = { origin, action };
    }
  }

  private setupUI(): void {
    if (!this.request) {
      this.showError('Invalid request');
      return;
    }

    const container = document.getElementById('popup-container');
    if (!container) return;

    // Create consent dialog safely without innerHTML
    const dialog = document.createElement('div');
    dialog.className = 'consent-dialog';

    const title = document.createElement('h2');
    title.textContent = 'Connection Request';
    dialog.appendChild(title);

    const message = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = this.request.origin; // Safe - textContent escapes HTML
    message.appendChild(strong);
    message.appendChild(document.createTextNode(' wants to connect to your Aztec Wallet'));
    dialog.appendChild(message);

    const permissions = document.createElement('div');
    permissions.className = 'permissions';
    
    const permTitle = document.createElement('h3');
    permTitle.textContent = 'This will allow the dApp to:';
    permissions.appendChild(permTitle);

    const permList = document.createElement('ul');
    const perms = [
      'View your Aztec account addresses',
      'Request transaction signatures', 
      'Access your public key'
    ];
    perms.forEach(perm => {
      const li = document.createElement('li');
      li.textContent = perm;
      permList.appendChild(li);
    });
    permissions.appendChild(permList);
    dialog.appendChild(permissions);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const rejectBtn = document.createElement('button');
    rejectBtn.id = 'reject-btn';
    rejectBtn.className = 'btn btn-secondary';
    rejectBtn.textContent = 'Reject';
    rejectBtn.addEventListener('click', () => {
      this.respondToConsent(false);
    });

    const approveBtn = document.createElement('button');
    approveBtn.id = 'approve-btn';
    approveBtn.className = 'btn btn-primary';
    approveBtn.textContent = 'Approve';
    approveBtn.addEventListener('click', () => {
      this.respondToConsent(true);
    });

    actions.appendChild(rejectBtn);
    actions.appendChild(approveBtn);
    dialog.appendChild(actions);

    container.replaceChildren(dialog);
  }

  private respondToConsent(approved: boolean): void {
    // Send response to background script
    chrome.runtime.sendMessage({
      type: 'user-consent-response',
      approved,
      windowId: chrome.windows.WINDOW_ID_CURRENT
    });

    // Close popup
    window.close();
  }

  private showError(message: string): void {
    const container = document.getElementById('popup-container');
    if (container) {
      // Create error dialog safely without innerHTML
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error';

      const title = document.createElement('h2');
      title.textContent = 'Error';
      errorDiv.appendChild(title);

      const errorMessage = document.createElement('p');
      errorMessage.textContent = message; // Safe - textContent escapes HTML
      errorDiv.appendChild(errorMessage);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'btn btn-primary';
      closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', () => window.close());
      errorDiv.appendChild(closeBtn);

      container.replaceChildren(errorDiv);
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
```

## dApp Integration

### 1. WalletMeshProvider Setup

```typescript
// App.tsx
import { WalletMeshProvider } from '@walletmesh/modal-react';
import { ChainType } from '@walletmesh/modal-core';

function App() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'My Aztec dApp',
        appDescription: 'Privacy-preserving dApp using Aztec',
        appUrl: 'https://my-aztec-dapp.com',
        appIcon: 'https://my-aztec-dapp.com/icon.png',
        chains: [
          {
            chainId: 'aztec:mainnet',
            chainType: ChainType.Aztec,
            name: 'Aztec Mainnet',
            icon: 'https://aztec.network/icon.png'
          },
          {
            chainId: 'aztec:testnet', 
            chainType: ChainType.Aztec,
            name: 'Aztec Testnet',
            icon: 'https://aztec.network/icon.png'
          }
        ],
        // Discovery configuration
        discovery: {
          enabled: true,
          timeout: 5000,
          requirements: {
            chains: ['aztec:mainnet'],
            features: ['private-transactions', 'transaction-signing'],
            interfaces: ['aztec-wallet-api-v1']
          },
          preferences: {
            chains: ['aztec:testnet'],
            features: ['message-signing', 'account-management']
          }
        },
        debug: true
      }}
    >
      <DAppContent />
    </WalletMeshProvider>
  );
}
```

### 2. Using Discovery in React Components

```typescript
// components/WalletConnect.tsx
import { useConnect, useAccount, useConfig } from '@walletmesh/modal-react';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const { connect, isConnecting, error } = useConnect();
  const { isConnected, address, wallet } = useAccount();
  const { wallets } = useConfig();
  const [discoveredWallets, setDiscoveredWallets] = useState<any[]>([]);

  // Filter for Aztec wallets discovered via the protocol
  useEffect(() => {
    const aztecWallets = wallets.filter(wallet => 
      wallet.id === 'aztec-wallet' || 
      wallet.chains?.some((chain: string) => chain.startsWith('aztec:'))
    );
    setDiscoveredWallets(aztecWallets);
  }, [wallets]);

  if (isConnected && address && wallet) {
    return (
      <div className="wallet-connected">
        <h3>Connected to {wallet.name}</h3>
        <p>Address: {address}</p>
        <p>Transport: {wallet.transportConfig?.type}</p>
        {wallet.transportConfig?.type === 'extension' && (
          <p>Extension ID: {wallet.transportConfig?.extensionId}</p>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <h2>Connect Aztec Wallet</h2>
      
      {error && (
        <div className="error">
          Error: {error.message}
        </div>
      )}

      <div className="discovered-wallets">
        <h3>Available Wallets ({discoveredWallets.length})</h3>
        {discoveredWallets.length === 0 && (
          <p>No Aztec wallets found. Please install an Aztec wallet extension.</p>
        )}
        
        {discoveredWallets.map(wallet => (
          <div key={wallet.id} className="wallet-option">
            <img src={wallet.icon} alt={wallet.name} width="32" height="32" />
            <div>
              <h4>{wallet.name}</h4>
              <p>Supports: {wallet.chains?.join(', ')}</p>
              {wallet.transportConfig && (
                <p>
                  Connection: {wallet.transportConfig.type}
                  {wallet.transportConfig.type === 'extension' && 
                    ` (ID: ${wallet.transportConfig.extensionId?.slice(0, 8)}...)`
                  }
                </p>
              )}
            </div>
            <button 
              onClick={() => connect(wallet.id)}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={() => connect()}
        disabled={isConnecting || discoveredWallets.length === 0}
        className="connect-button"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
```

### 3. Handling Extension-Specific Features

```typescript
// components/AztecTransactions.tsx
import { useTransaction, useProvider } from '@walletmesh/modal-react';
import { useCallback } from 'react';

export function AztecTransactions() {
  const { sendTransaction, status } = useTransaction();
  const { provider } = useProvider();

  const sendPrivateTransaction = useCallback(async () => {
    if (!provider) return;

    try {
      // Extension-specific Aztec transaction
      const result = await sendTransaction({
        method: 'aztec_sendTransaction',
        params: {
          to: '0x...',
          functionData: '0x...',
          txFee: '1000000',
          privateKey: false // Use extension's private key
        }
      });

      console.log('Transaction sent:', result);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  }, [provider, sendTransaction]);

  const createAuthWitness = useCallback(async () => {
    if (!provider) return;

    try {
      // Extension-specific Aztec auth witness
      const witness = await provider.request({
        method: 'aztec_createAuthWitness',
        params: {
          messageHash: '0x...',
          caller: '0x...'
        }
      });

      console.log('Auth witness created:', witness);
    } catch (error) {
      console.error('Auth witness creation failed:', error);
    }
  }, [provider]);

  return (
    <div className="aztec-transactions">
      <h3>Aztec Operations</h3>
      
      <button 
        onClick={sendPrivateTransaction}
        disabled={status === 'pending'}
      >
        {status === 'pending' ? 'Sending...' : 'Send Private Transaction'}
      </button>

      <button onClick={createAuthWitness}>
        Create Auth Witness
      </button>
    </div>
  );
}
```

## Security Considerations

### 1. Origin Validation

```typescript
// Enhanced origin validation in background script
private validateOrigin(origin: string, sender: chrome.runtime.MessageSender): boolean {
  // Verify sender tab URL matches claimed origin
  if (!sender.tab?.url) return false;
  
  const senderOrigin = new URL(sender.tab.url).origin;
  if (senderOrigin !== origin) return false;

  // Check against allowlist
  const allowedOrigins = [
    'https://app.aztec.network',
    'https://aztec-dapp.com',
    // Add more trusted origins
  ];

  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    return process.env.NODE_ENV === 'development';
  }

  return allowedOrigins.includes(origin);
}
```

### 2. Rate Limiting

```typescript
// Rate limiting implementation
private rateLimiter = new Map<string, { count: number; lastReset: number }>();

private checkRateLimit(origin: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  const current = this.rateLimiter.get(origin) || { count: 0, lastReset: now };

  // Reset if window expired
  if (now - current.lastReset > windowMs) {
    current.count = 0;
    current.lastReset = now;
  }

  current.count++;
  this.rateLimiter.set(origin, current);

  return current.count <= maxRequests;
}
```

### 3. User Consent Management

```typescript
// Consent tracking
private consentStore = new Map<string, {
  granted: boolean;
  timestamp: number;
  permissions: string[];
}>();

private async getStoredConsent(origin: string): Promise<boolean> {
  const consent = this.consentStore.get(origin);
  if (!consent) return false;

  // Check if consent is still valid (e.g., 30 days)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - consent.timestamp < thirtyDays;
}
```

## Testing and Debugging

### 1. Debug Mode

```typescript
// Enable debug logging in background script
const DEBUG = true;

private debug(message: string, ...args: any[]): void {
  if (DEBUG) {
    console.log(`[AztecWallet] ${message}`, ...args);
  }
}
```

### 2. Extension Testing

```typescript
// Test discovery flow
async function testDiscovery() {
  // Simulate discovery request
  const testRequest = {
    type: 'discovery:request',
    sessionId: crypto.randomUUID(),
    chains: ['aztec:mainnet'],
    features: ['private-transactions'],
    interfaces: ['aztec-wallet-api-v1'],
    origin: 'http://localhost:3000',
    timestamp: Date.now()
  };

  // Dispatch test event
  const event = new CustomEvent('discovery:request', { detail: testRequest });
  window.dispatchEvent(event);

  // Wait for response
  return new Promise((resolve) => {
    const handler = (event: CustomEvent) => {
      if (event.detail.sessionId === testRequest.sessionId) {
        window.removeEventListener('responder:announce', handler);
        resolve(event.detail);
      }
    };
    window.addEventListener('responder:announce', handler);
  });
}
```

### 3. dApp Testing

```typescript
// Test component for discovery
export function DiscoveryTest() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const runDiscoveryTest = async () => {
    try {
      const results = await testDiscovery();
      setTestResults([results]);
    } catch (error) {
      console.error('Discovery test failed:', error);
    }
  };

  return (
    <div>
      <button onClick={runDiscoveryTest}>Test Discovery</button>
      <pre>{JSON.stringify(testResults, null, 2)}</pre>
    </div>
  );
}
```

## Production Deployment

### 1. Chrome Web Store Preparation

```json
{
  "name": "Aztec Wallet",
  "description": "Privacy-preserving wallet for the Aztec Network with WalletMesh discovery support",
  "version": "1.0.0",
  "homepage_url": "https://aztec.network",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://*.aztec.network/*",
    "https://app.aztec.network/*"
  ]
}
```

### 2. Performance Optimization

```typescript
// Lazy load discovery only when needed
private async initializeDiscovery(): Promise<void> {
  if (this.announcer) return;

  // Only initialize when first discovery request is received
  const { createResponderInfo, createDiscoveryResponder } = await import('@walletmesh/discovery/responder');
  
  // Initialize as shown above
  this.setupDiscovery();
}
```

### 3. Error Reporting

```typescript
// Production error reporting
private reportError(error: Error, context: string): void {
  if (process.env.NODE_ENV === 'production') {
    // Send to error reporting service
    fetch('https://api.sentry.io/...', {
      method: 'POST',
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        context,
        extensionVersion: chrome.runtime.getManifest().version
      })
    });
  } else {
    console.error(`[${context}]`, error);
  }
}
```

## Best Practices Summary

### ✅ Do's

1. **Use the discovery APIs correctly**:
   - Use `createResponderInfo.aztec()` for pre-configured Aztec setup
   - Include proper `transportConfig` with extension ID
   - Set up security policies with origin validation

2. **Implement proper security**:
   - Validate all message origins
   - Implement rate limiting
   - Require user consent for all connections
   - Store sensitive data securely

3. **Handle errors gracefully**:
   - Provide clear error messages to users
   - Log errors for debugging
   - Implement fallback strategies

4. **Test thoroughly**:
   - Test discovery flow end-to-end
   - Test with multiple dApps
   - Test error conditions and edge cases

### ❌ Don'ts

1. **Don't skip security measures**:
   - Never trust origins without validation
   - Don't auto-approve connections
   - Don't expose private keys or sensitive data

2. **Don't break the discovery protocol**:
   - Don't modify message formats
   - Don't respond to requests you can't fulfill
   - Don't ignore session management

3. **Don't create poor UX**:
   - Don't show confusing consent dialogs
   - Don't fail silently
   - Don't require unnecessary permissions

## Conclusion

This integration example demonstrates how to build a complete browser extension wallet that properly integrates with the WalletMesh discovery system. The key points are:

1. **Minimal Content Script**: Acts as a simple bridge between page and extension
2. **Discovery Announcer**: Uses WalletMesh APIs to announce wallet capabilities
3. **Transport Configuration**: Properly configures extension transport for connection
4. **Security**: Implements proper origin validation and user consent
5. **dApp Integration**: Shows how modal-react discovers and connects to the extension

With this implementation, your Aztec wallet extension will be discoverable by any dApp using modal-react, providing a seamless user experience for wallet connections in the Aztec ecosystem.