/**
 * Background Script - Using @walletmesh/discovery package
 *
 * This implementation properly uses the @walletmesh/discovery package
 * with a custom Chrome extension transport adapter.
 */

import {
  DiscoveryResponder,
  createWalletSecurityPolicy,
  createWalletInfo,
  type WalletInfo as DiscoveryWalletInfo,
  type ConnectionRequest,
  type DiscoveryRequest,
  type WalletAnnouncement,
  DISCOVERY_EVENTS,
  ChainMatcher,
} from '@walletmesh/discovery';
import { JSONRPCNode } from '@walletmesh/jsonrpc';
import type {
  ExtensionMessage,
  JsonRpcRequestMessage,
  PendingPermission,
  PermissionResponse,
  TransactionParams,
  ConnectionResponse,
  JsonRpcRequest,
} from './types.js';

// Create wallet info using the discovery package helper
const WALLET_INFO = createWalletInfo.multiChain({
  rdns: 'com.example.walletmesh',
  name: 'WalletMesh Example Wallet',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iIzYzNjdGMCIvPgo8cGF0aCBkPSJNMjQgMTJMMTIgMjRMMjQgMzZMMzYgMjRMMjQgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
  chains: ['evm:1', 'evm:137', 'evm:56'],
});

// Create security policy using the discovery package helper
const securityPolicy = createWalletSecurityPolicy.development({
  // In production, use createWalletSecurityPolicy.strict()
  allowedOrigins: [], // Empty means allow all origins (development mode)
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000,
  },
});

// Permission storage
const permissions = new Map<string, Set<string>>();

// JSON-RPC node for handling RPC requests
const rpcNode = new JSONRPCNode({
  serializers: [],
});

// Connection state
interface ConnectionState {
  origin: string;
  walletId: string;
  sessionId: string;
  interface: string;
  timestamp: number;
}

const connections = new Map<string, ConnectionState>();

// Track tab IDs for message routing
const discoveryRequests = new Map<string, number>(); // sessionId -> tabId

// Create a custom Chrome extension transport
class ChromeExtensionTransport extends EventTarget {
  private messageListener:
    | ((message: ExtensionMessage, sender: chrome.runtime.MessageSender) => void)
    | null = null;

  constructor() {
    super();
    this.setupMessageListener();
  }

  private setupMessageListener(): void {
    this.messageListener = (message: ExtensionMessage, sender: chrome.runtime.MessageSender) => {
      if (message.type === 'discovery:request' && sender.tab?.url && sender.tab?.id) {
        const origin = new URL(sender.tab.url).origin;
        const request = message.data as DiscoveryRequest;

        // Store tab ID for response routing
        if (request.sessionId) {
          discoveryRequests.set(request.sessionId, sender.tab.id);
        }

        // Dispatch discovery event
        const event = new CustomEvent(DISCOVERY_EVENTS.DISCOVERY_REQUEST, {
          detail: {
            ...request,
            origin,
          },
        });

        this.dispatchEvent(event);
      }
    };

    chrome.runtime.onMessage.addListener(this.messageListener);
  }

  sendAnnouncement(announcement: WalletAnnouncement): void {
    // Route announcement to the correct tab using sessionId
    const tabId = discoveryRequests.get(announcement.sessionId);
    if (tabId) {
      chrome.tabs
        .sendMessage(tabId, {
          type: 'discovery:announce',
          data: announcement,
        })
        .catch(() => {
          // Tab might not have content script, ignore
        });

      // Clean up after sending
      setTimeout(() => {
        discoveryRequests.delete(announcement.sessionId);
      }, 5000);
    }
  }

  cleanup(): void {
    if (this.messageListener) {
      chrome.runtime.onMessage.removeListener(this.messageListener);
      this.messageListener = null;
    }
  }
}

// Global transport instance
let transport: ChromeExtensionTransport | null = null;
let announcer: DiscoveryResponder | null = null;

/**
 * Initialize the wallet
 */
async function initializeWallet(): Promise<void> {
  // Load saved permissions from storage
  const stored = await chrome.storage.local.get('permissions');
  if (stored.permissions) {
    for (const [origin, perms] of Object.entries(stored.permissions as Record<string, string[]>)) {
      permissions.set(origin, new Set(perms));
    }
  }

  // Register RPC handlers
  registerRpcHandlers();

  // Create transport and announcer
  transport = new ChromeExtensionTransport();

  // Create chain matcher for the wallet
  const chainMatcher = new ChainMatcher(WALLET_INFO.chains);

  // Create discovery announcer with proper event handling
  announcer = new DiscoveryResponder(WALLET_INFO, transport, chainMatcher, securityPolicy);

  // Handle announcement events by sending them through our transport
  announcer.on('announcement', (announcement: WalletAnnouncement) => {
    transport?.sendAnnouncement(announcement);
  });

  // Start listening for discovery requests
  announcer.startListening();

  console.log('WalletMesh Example Wallet initialized');
}

/**
 * Register RPC method handlers
 */
function registerRpcHandlers(): void {
  rpcNode.methods.add('eth_requestAccounts', handleRequestAccounts);
  rpcNode.methods.add('eth_accounts', handleGetAccounts);
  rpcNode.methods.add('eth_chainId', handleChainId);
  rpcNode.methods.add('eth_sendTransaction', handleSendTransaction);
  rpcNode.methods.add('personal_sign', handlePersonalSign);
  rpcNode.methods.add('wallet_switchEthereumChain', handleSwitchChain);
}

/**
 * Handle messages from content scripts
 */
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ): boolean => {
    // Validate sender
    if (!sender.tab?.url) {
      console.error('Message from unknown sender');
      return false;
    }

    const origin = new URL(sender.tab.url).origin;

    switch (message.type) {
      case 'connection:request': {
        // Handle connection request
        if (!sender.tab?.id) {
          sendResponse({
            type: 'wallet:connected',
            connected: false,
            error: {
              code: 'INVALID_SENDER',
              message: 'Invalid sender tab',
            },
          });
          return false;
        }
        handleConnectionRequest(message.data as ConnectionRequest, origin, sender.tab.id)
          .then(sendResponse)
          .catch((error: Error) => {
            sendResponse({
              type: 'wallet:connected',
              connected: false,
              error: {
                code: 'CONNECTION_FAILED',
                message: error.message,
              },
            });
          });
        return true; // Will respond asynchronously
      }

      case 'jsonrpc:request': {
        const jsonRpcMessage = message as JsonRpcRequestMessage;
        // Check if connection exists
        if (!connections.has(origin)) {
          sendResponse({
            jsonrpc: '2.0',
            id: (jsonRpcMessage.data as { id?: string | number }).id || null,
            error: {
              code: -32603,
              message: 'Not connected',
            },
          });
          return false;
        }

        // Handle using JSON-RPC node
        rpcNode
          .handle(jsonRpcMessage.data as JsonRpcRequest, { origin })
          .then(sendResponse)
          .catch((error: Error) => {
            sendResponse({
              jsonrpc: '2.0',
              id: (jsonRpcMessage.data as { id?: string | number }).id || null,
              error: {
                code: -32603,
                message: error.message,
              },
            });
          });
        return true; // Will respond asynchronously
      }

      case 'bridge:ready':
      case 'tab:ready':
        // Tab is ready, no action needed
        return false;

      default:
        // Discovery requests are handled by the transport listener
        return false;
    }
  },
);

/**
 * Handle connection requests
 */
async function handleConnectionRequest(
  request: ConnectionRequest,
  origin: string,
  tabId: number,
): Promise<ConnectionResponse | { error: string }> {
  // Validate request
  if (!request.sessionId || !request.walletId) {
    throw new Error('Missing sessionId or walletId');
  }

  // Request user permission for connection
  const granted = await requestPermission(origin, 'connect');
  if (!granted) {
    throw new Error('User denied connection');
  }

  // Store connection
  const connection: ConnectionState = {
    origin,
    walletId: request.walletId,
    sessionId: request.sessionId,
    interface: 'eip-1193', // Default interface
    timestamp: Date.now(),
  };
  connections.set(origin, connection);

  // Store in chrome storage for persistence
  await chrome.storage.local.set({
    [`connection_${origin}`]: connection,
  });

  // Return successful connection response
  return {
    type: 'wallet:connected',
    walletId: request.walletId,
    sessionId: request.sessionId,
    connected: true,
    accounts: ['0x1234567890123456789012345678901234567890'],
    supportedMethods: [
      'eth_requestAccounts',
      'eth_accounts',
      'eth_chainId',
      'eth_sendTransaction',
      'personal_sign',
      'eth_signTypedData_v4',
      'wallet_switchEthereumChain',
    ],
  };
}

/**
 * RPC Method Handlers
 */

async function handleRequestAccounts(params: unknown[], context: { origin: string }): Promise<string[]> {
  const { origin } = context;

  // Check if origin has permission
  if (!hasPermission(origin, 'eth_accounts')) {
    // Request permission from user
    const granted = await requestPermission(origin, 'eth_accounts');
    if (!granted) {
      throw new Error('User denied account access');
    }
  }

  // Return mock accounts
  return ['0x1234567890123456789012345678901234567890'];
}

async function handleGetAccounts(params: unknown[], context: { origin: string }): Promise<string[]> {
  const { origin } = context;

  if (!hasPermission(origin, 'eth_accounts')) {
    return [];
  }
  return ['0x1234567890123456789012345678901234567890'];
}

async function handleChainId(): Promise<string> {
  return '0x1'; // Ethereum mainnet
}

async function handleSendTransaction(params: unknown[], context: { origin: string }): Promise<string> {
  const { origin } = context;

  // Check permission
  if (!hasPermission(origin, 'eth_sendTransaction')) {
    const granted = await requestPermission(origin, 'eth_sendTransaction');
    if (!granted) {
      throw new Error('User denied transaction');
    }
  }

  const txParams = params[0] as TransactionParams;

  // In a real implementation, show transaction approval UI
  console.log('Transaction request from', origin, txParams);

  // Return mock transaction hash
  return `0x${crypto.randomUUID().replace(/-/g, '')}`;
}

async function handlePersonalSign(params: unknown[], context: { origin: string }): Promise<string> {
  const { origin } = context;

  // Check permission
  if (!hasPermission(origin, 'personal_sign')) {
    const granted = await requestPermission(origin, 'personal_sign');
    if (!granted) {
      throw new Error('User denied message signing');
    }
  }

  const message = params[0] as string;

  // In a real implementation, show signing approval UI
  console.log('Signing request from', origin, message);

  // Return mock signature
  return `0x${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`;
}

async function handleSwitchChain(params: unknown[]): Promise<null> {
  const chainParams = params[0] as { chainId: string };
  console.log('Switching to chain:', chainParams.chainId);

  // In a real implementation, switch the active chain
  return null;
}

/**
 * Check if origin has a specific permission
 */
function hasPermission(origin: string, permission: string): boolean {
  const originPerms = permissions.get(origin);
  return originPerms?.has(permission) || false;
}

/**
 * Request permission from user
 */
async function requestPermission(origin: string, permission: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Store pending permission request
    chrome.storage.local.set({
      pendingPermission: {
        origin,
        permission,
        timestamp: Date.now(),
      } as PendingPermission,
    });

    // Open popup to request permission
    chrome.action.openPopup();

    // Listen for permission response
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.permissionResponse) {
        chrome.storage.onChanged.removeListener(listener);

        const response = changes.permissionResponse.newValue as PermissionResponse;

        if (response.responseOrigin === origin && response.responsePermission === permission) {
          if (response.granted) {
            // Save permission
            const originPerms = permissions.get(origin) || new Set<string>();
            originPerms.add(permission);
            permissions.set(origin, originPerms);

            // Persist to storage
            savePermissions();
          }

          resolve(response.granted);
        }
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Timeout after 30 seconds
    setTimeout(() => {
      chrome.storage.onChanged.removeListener(listener);
      resolve(false);
    }, 30000);
  });
}

/**
 * Save permissions to storage
 */
async function savePermissions(): Promise<void> {
  const permObj: Record<string, string[]> = {};
  permissions.forEach((perms, origin) => {
    permObj[origin] = Array.from(perms);
  });

  await chrome.storage.local.set({ permissions: permObj });
}

/**
 * Handle extension installation
 */
chrome.runtime.onInstalled.addListener(() => {
  console.log('WalletMesh Example Wallet installed');
  initializeWallet();
});

/**
 * Handle extension startup
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('WalletMesh Example Wallet started');
  initializeWallet();
});

// Initialize on load
initializeWallet();
