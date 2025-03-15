/**
 * @packageDocumentation
 * Connector creation functionality for WalletMesh.
 */

import type { ConnectorConfig } from '../types.js';
import type { Connector, ConnectorFactory } from './types.js';

// Registry of connector factories
const connectorRegistry = new Map<string, ConnectorFactory>();

/**
 * Registers a connector factory for a specific connector type
 */
export function registerConnector(type: string, factory: ConnectorFactory): void {
  connectorRegistry.set(type, factory);
}

/**
 * Creates a connector instance from a configuration
 */
export function createConnector(config: ConnectorConfig): Connector {
  const factory = connectorRegistry.get(config.type);
  if (!factory) {
    throw new Error(`No connector factory registered for type: ${config.type}`);
  }

  return factory(config);
}

/**
 * Clears all registered connector factories
 * Primarily used for testing
 */
export function clearConnectorRegistry(): void {
  connectorRegistry.clear();
}
