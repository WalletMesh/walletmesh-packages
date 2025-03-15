/**
 * @packageDocumentation
 * Type definitions for the WalletMesh client module.
 */

import type { ConnectorConfig, WalletInfo, WalletState, ConnectedWallet, BaseConnector } from '../types.js';

/**
 * Connector interface for wallet interaction.
 */
export interface Connector extends BaseConnector {
  connect(walletInfo: WalletInfo): Promise<ConnectedWallet>;
  resume(walletInfo: WalletInfo, state: WalletState): Promise<ConnectedWallet>;
}

/**
 * Connector factory function type
 */
export type ConnectorFactory = (config: ConnectorConfig) => Connector;
