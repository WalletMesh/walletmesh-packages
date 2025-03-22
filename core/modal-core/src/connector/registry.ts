/**
 * @packageDocumentation
 * Connector registry implementation.
 */

import { MockConnector, type MockConnectorConfig } from './mock.js';
import type { Connector } from '../types.js';
import { createConnectorError } from './errors.js';

/** Connector creator function type */
export type ConnectorCreator = (config: MockConnectorConfig) => Connector;

/**
 * Validates a connector type string
 */
const validateType = (type: string): void => {
  if (!type || type.trim() === '') {
    throw createConnectorError.invalidType(type);
  }
};

/**
 * Validates a connector configuration
 */
const validateConfig = (config: MockConnectorConfig): void => {
  if (!config || typeof config !== 'object') {
    throw createConnectorError.invalidConfig('Configuration must be a valid object');
  }
};

/**
 * Connector registry class
 */
export class ConnectorRegistry {
  private connectors: Map<string, ConnectorCreator>;

  constructor() {
    this.connectors = new Map();
  }

  /**
   * Registers a new connector type
   * @param type - Connector type identifier
   * @param creator - Connector creator function
   */
  public register(type: string, creator: ConnectorCreator): void {
    validateType(type);

    if (typeof creator !== 'function') {
      throw createConnectorError.invalidCreator();
    }

    this.connectors.set(type, creator);
  }

  /**
   * Unregisters a connector type
   * @param type - Connector type identifier
   */
  public unregister(type: string): void {
    validateType(type);
    this.connectors.delete(type);
  }

  /**
   * Checks if a connector type is registered
   * @param type - Connector type identifier
   */
  public hasType(type: string): boolean {
    // Return false for invalid types without throwing
    if (!type || type.trim() === '') {
      return false;
    }
    return this.connectors.has(type);
  }

  /**
   * Gets list of registered connector types
   */
  public getTypes(): string[] {
    return Array.from(this.connectors.keys());
  }

  /**
   * Creates a new connector instance
   * @param config - Connector configuration
   */
  public create(config: MockConnectorConfig & { type: string }): Connector {
    validateConfig(config);

    const creator = this.connectors.get(config.type);
    if (!creator) {
      throw createConnectorError.notRegistered(config.type);
    }

    try {
      return creator(config);
    } catch (error) {
      // Wrap non-ConnectorError instances with a general connector error
      throw error instanceof Error
        ? createConnectorError.error(error.message, { cause: error })
        : createConnectorError.error(String(error));
    }
  }

  /**
   * Clears all connector registrations
   */
  public clear(): void {
    this.connectors.clear();
  }
}

/**
 * Default connector registry instance
 */
export const connectorRegistry = new ConnectorRegistry();

// Register default connectors
connectorRegistry.register('mock', (config: MockConnectorConfig) => new MockConnector(config));
