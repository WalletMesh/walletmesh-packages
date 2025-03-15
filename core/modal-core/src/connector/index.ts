/**
 * @packageDocumentation
 * Connector exports for WalletMesh Core.
 */

// Base connector implementation
export { BaseConnector } from './base.js';
export type { ConnectorMessages } from './base.js';

// Mock connector for testing
export {
  MockConnector,
  type MockProvider,
  type MockMessages,
  type MockConnectorConfig,
  defaultMockConnector,
} from './mock.js';

// Connector registry
export {
  connectorRegistry,
  ConnectorRegistry,
} from './registry.js';

// Reexport core connector types
export type { Connector, ConnectorImplementationConfig } from '../types.js';
