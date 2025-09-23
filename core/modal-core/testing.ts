// Temporary file to export testing utilities until we fix the build

export * from './dist/testing/mocks/mockSession.js';
export * from './dist/testing/mocks/mockStore.js';
export * from './dist/testing/mocks/mockWallets.js';
export * from './dist/testing/mocks/mockProviders.js';
export * from './dist/testing/mocks/mockServices.js';
export * from './dist/testing/mocks/mockClient.js';
export * from './dist/testing/vitest/mockSetup.js';
export { DebugWallet } from './dist/internal/wallets/debug/DebugWallet.js';
export { MockTransport } from './dist/internal/wallets/debug/MockTransport.js';
export { AztecExampleWalletAdapter } from './dist/internal/wallets/aztec-example/AztecExampleWalletAdapter.js';
export { createTestModal } from './dist/api/core/testing.js';
export { createMockWalletInfo, createMockConnectionResult } from './dist/internal/testing/mocks.js';
export { createDebugLogger } from './dist/internal/core/logger/globalLogger.js';
export type { Logger } from './dist/internal/core/logger/logger.js';
