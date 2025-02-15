import type { ConnectorConfig, Connector, AztecConnectorOptions } from './types.js';
import { ConnectorType } from './types.js';
import { ObsidionAztecConnector } from './obsidion/ObsidionAztecConnector.js';
import { FakeAztecConnector } from './fake/FakeAztecConnector.js';
import { WalletError } from '../client/types.js';

/**
 * Factory function that creates an appropriate wallet connector instance based on configuration.
 *
 * Instantiates protocol-specific connectors that handle the communication between
 * the dApp and different wallet implementations. The factory determines which connector
 * to create based on the provided configuration type.
 *
 * @param config - The connector configuration object
 * @returns An initialized connector instance that implements the Connector interface
 * @throws {WalletError} If the specified connector type is not supported
 *
 * @example
 * ```typescript
 * // Create a WalletMesh Aztec connector
 * const aztecConnector = createConnector({
 *   type: ConnectorType.WalletMeshAztec,
 *   options: {
 *     chainId: 'aztec:testnet',
 *     rpcUrl: 'https://api.aztec.network/testnet',
 *     networkId: '11155111'
 *   }
 * });
 *
 * // Create an Obsidion Aztec connector
 * const obsidionConnector = createConnector({
 *   type: ConnectorType.ObsidionAztec,
 *   options: {
 *     chainId: 'aztec:mainnet'
 *   }
 * });
 * ```
 *
 * @remarks
 * Currently supported connector types:
 * - WalletMeshAztec: Standard connector for Aztec protocol wallets
 * - ObsidionAztec: Specialized connector for Obsidion wallet implementation
 *
 * Each connector type may require specific configuration options as defined
 * in their respective interfaces (e.g., AztecConnectorOptions).
 */
export function createConnector(config: ConnectorConfig): Connector {
  console.log('[createConnector] Creating connector with config:', config);

  switch (config.type) {
    case ConnectorType.ObsidionAztec: {
      console.log('[createConnector] Creating ObsidionAztecConnector with options:', config.options);
      const connector = new ObsidionAztecConnector(config.options as AztecConnectorOptions);
      console.log('[createConnector] Created connector:', connector);
      return connector;
    }
    case ConnectorType.FakeAztec: {
      console.log('[createConnector] Creating FakeAztecConnector with options:', config.options);
      const connector = new FakeAztecConnector(config.options as AztecConnectorOptions);
      console.log('[createConnector] Created connector:', connector);
      return connector;
    }
    default:
      console.error('[createConnector] Unsupported connector type:', config.type);
      throw new WalletError(`Unsupported connector type: ${config.type}`, 'connector');
  }
}
