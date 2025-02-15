import type { WalletConnectorConfig } from '../types.js';

/**
 * Configuration options specific to the Fake connector.
 * These options are used for testing different scenarios.
 */
export interface FakeConnectorOptions {
  /** Network identifier */
  networkId?: string;
  /** Simulate a connection failure when true */
  shouldFail?: boolean;
  /** Add artificial delay in milliseconds to simulate network latency */
  responseDelay?: number;
  /** Override the randomly generated address with a specific one */
  customAddress?: string;
  /** Force a disconnect after establishing connection */
  forceDisconnect?: boolean;
}

/** Type-safe configuration for the Fake connector */
export type FakeConnectorConfig = WalletConnectorConfig<FakeConnectorOptions>;
