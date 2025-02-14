import type { AdapterConfig } from './lib/adapters/types.js';
import type { TransportConfig } from './lib/transports/types.js';

/**
 * Information about a DApp integrating with WalletMesh.
 *
 * Contains required and optional fields that describe the dApp
 * to users and wallets. Used for display and security purposes.
 *
 * @property name - Display name shown in wallet interfaces
 * @property description - Brief description of dApp functionality
 * @property origin - Origin URL for security validation
 * @property icon - Optional data URI of dApp icon
 * @property rpcUrl - Optional RPC endpoint for chain communication
 *
 * @remarks
 * Security considerations:
 * - origin must match the actual dApp origin for PostMessage security
 * - icon must be provided as a data URI to prevent XSS
 * - rpcUrl should use HTTPS
 *
 * @example
 * ```typescript
 * const dappInfo: DappInfo = {
 *   name: "My DApp",
 *   description: "A decentralized application",
 *   origin: "https://mydapp.com",
 *   icon: "data:image/svg+xml,...",  // Must be data URI
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
 * Configuration for a supported wallet integration.
 *
 * Defines how to connect to and interact with a specific wallet,
 * including its communication method and protocol adapter.
 *
 * @property id - Unique identifier for the wallet
 * @property name - User-friendly display name
 * @property icon - Optional data URI of wallet icon
 * @property url - Optional wallet website/install URL
 * @property supportedChains - Optional list of supported chain IDs
 * @property adapter - Chain-specific adapter configuration
 * @property transport - Communication transport configuration
 *
 * @remarks
 * Security requirements:
 * - icon must be a data URI
 * - transport origin must be specified for PostMessage
 * - chain IDs should be validated
 *
 * @example
 * ```typescript
 * const walletInfo: WalletInfo = {
 *   id: "my_wallet",
 *   name: "My Wallet",
 *   icon: "data:image/svg+xml,...",  // Must be data URI
 *   url: "https://wallet.example.com",
 *   supportedChains: ["aztec:testnet", "aztec:mainnet"],
 *   adapter: {
 *     type: "walletmesh_aztec",
 *     options: { chainId: "aztec:testnet" }
 *   },
 *   transport: {
 *     type: "postmessage",
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
 * Runtime state of a connected wallet.
 *
 * Contains the dynamic information about an active wallet connection,
 * used for session management and chain interactions.
 *
 * @property chain - Current blockchain network identifier
 * @property address - Connected wallet's blockchain address
 * @property sessionId - Unique identifier for the connection session
 *
 * @remarks
 * - All fields are optional for type flexibility
 * - chain format depends on adapter type
 * - address format depends on chain
 * - sessionId is used for reconnection
 *
 * @example
 * ```typescript
 * const state: WalletState = {
 *   chain: "aztec:testnet",
 *   address: "0x1234...",
 *   sessionId: "session_abc123"
 * };
 * ```
 */
export interface WalletState {
  chain?: string;
  address?: string;
  sessionId?: string;
}

/**
 * Combined wallet information and state for an active connection.
 *
 * Joins the static wallet configuration with its current runtime state.
 * Used throughout the library to represent connected wallets.
 *
 * @property info - Static wallet configuration
 * @property state - Current connection state
 *
 * @example
 * ```typescript
 * const wallet: ConnectedWallet = {
 *   info: {
 *     id: "my_wallet",
 *     name: "My Wallet",
 *     // ... other wallet info
 *   },
 *   state: {
 *     chain: "aztec:testnet",
 *     address: "0x1234...",
 *     sessionId: "abc123"
 *   }
 * };
 * ```
 */
export interface ConnectedWallet {
  info: WalletInfo;
  state: WalletState;
}

/**
 * Possible states for a wallet connection.
 *
 * Represents all possible states in the wallet connection lifecycle,
 * used for UI updates and connection management.
 *
 * @remarks
 * State transitions:
 * - Idle → Connecting | Resuming
 * - Connecting → Connected | Idle
 * - Connected → Disconnecting
 * - Disconnecting → Idle
 * - Resuming → Connected | Idle
 *
 * @example
 * ```typescript
 * // Check connection status
 * if (status === ConnectionStatus.Connected) {
 *   // Wallet is ready
 * }
 *
 * // Update UI based on status
 * switch (status) {
 *   case ConnectionStatus.Connecting:
 *     return <Loading />;
 *   case ConnectionStatus.Connected:
 *     return <WalletInfo />;
 *   default:
 *     return <ConnectButton />;
 * }
 * ```
 */
export enum ConnectionStatus {
  /** No active connection or connection attempt */
  Idle = 'idle',
  /** Connection attempt in progress */
  Connecting = 'connecting',
  /** Successfully connected to wallet */
  Connected = 'connected',
  /** Disconnection in progress */
  Disconnecting = 'disconnecting',
  /** Attempting to restore previous session */
  Resuming = 'resuming',
}
