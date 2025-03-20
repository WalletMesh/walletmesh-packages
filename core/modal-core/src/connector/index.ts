/**
 * @packageDocumentation
 * Connector exports for WalletMesh Core.
 */

// Base connector implementation
export { BaseConnector } from './base.js';

// Mock connector for testing
export {
  MockConnector,
  type MockMessages,
} from './MockConnector.js';

// Connector registry
export {
  connectorRegistry,
  ConnectorRegistry,
} from './registry.js';

// Reexport core connector types
export type { Connector, ConnectorImplementationConfig } from '../types.js';
