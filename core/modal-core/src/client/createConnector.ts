/**
 * @packageDocumentation
 * Connector factory implementation
 */

import type { Connector, ConnectorFactory } from './types.js';
import type { WalletConnectorConfig } from '../types.js';

/**
 * Registry of connector factories
 */
const connectorFactories = new Map<string, ConnectorFactory>();

/**
 * Registers a connector factory
 */
export function registerConnector(type: string, factory: ConnectorFactory): void {
  connectorFactories.set(type, factory);
}

/**
 * Creates a connector instance
 */
export function createConnector(config: WalletConnectorConfig): Connector {
  const factory = connectorFactories.get(config.type);
  if (!factory) {
    throw new Error(`No connector factory registered for type: ${config.type}`);
  }

  return factory(config);
}

/**
 * Clears connector registry
 */
export function clearConnectorRegistry(): void {
  connectorFactories.clear();
}
