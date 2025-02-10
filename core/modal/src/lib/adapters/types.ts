import type { WalletInfo, ConnectedWallet } from '../../types.js';

/**
 * Interface for chain-specific adapters
 */
export interface Adapter<TOptions extends BaseAdapterOptions = BaseAdapterOptions> {
  /** Connects to the wallet and returns connected wallet information */
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;
  
  /** Disconnects from the wallet and cleans up */
  disconnect(): Promise<void>;
  
  /** Retrieves the chain-specific provider instance */
  getProvider(): Promise<unknown>;
  
  /** Handles incoming messages from the transport */
  handleMessage(data: unknown): void;
}

/**
 * Base adapter options
 */
export interface BaseAdapterOptions {
  /** Chain ID for the adapter */
  chainId?: string;
  /** Additional chain-specific options */
  [key: string]: unknown | undefined;
}

/**
 * Available adapter types
 */
export enum AdapterType {
  WalletMeshAztec = 'wm_aztec',
}

/**
 * Aztec-specific adapter options
 */
export interface AztecAdapterOptions extends BaseAdapterOptions {
  rpcUrl?: string;
  networkId?: string;
}

/**
 * Base adapter configuration
 */
export interface BaseAdapterConfig<T extends BaseAdapterOptions = BaseAdapterOptions> {
  type: AdapterType;
  options?: T;
}

/**
 * Type alias for all possible adapter configurations
 */
export type AdapterConfig =
  | BaseAdapterConfig
  | BaseAdapterConfig<AztecAdapterOptions>;

/**
 * Type helper to get options type for a given adapter type
 */
export type AdapterOptionsForType<T extends AdapterType> = 
  T extends AdapterType.WalletMeshAztec ? AztecAdapterOptions : BaseAdapterOptions;
