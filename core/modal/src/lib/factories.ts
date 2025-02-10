import { TransportType, type TransportConfig, type Transport } from './transports/types.js';
import { AdapterType, type AdapterConfig, type Adapter, type AztecAdapterOptions } from './adapters/types.js';
import { PostMessageTransport } from './transports/PostMessageTransport.js';
import { WalletMeshAztecAdapter } from './adapters/WalletMeshAztecAdapter.js';
import { WalletError } from './client/types.js';

/**
 * Creates a transport instance based on configuration
 */
export function createTransport(config: TransportConfig): Transport {
  switch (config.type) {
    case TransportType.PostMessage:
      return new PostMessageTransport(config.options);
    case TransportType.WebSocket:
      throw new WalletError(
        'WebSocket transport not implemented',
        'transport'
      );
    case TransportType.Extension:
      throw new WalletError(
        'Extension transport not implemented',
        'transport'
      );
    default:
      throw new WalletError(
        `Unsupported transport type: ${config.type}`,
        'transport'
      );
  }
}

/**
 * Creates an adapter instance based on configuration
 */
export function createAdapter<T extends AdapterConfig>(config: T): Adapter {
  switch (config.type) {
    case AdapterType.WalletMeshAztec:
      return new WalletMeshAztecAdapter(config.options as AztecAdapterOptions);
    default:
      throw new WalletError(
        `Unsupported adapter type: ${config.type}`,
        'adapter'
      );
  }
}

/**
 * Factory registry types
 */
type TransportFactory = (config: TransportConfig) => Transport;
type AdapterFactory = (config: AdapterConfig) => Adapter;

// Private factory registries
const transportFactories = new Map<TransportType, TransportFactory>();
const adapterFactories = new Map<AdapterType, AdapterFactory>();

/**
 * Registers a new transport type
 */
export function registerTransport(
  type: TransportType,
  factory: TransportFactory
): void {
  transportFactories.set(type, factory);
}

/**
 * Registers a new adapter type
 */
export function registerAdapter(
  type: AdapterType,
  factory: AdapterFactory
): void {
  adapterFactories.set(type, factory);
}

// Register built-in factories
transportFactories.set(TransportType.PostMessage, (config) => new PostMessageTransport(config.options));
adapterFactories.set(AdapterType.WalletMeshAztec, (config) => 
  new WalletMeshAztecAdapter(config.options as AztecAdapterOptions)
);
