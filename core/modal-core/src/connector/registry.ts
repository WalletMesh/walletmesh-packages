/**
 * @packageDocumentation
 * Connector registry implementation for WalletMesh Core.
 */

import type { ConnectorImplementationConfig } from '../types.js';
import type { Connector } from '../types.js';
import { MockConnector } from './mock.js';

/**
 * Factory function type for creating connectors.
 */
type ConnectorCreator = (config: ConnectorImplementationConfig) => Connector;

/**
 * Registry of available connector implementations.
 */
class ConnectorRegistry {
  private creators = new Map<string, ConnectorCreator>();

  /**
   * Registers a new connector implementation.
   * @param type - The connector type
   * @param creator - Factory function to create connector instances
   */
  register(type: string, creator: ConnectorCreator): void {
    if (this.creators.has(type)) {
      throw new Error(`Connector type '${type}' is already registered`);
    }
    this.creators.set(type, creator);
  }

  /**
   * Creates a new connector instance.
   * @param config - Connector configuration
   * @returns New connector instance
   */
  create(config: ConnectorImplementationConfig): Connector {
    const creator = this.creators.get(config.type);
    if (!creator) {
      throw new Error(`No connector registered for type '${config.type}'`);
    }
    return creator(config);
  }

  /**
   * Gets all registered connector types.
   */
  getTypes(): string[] {
    return Array.from(this.creators.keys());
  }

  /**
   * Checks if a connector type is registered.
   */
  hasType(type: string): boolean {
    return this.creators.has(type);
  }

  /**
   * Removes a registered connector type.
   */
  unregister(type: string): void {
    this.creators.delete(type);
  }

  /**
   * Removes all registered connectors.
   */
  clear(): void {
    this.creators.clear();
  }
}

/**
 * Default connector registry instance.
 */
export const connectorRegistry = new ConnectorRegistry();

// Register built-in connectors
connectorRegistry.register('mock', (config) => new MockConnector(config.options));

export { ConnectorRegistry };
