/**
 * @packageDocumentation
 * Type definitions for the WalletMesh client module.
 */

import type {
  WalletConnectorConfig,
  WalletInfo,
  WalletState,
  ConnectedWallet,
  Connector as BaseConnector,
} from '../types.js';

/**
 * Connector interface for wallet interaction.
 */
export interface Connector extends Omit<BaseConnector, 'connect'> {
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;
  resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet>;
}

/**
 * Connector factory function type
 */
export type ConnectorFactory = (config: WalletConnectorConfig) => Connector;
