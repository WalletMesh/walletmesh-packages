import type { Adapter, Connector, WalletInfo } from '../../types.js';
import { ConnectorType } from '../../types.js';
import { WebWalletConnector } from './WebWalletConnector.js';
import { ExtensionWalletConnector } from './ExtensionWalletConnector.js';

/**
 * Creates a connector based on the wallet's connector type.
 * @param adapter - The adapter instance.
 * @param wallet - The wallet information.
 * @returns The created connector.
 * @throws Will throw an error if the connector type is unsupported.
 */
export function createConnector(adapter: Adapter, wallet: WalletInfo): Connector {
  switch (wallet.connectorType) {
    case ConnectorType.WebWallet:
      return new WebWalletConnector(adapter, wallet.connectorOptions);
    case ConnectorType.Extension:
      return new ExtensionWalletConnector(adapter, wallet.connectorOptions);
    default:
      throw new Error(`Unsupported connector type: ${wallet.connectorType}`);
  }
}
