/**
 * Shared Type Definitions and Constants
 *
 * This file contains extension-specific types that complement
 * the types from @walletmesh/discovery package.
 */

// Re-export types from discovery package for convenience
export type {
  DiscoveryRequest,
  WalletAnnouncement,
  ConnectionRequest,
  WalletInfo,
  SecurityPolicy,
} from '@walletmesh/discovery';

export interface Permission {
  method: string;
  origin: string;
  grantedAt: number;
}

export interface ConnectionResponse {
  type: 'wallet:connected';
  walletId: string;
  sessionId: string;
  connected: boolean;
  accounts?: string[];
  supportedMethods?: string[];
  interface?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface PendingPermission {
  origin: string;
  permission: string;
  timestamp: number;
}

export interface PermissionResponse {
  granted: boolean;
  responseOrigin: string;
  responsePermission: string;
}

export interface TransactionParams {
  from?: string;
  to?: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
}

export interface ChainConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

/**
 * Supported RPC methods that require permissions
 */
export const PERMISSION_REQUIRED_METHODS = [
  'eth_requestAccounts',
  'eth_sendTransaction',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
] as const;

export type PermissionRequiredMethod = (typeof PERMISSION_REQUIRED_METHODS)[number];

/**
 * Methods that don't require permissions
 */
export const PUBLIC_METHODS = [
  'eth_chainId',
  'eth_blockNumber',
  'net_version',
  'eth_getBalance',
  'eth_getTransactionCount',
  'eth_getCode',
  'eth_call',
  'eth_estimateGas',
  'eth_gasPrice',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
] as const;

export type PublicMethod = (typeof PUBLIC_METHODS)[number];

/**
 * Default chain configurations
 */
export const CHAINS: Record<string, ChainConfig> = {
  '0x1': {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  '0x89': {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  '0x38': {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
};

/**
 * Message types for communication between content script and background
 */
export const MESSAGE_TYPES = {
  // Discovery protocol (aligned with @walletmesh/discovery)
  DISCOVERY_REQUEST: 'discovery:request',
  DISCOVERY_ANNOUNCE: 'discovery:announce',
  CONNECTION_REQUEST: 'connection:request',

  // JSON-RPC
  JSONRPC_REQUEST: 'jsonrpc:request',
  JSONRPC_RESPONSE: 'jsonrpc:response',

  // Connection management
  BRIDGE_READY: 'bridge:ready',
  TAB_READY: 'tab:ready',

  // Permission management
  PERMISSION_REQUEST: 'permission:request',
  PERMISSION_RESPONSE: 'permission:response',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

/**
 * Permission display names
 */
export const PERMISSION_NAMES: Record<string, string> = {
  eth_accounts: 'View wallet addresses',
  eth_requestAccounts: 'Connect wallet',
  eth_sendTransaction: 'Send transactions',
  personal_sign: 'Sign messages',
  eth_signTypedData: 'Sign typed data',
  eth_signTypedData_v3: 'Sign typed data (v3)',
  eth_signTypedData_v4: 'Sign typed data (v4)',
};

/**
 * Chrome extension message types
 */
export interface ExtensionMessage {
  type: MessageType;
  data?: unknown;
  origin?: string;
}

export interface DiscoveryRequestMessage extends ExtensionMessage {
  type: typeof MESSAGE_TYPES.DISCOVERY_REQUEST;
  data: import('@walletmesh/discovery').DiscoveryRequest;
  origin: string;
}

export interface DiscoveryAnnounceMessage extends ExtensionMessage {
  type: typeof MESSAGE_TYPES.DISCOVERY_ANNOUNCE;
  data: import('@walletmesh/discovery').WalletAnnouncement;
}

export interface ConnectionRequestMessage extends ExtensionMessage {
  type: typeof MESSAGE_TYPES.CONNECTION_REQUEST;
  data: import('@walletmesh/discovery').ConnectionRequest;
  origin: string;
}

export interface JsonRpcRequestMessage extends ExtensionMessage {
  type: typeof MESSAGE_TYPES.JSONRPC_REQUEST;
  data: JsonRpcRequest;
  origin: string;
}

export interface JsonRpcResponseMessage extends ExtensionMessage {
  type: typeof MESSAGE_TYPES.JSONRPC_RESPONSE;
  data: JsonRpcResponse;
}

/**
 * Page message types (messages posted to window)
 */
export interface PageMessage {
  type: string;
  detail?: unknown;
}

export interface DiscoveryRequestPageMessage extends PageMessage {
  type: 'walletmesh:discovery:request';
  detail: DiscoveryRequest;
}

export interface DiscoveryAnnouncePageMessage extends PageMessage {
  type: 'walletmesh:discovery:announce';
  detail: WalletAnnouncement;
}

export interface JsonRpcRequestPageMessage extends PageMessage {
  type: 'walletmesh:jsonrpc:request';
  detail: JsonRpcRequest;
}

export interface JsonRpcResponsePageMessage extends PageMessage {
  type: 'walletmesh:jsonrpc:response';
  detail: JsonRpcResponse;
}
