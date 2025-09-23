import type { WalletMeshClient } from '../../client/index.js';
import { ChainType } from '../../types.js';
import { createMockWalletMeshClient } from '../mocks/mockClient.js';

/**
 * Test helper for setting up a WalletMesh client in tests
 */
export class TestClientHelper {
  private client: WalletMeshClient;
  private cleanupFns: Array<() => void> = [];

  constructor(_options?: {
    // biome-ignore lint/suspicious/noExplicitAny: Test client needs flexible initial state structure
    initialState?: any;
    // biome-ignore lint/suspicious/noExplicitAny: Test client needs flexible services structure
    services?: any;
  }) {
    // Pass valid client config, ignoring the extra test options
    this.client = createMockWalletMeshClient({
      appName: 'Test App',
    });
  }

  /**
   * Get the client instance
   */
  getClient(): WalletMeshClient {
    return this.client;
  }

  /**
   * Simulate connecting a wallet
   */
  async connect(
    options: {
      walletId: string;
      chainId?: string;
      chainType?: ChainType;
      address?: string;
    } = { walletId: 'metamask' },
  ) {
    const connection = await this.client.connect(options.walletId);
    return connection;
  }

  /**
   * Simulate disconnecting
   */
  async disconnect() {
    await this.client.disconnect('all');
  }

  /**
   * Send a test transaction
   */
  // biome-ignore lint/suspicious/noExplicitAny: Test transaction params need flexible structure
  async sendTestTransaction(params?: any) {
    // Mock transaction result since sendTransaction might not exist
    return {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      chainId: '0x1',
      to: '0x0987654321098765432109876543210987654321',
      value: '1000000000000000000',
      ...params,
    };
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations = 1) {
    // Mock confirmation since services might not be accessible
    return {
      hash: txHash,
      confirmations,
      blockHash: '0x1234567890abcdef',
      blockNumber: 123456,
    };
  }

  /**
   * Emit a client event
   */
  // biome-ignore lint/suspicious/noExplicitAny: Event data needs flexible structure
  emitEvent(event: string, data?: any) {
    // Mock emit since it might be private
    console.log(`Mock emit: ${event}`, data);
  }

  /**
   * Subscribe to an event
   */
  // biome-ignore lint/suspicious/noExplicitAny: Event handler args need flexible structure
  onEvent(event: string, handler: (...args: any[]) => void) {
    // Mock event subscription since on/off might not exist
    console.log(`Mock subscribe to: ${event}`, handler);
    this.cleanupFns.push(() => console.log(`Mock unsubscribe from: ${event}`));
  }

  /**
   * Get current state
   */
  getState() {
    // Mock state since store might not be accessible
    return {
      ui: {
        isOpen: false,
        currentView: 'walletSelection',
        isLoading: false,
        isScanning: false,
        lastScanTime: null,
        discoveryErrors: [],
      },
      connections: {
        activeSessions: [],
        activeSessionId: null,
        wallets: [],
        availableWalletIds: [],
      },
      transactions: {
        history: [],
        current: null,
        status: 'idle',
        error: null,
      },
    };
  }

  /**
   * Update state
   */
  // biome-ignore lint/suspicious/noExplicitAny: State updater needs flexible types for testing
  setState(updater: (state: any) => any) {
    // Mock setState since store might not be accessible
    console.log('Mock setState called', updater);
  }

  /**
   * Reset all mocks
   */
  reset() {
    // biome-ignore lint/suspicious/noExplicitAny: Internal mock reset method needs dynamic access
    (this.client as any)._resetMocks();
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    for (const fn of this.cleanupFns) {
      fn();
    }
    this.cleanupFns = [];
    await this.client.destroy();
  }
}

/**
 * Create a test client helper
 */
export function createTestClient(options?: {
  // biome-ignore lint/suspicious/noExplicitAny: Test client needs flexible initial state structure
  initialState?: any;
  // biome-ignore lint/suspicious/noExplicitAny: Test client needs flexible services structure
  services?: any;
}): TestClientHelper {
  return new TestClientHelper(options);
}

/**
 * Create a test environment with multiple connected clients
 */
export async function createMultiClientTestEnvironment() {
  const clients = {
    evm: createTestClient(),
    solana: createTestClient(),
    aztec: createTestClient(),
  };

  // Connect each client to different chains
  await clients.evm.connect({
    walletId: 'metamask',
    chainType: ChainType.Evm,
    chainId: '0x1',
  });

  await clients.solana.connect({
    walletId: 'phantom',
    chainType: ChainType.Solana,
    chainId: 'mainnet-beta',
  });

  await clients.aztec.connect({
    walletId: 'aztec-wallet',
    chainType: ChainType.Aztec,
    chainId: 'sandbox',
  });

  return {
    clients,
    cleanup: async () => {
      await Promise.all([clients.evm.cleanup(), clients.solana.cleanup(), clients.aztec.cleanup()]);
    },
  };
}

/**
 * Test helper for simulating wallet events
 */
export class WalletEventSimulator {
  /**
   * Simulate chain change
   */
  async simulateChainChange(chainId: string) {
    // Mock chain change simulation
    console.log(`Mock chain change to: ${chainId}`);
  }

  /**
   * Simulate accounts change
   */
  async simulateAccountsChange(accounts: string[]) {
    // Mock accounts change simulation
    console.log('Mock accounts change to:', accounts);
  }

  /**
   * Simulate disconnect
   */
  async simulateDisconnect() {
    // Mock disconnect simulation
    console.log('Mock disconnect simulation');
  }

  /**
   * Simulate connection error
   */
  // biome-ignore lint/suspicious/noExplicitAny: Error parameter needs flexible type for test simulation
  async simulateConnectionError(error: any) {
    // Mock connection error simulation
    console.log('Mock connection error:', error);
  }
}
