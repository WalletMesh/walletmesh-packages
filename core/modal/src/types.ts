import type { TransportConfig } from './lib/transports/types.js';
import type { AdapterConfig } from './lib/adapters/types.js';

/**
 * Information about a DApp integrating with WalletMesh
 * @interface DappInfo
 * @property {string} name - The display name of the DApp
 * @property {string} description - A brief description of the DApp's purpose
 * @property {string} origin - The origin URL of the DApp (e.g. https://example.com)
 * @property {string} [icon] - Optional URL or data URI of the DApp's icon
 * @property {string} [rpcUrl] - Optional RPC endpoint URL for blockchain communication
 * @example
 * ```typescript
 * const dappInfo: DappInfo = {
 *   name: "My DApp",
 *   description: "A decentralized application",
 *   origin: "https://mydapp.com",
 *   icon: "https://mydapp.com/icon.png",
 *   rpcUrl: "https://rpc.example.com"
 * };
 * ```
 */
export interface DappInfo {
  name: string;
  description: string;
  origin: string;
  icon?: string;
  rpcUrl?: string;
}

/**
 * Configuration for a supported wallet
 * @interface WalletInfo
 * @property {string} id - Unique identifier for the wallet
 * @property {string} name - Display name of the wallet
 * @property {string} [icon] - Optional wallet icon URL or data URI
 * @property {string} [url] - Optional website or installation URL
 * @property {string[]} [supportedChains] - List of supported blockchain network IDs
 * @property {AdapterConfig} adapter - Configuration for the wallet's chain adapter
 * @property {TransportConfig} transport - Configuration for wallet communication
 * @example
 * ```typescript
 * const walletInfo: WalletInfo = {
 *   id: "my_wallet",
 *   name: "My Wallet",
 *   icon: "https://wallet.example.com/icon.png",
 *   url: "https://wallet.example.com",
 *   supportedChains: ["aztec:testnet", "aztec:mainnet"],
 *   adapter: {
 *     type: AdapterType.WalletMeshAztec,
 *     options: { chainId: "aztec:testnet" }
 *   },
 *   transport: {
 *     type: TransportType.PostMessage,
 *     options: { origin: "https://wallet.example.com" }
 *   }
 * };
 * ```
 */
export interface WalletInfo {
  id: string;
  name: string;
  icon?: string;
  url?: string;
  supportedChains?: string[];
  adapter: AdapterConfig;
  transport: TransportConfig;
}

/**
 * Runtime state of a connected wallet
 * @interface WalletState
 * @property {string} [chain] - Current blockchain network ID
 * @property {string} [address] - Connected wallet's address
 * @property {string} [sessionId] - Unique session identifier for the connection
 */
export interface WalletState {
  chain?: string;
  address?: string;
  sessionId?: string;
}

/**
 * Combined wallet information and state for an active connection
 * @interface ConnectedWallet
 * @property {WalletInfo} info - Static wallet configuration
 * @property {WalletState} state - Dynamic wallet connection state
 */
export interface ConnectedWallet {
  info: WalletInfo;
  state: WalletState;
}

/**
 * Possible states for a wallet connection
 * @enum {string}
 * @property {string} Idle - No active connection or connection attempt
 * @property {string} Connecting - Connection attempt in progress
 * @property {string} Connected - Successfully connected to wallet
 * @property {string} Disconnecting - Disconnection in progress
 * @property {string} Resuming - Attempting to restore previous session
 */
export enum ConnectionStatus {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting',
  Resuming = 'resuming',
}
