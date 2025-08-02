/**
 * Content Script - Minimal Message Bridge
 *
 * This script acts as a relay between the dApp page and the extension's
 * background script. It does not contain any wallet logic for security.
 */

import type {
  ExtensionMessage,
  DiscoveryRequestMessage,
  DiscoveryAnnounceMessage,
  JsonRpcRequest,
  JsonRpcResponse,
} from './types.js';

declare global {
  interface WindowEventMap {
    'wallet:discover': CustomEvent<unknown>;
    'wallet:announce': CustomEvent<unknown>;
    'wallet:connect': CustomEvent<unknown>;
    'wallet:connected': CustomEvent<unknown>;
  }
}

// Inject a script to establish communication with the page
const script = document.createElement('script');
script.textContent = `
  // This runs in the page context
  (function() {
    // Listen for discovery requests from dApps
    window.addEventListener('wallet:discover', (event) => {
      // Forward to content script
      window.postMessage({
        type: 'walletmesh:discovery:request',
        detail: event.detail
      }, window.location.origin);
    });

    // Listen for connection requests from dApps
    window.addEventListener('wallet:connect', (event) => {
      // Forward to content script
      window.postMessage({
        type: 'walletmesh:connection:request',
        detail: event.detail
      }, window.location.origin);
    });

    // Listen for messages from extension
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'walletmesh:discovery:announce') {
        // Dispatch as a proper CustomEvent for the dApp
        const announceEvent = new CustomEvent('wallet:announce', {
          detail: event.data.detail
        });
        window.dispatchEvent(announceEvent);
      }
      
      if (event.data?.type === 'walletmesh:connection:response') {
        // Dispatch connection response for the dApp
        const responseEvent = new CustomEvent('wallet:connected', {
          detail: event.data.detail
        });
        window.dispatchEvent(responseEvent);
      }
    });

    // Signal that the bridge is ready
    window.postMessage({ type: 'walletmesh:bridge:ready' }, window.location.origin);
  })();
`;
(document.head || document.documentElement).appendChild(script);
script.remove();

// Message types for page communication
interface PageMessage {
  type: string;
  detail?: unknown;
}

interface DiscoveryRequestPageMessage extends PageMessage {
  type: 'walletmesh:discovery:request';
  detail: unknown;
}

interface DiscoveryAnnouncePageMessage extends PageMessage {
  type: 'walletmesh:discovery:announce';
  detail: unknown;
}

interface JsonRpcRequestPageMessage extends PageMessage {
  type: 'walletmesh:jsonrpc:request';
  detail: JsonRpcRequest;
}

interface JsonRpcResponsePageMessage extends PageMessage {
  type: 'walletmesh:jsonrpc:response';
  detail: JsonRpcResponse;
}

// Content script context - relay messages between page and background
window.addEventListener('message', async (event: MessageEvent<PageMessage>) => {
  // Only accept messages from the page we're injected into
  if (event.source !== window || !event.data?.type) return;

  switch (event.data.type) {
    case 'walletmesh:discovery:request': {
      const message = event.data as DiscoveryRequestPageMessage;
      // Forward discovery request to background script
      chrome.runtime.sendMessage<DiscoveryRequestMessage>({
        type: 'discovery:request',
        data: message.detail,
        origin: window.location.origin,
      });
      break;
    }

    case 'walletmesh:connection:request': {
      const message = event.data as { type: string; detail: unknown };
      // Forward connection request to background script
      chrome.runtime.sendMessage<ExtensionMessage>(
        {
          type: 'connection:request',
          data: message.detail,
          origin: window.location.origin,
        },
        (response) => {
          // Send response back to page
          window.postMessage(
            {
              type: 'walletmesh:connection:response',
              detail: response,
            },
            window.location.origin,
          );
        },
      );
      break;
    }

    case 'walletmesh:bridge:ready':
      // Bridge is ready, notify background
      chrome.runtime.sendMessage<ExtensionMessage>({
        type: 'bridge:ready',
        origin: window.location.origin,
      });
      break;

    case 'walletmesh:jsonrpc:request': {
      const message = event.data as JsonRpcRequestPageMessage;
      // Forward JSON-RPC request to background
      chrome.runtime.sendMessage<ExtensionMessage>(
        {
          type: 'jsonrpc:request',
          data: message.detail,
          origin: window.location.origin,
        },
        (response: JsonRpcResponse) => {
          // Send response back to page
          window.postMessage(
            {
              type: 'walletmesh:jsonrpc:response',
              detail: response,
            } as JsonRpcResponsePageMessage,
            window.location.origin,
          );
        },
      );
      break;
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: () => void) => {
    if (message.type === 'discovery:announce') {
      const announceMessage = message as DiscoveryAnnounceMessage;
      // Forward wallet announcement to the page
      window.postMessage(
        {
          type: 'walletmesh:discovery:announce',
          detail: announceMessage.data,
        } as DiscoveryAnnouncePageMessage,
        window.location.origin,
      );
    }
    return false; // Synchronous response
  },
);

// Notify background script when the tab is ready
chrome.runtime.sendMessage<ExtensionMessage>({
  type: 'tab:ready',
  origin: window.location.origin,
});
