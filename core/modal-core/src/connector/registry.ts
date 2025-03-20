/**
 * @packageDocumentation
 * Connector registry implementation.
 */

import { MockConnector } from './MockConnector.js';
import type { Connector, ConnectorImplementationConfig } from '../types.js';

/** Connector creator function type */
type ConnectorCreator = (config: ConnectorImplementationConfig) => Connector;

/**
 * Validates a connector type string
 */
const validateType = (type: string): void => {
  if (!type || type.trim() === '') {
    throw new Error('Invalid connector type');
  }
};

/**
 * Validates a connector configuration
 */
const validateConfig = (config: ConnectorImplementationConfig): void => {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid config object');
  }

  validateType(config.type);

  if (!config.name || config.name.trim() === '') {
    throw new Error('Invalid connector name');
  }

  if (typeof config.factory !== 'function') {
    throw new Error('Factory function is required');
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
      throw new Error('Creator must be a function');
    }

    if (this.connectors.has(type)) {
      throw new Error(`Connector type '${type}' is already registered`);
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
   * @param config - Connector implementation config
   */
  public create(config: ConnectorImplementationConfig): Connector {
    // Validate config before checking registration
    validateConfig(config);

    const creator = this.connectors.get(config.type);
    if (!creator) {
      throw new Error(`No connector registered for type '${config.type}'`);
    }

    try {
      return creator(config);
    } catch (error) {
      // Re-throw creator errors directly
      throw error instanceof Error ? error : new Error(String(error));
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
connectorRegistry.register('mock', (config: ConnectorImplementationConfig) => new MockConnector(config));
