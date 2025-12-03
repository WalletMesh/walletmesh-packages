/**
 * Factory functions for creating components
 * @internal
 */

export * from './modalFactory.js';
// Adapter-based connector factory using the new adapter system
export {
  createConnector,
  getWalletsForChain,
  isWalletSupported,
  createTestConnector,
  createMockConnector,
  getWalletRegistry,
  registerAdapter,
  unregisterAdapter,
  getAllAdapters,
  clearRegistry,
  type TestConnectorConfig,
} from './adapterConnectorFactory.js';
// Transport factory exports moved to transport.js for simplification
export { createTransport } from './transport.js';
