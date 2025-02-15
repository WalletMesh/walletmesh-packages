import { ConnectorType } from './types.js';
import type { WalletConnectorConfig, Connector, AztecConnectorOptions } from './types.js';
import { ObsidionAztecConnector } from './obsidion/ObsidionAztecConnector.js';
import { FakeAztecConnector } from './fake/index.js';
import type { FakeConnectorOptions } from './fake/index.js';
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
 * // Create a Fake connector for testing
 * const fakeConnector = createConnector({
 *   type: ConnectorType.FakeAztec,
 *   options: {
 *     networkId: 'aztec-fake',
 *     shouldFail: false,
 *     responseDelay: 500
 *   }
 * });
 *
 * // Create an Obsidion Aztec connector for production
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
 * - FakeAztec: Test connector with configurable behaviors
 * - ObsidionAztec: Production connector for Obsidion wallet
 *
 * Each connector type may require specific configuration options as defined
 * in their respective interfaces (e.g., FakeConnectorOptions, AztecConnectorOptions).
 */
export function createConnector(config: WalletConnectorConfig): Connector {
  console.log('[createConnector] Creating connector with config:', config);

  switch (config.type) {
    case ConnectorType.ObsidionAztec: {
      console.log('[createConnector] Creating ObsidionAztecConnector with options:', config.options);
      const connector = new ObsidionAztecConnector(config.options as AztecConnectorOptions);
      console.log('[createConnector] Created connector:', config.type);
      return connector;
    }
    case ConnectorType.FakeAztec: {
      console.log('[createConnector] Creating FakeAztecConnector with options:', config.options);
      const connector = new FakeAztecConnector(config.options as FakeConnectorOptions);
      console.log('[createConnector] Created connector:', config.type);
      return connector;
    }
    default:
      console.error('[createConnector] Unsupported connector type:', config.type);
      throw new WalletError(`Unsupported connector type: ${config.type}`, 'connector');
  }
}
