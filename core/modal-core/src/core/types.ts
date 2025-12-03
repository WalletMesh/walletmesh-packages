/**
 * Core foundational types for the modal-core package
 *
 * This file contains only the most basic types that don't depend on other modules.
 * These types can be safely imported by other modules without creating circular dependencies.
 *
 * @module core/types
 * @packageDocumentation
 */

/**
 * Connection status enum representing wallet connection lifecycle states
 *
 * @remarks
 * This enum defines all possible states a wallet connection can be in.
 * Use the status helper functions (isConnected, isConnecting, etc.) for type-safe status checks.
 *
 * @public
 * @enum {string}
 * @example
 * ```typescript
 * const connectionState = getConnectionState();
 *
 * switch (connectionState.status) {
 *   case ConnectionStatus.Connected:
 *     console.log('Wallet is connected');
 *     break;
 *   case ConnectionStatus.Connecting:
 *     console.log('Connection in progress...');
 *     break;
 *   case ConnectionStatus.Error:
 *     console.log('Connection failed');
 *     break;
 * }
 * ```
 */
export enum ConnectionStatus {
  /** No wallet is connected */
  Disconnected = 'disconnected',

  /** Connection attempt is in progress */
  Connecting = 'connecting',

  /** Wallet is successfully connected */
  Connected = 'connected',

  /** Connection attempt failed or connection was lost with error */
  Error = 'error',

  /** Attempting to reconnect after connection loss */
  Reconnecting = 'reconnecting',
}

/**
 * Enum for blockchain types supported by wallet connectors
 *
 * This enum represents the different blockchain ecosystems that wallets can connect to.
 * Add new chain types here as they are supported by the framework.
 *
 * @enum {string}
 * @public
 *
 * @example
 * // Check if a wallet supports EVM chains
 * if (wallet.chains.includes(ChainType.Evm)) {
 *   // Connect to an EVM chain
 * }
 */
export enum ChainType {
  /** Ethereum Virtual Machine based chains (Ethereum, Polygon, Arbitrum, etc.) */
  Evm = 'evm',

  /** Solana blockchain */
  Solana = 'solana',

  /** Aztec network */
  Aztec = 'aztec',
}

/**
 * Basic wallet information interface
 *
 * @remarks
 * Contains essential metadata about a wallet for display and connection purposes.
 * This information is used to render wallet options in the modal UI.
 *
 * @public
 * @example
 * ```typescript
 * const walletInfo: WalletInfo = {
 *   id: 'metamask',
 *   name: 'MetaMask',
 *   icon: 'https://example.com/metamask-icon.png',
 *   chains: [ChainType.Evm],
 *   description: 'Connect to the decentralized web',
 *   downloadUrl: 'https://metamask.io/download'
 * };
 * ```
 */
export interface WalletInfo {
  /** Unique identifier for the wallet */
  id: string;

  /** Display name of the wallet */
  name: string;

  /** URL or data URI of the wallet's icon for UI display */
  icon?: string;

  /** Array of blockchain types this wallet supports */
  chains: ChainType[];

  /** Optional description of the wallet's features */
  description?: string;

  /** URL where users can download/install the wallet */
  downloadUrl?: string;

  /** Optional array of features supported by the wallet */
  features?: string[];

  /** Optional version of the wallet */
  version?: string;
}

/**
 * Basic connection state interface
 *
 * @remarks
 * Represents the current state of a wallet connection including status,
 * connected wallet information, and account details. This is the foundation
 * for connection state management throughout the system.
 *
 * @public
 * @example
 * ```typescript
 * const connectionState: BaseConnectionState = {
 *   status: ConnectionStatus.Connected,
 *   walletId: 'metamask',
 *   address: '0x1234...5678',
 *   chainId: 'eip155:1',
 *   chainType: ChainType.Evm,
 *   accounts: ['0x1234...5678', '0x8765...4321']
 * };
 * ```
 */
export interface BaseConnectionState {
  /** Current connection status */
  status: ConnectionStatus;

  /** ID of the connected wallet (undefined when disconnected) */
  walletId?: string;

  /** Primary account address (undefined when disconnected) */
  address?: string;

  /** Current chain ID in CAIP-2 format (undefined when disconnected) */
  chainId?: string;

  /** Type of the current chain (undefined when disconnected) */
  chainType?: ChainType;

  /** Array of all available accounts (empty when disconnected) */
  accounts?: string[];
}

/**
 * Modal view types representing different UI states
 *
 * @remarks
 * Defines the possible views that can be displayed in the modal.
 * The modal controller manages transitions between these views based on user actions and connection state.
 *
 * @public
 * @example
 * ```typescript
 * function renderModalContent(view: ModalView) {
 *   switch (view) {
 *     case 'walletSelection':
 *       return <WalletList />;
 *     case 'connecting':
 *       return <ConnectingSpinner />;
 *     case 'connected':
 *       return <AccountInfo />;
 *     case 'error':
 *       return <ErrorMessage />;
 *     case 'switchingChain':
 *       return <ChainSwitchProgress />;
 *     case 'proving':
 *       return <ProvingProgress />;
 *   }
 * }
 * ```
 */
export type ModalView =
  /** Initial view showing available wallets */
  | 'walletSelection'
  /** Loading view while connecting to a wallet */
  | 'connecting'
  /** Success view showing connection details */
  | 'connected'
  /** Error view displaying connection failures */
  | 'error'
  /** Loading view while switching blockchain networks */
  | 'switchingChain'
  /** Loading view while generating zero-knowledge proof (Aztec) */
  | 'proving';

/**
 * Basic modal UI state interface
 *
 * @remarks
 * Represents the UI state of the modal including visibility,
 * current view, and loading states. This is extended by more
 * specific modal state interfaces.
 *
 * @public
 * @example
 * ```typescript
 * const modalState: BaseModalState = {
 *   isOpen: true,
 *   currentView: 'walletSelection',
 *   isLoading: false
 * };
 *
 * // Show loading state
 * modalState.isLoading = true;
 * modalState.currentView = 'connecting';
 * ```
 */
export interface BaseModalState {
  /** Whether the modal is currently visible */
  isOpen: boolean;

  /** Current view being displayed in the modal */
  currentView: ModalView;

  /** Whether a loading operation is in progress */
  isLoading: boolean;
}

/**
 * Transport types enum for wallet communication mechanisms
 *
 * @remarks
 * Defines the different ways the modal can communicate with wallet implementations.
 * Each transport type has specific configuration requirements and use cases.
 *
 * @public
 * @enum {string}
 * @example
 * ```typescript
 * const transport = createTransport(TransportType.Popup, {
 *   url: 'https://wallet.example.com',
 *   width: 400,
 *   height: 600
 * });
 * ```
 */
export enum TransportType {
  /** Popup window transport for web wallets */
  Popup = 'popup',

  /** Browser extension transport (Chrome, Firefox, etc.) */
  Extension = 'extension',

  /** WebSocket transport for real-time communication */
  WebSocket = 'websocket',

  /** Injected provider transport (e.g., window.ethereum) */
  Injected = 'injected',

  /** IFrame transport for embedded wallets */
  Iframe = 'iframe',
}

/**
 * Connection state enum for simplified wallet lifecycle tracking
 *
 * @remarks
 * A simplified version of ConnectionStatus used in some UI contexts.
 * Includes an additional 'disconnecting' state for better UX during disconnection.
 *
 * @public
 * @enum {string}
 * @example
 * ```typescript
 * function getConnectionMessage(state: ConnectionState): string {
 *   switch (state) {
 *     case ConnectionState.Disconnected:
 *       return 'No wallet connected';
 *     case ConnectionState.Connecting:
 *       return 'Connecting wallet...';
 *     case ConnectionState.Connected:
 *       return 'Wallet connected';
 *     case ConnectionState.Disconnecting:
 *       return 'Disconnecting wallet...';
 *     case ConnectionState.Error:
 *       return 'Connection failed';
 *   }
 * }
 * ```
 */
export enum ConnectionState {
  /** No active connection */
  Disconnected = 'disconnected',

  /** Connection attempt in progress */
  Connecting = 'connecting',

  /** Successfully connected */
  Connected = 'connected',

  /** Disconnection in progress */
  Disconnecting = 'disconnecting',

  /** Connection error occurred */
  Error = 'error',
}

/**
 * Supported chain configuration type
 *
 * @remarks
 * Configuration for a single blockchain network that a dApp can support.
 * Contains all necessary metadata for wallet compatibility checking and UI display.
 *
 * This type is imported from the schema definition to ensure consistency
 * across the codebase. The schema provides runtime validation while this
 * type provides compile-time type safety.
 *
 * @public
 * @example
 * ```typescript
 * const ethereumMainnet: SupportedChain = {
 *   chainId: 'eip155:1',
 *   chainType: ChainType.Evm,
 *   name: 'Ethereum Mainnet',
 *   required: true,
 *   interfaces: ['eip1193'],
 *   group: 'ethereum'
 * };
 * ```
 */
export type SupportedChain = import('../schemas/chains.js').SupportedChain;

/**
 * Connection result interface returned after successful wallet connection
 *
 * @remarks
 * Contains all information about a successful wallet connection including
 * account details, chain information, and provider instance for blockchain interactions.
 *
 * @public
 * @example
 * ```typescript
 * const result: ConnectionResult = await modal.connect('metamask');
 *
 * console.log('Connected to:', result.walletInfo.name);
 * console.log('Address:', result.address);
 * console.log('Chain:', result.chain.name);
 *
 * // Use the provider for blockchain operations
 * const balance = await result.provider.getBalance(result.address);
 * ```
 */
export interface ConnectionResult {
  /** Primary account address */
  address: string;

  /** Array of all available account addresses */
  accounts: string[];

  /** Connected blockchain chain information */
  chain: SupportedChain;

  /** Provider instance for blockchain interactions (type depends on chainType) */
  provider: unknown;

  /** ID of the connected wallet */
  walletId: string;

  /** Complete wallet information including metadata */
  walletInfo: WalletInfo;
}

// Re-export ModalError from schemas to ensure consistency with runtime validation
export type { ModalError } from '../schemas/errors.js';
