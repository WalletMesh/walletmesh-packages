/**
 * Service registry for WalletMesh
 *
 * Central registry for managing all business logic services.
 * Refactored to include new focused services.
 *
 * @module registries/ServiceRegistry
 * @category Core
 */

import type { QueryClientConfig } from '@tanstack/query-core';
import type { StoreApi } from 'zustand';
import { BalanceService } from '../../services/balance/BalanceService.js';
import type { BalanceServiceDependencies } from '../../services/balance/BalanceService.js';
import { ChainService } from '../../services/chain/ChainService.js';
import type { ChainServiceDependencies } from '../../services/chain/ChainService.js';
import type { ChainInfo } from '../../services/chain/types.js';
import {
  type ChainServiceRegistry,
  type ChainServiceRegistryConfig,
  createChainServiceRegistry,
} from '../../services/chains/ChainServiceRegistry.js';
import { ConnectionService } from '../../services/connection/ConnectionService.js';
import type { ConnectionServiceDependencies } from '../../services/connection/ConnectionService.js';
import { DAppRpcService } from '../../services/dapp-rpc/dAppRpcService.js';
import type { DAppRpcServiceDependencies } from '../../services/dapp-rpc/dAppRpcService.js';
import { HealthService } from '../../services/health/HealthService.js';
import type { HealthServiceDependencies } from '../../services/health/HealthService.js';
import { WalletPreferenceService } from '../../services/preferences/WalletPreferenceService.js';
import type { WalletPreferenceServiceDependencies } from '../../services/preferences/WalletPreferenceService.js';
import { QueryManager } from '../../services/query/QueryManager.js';
import type { QueryManagerDependencies } from '../../services/query/QueryManager.js';
import { SessionService } from '../../services/session/SessionService.js';
import type { SessionServiceDependencies } from '../../services/session/SessionService.js';
import { TransactionService } from '../../services/transaction/TransactionService.js';
import type { TransactionServiceDependencies } from '../../services/transaction/TransactionService.js';
import { UIService } from '../../services/ui/UiService.js';
import type { UIServiceDependencies } from '../../services/ui/UiService.js';
import type { WalletMeshState } from '../../state/store.js';
import { getWalletMeshStore } from '../../state/store.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { Logger } from '../core/logger/logger.js';

/**
 * Configuration for service initialization
 */
export interface ServicesConfig {
  logger?: Logger;
  store?: StoreApi<WalletMeshState>;
  chainServiceConfig?: ChainServiceRegistryConfig;
  queryConfig?: QueryClientConfig;
  chains?: ChainInfo[];
}

/**
 * Registry for managing business logic services
 *
 * Services are stateless and provide pure business logic.
 * State coordination is handled by the WalletMeshClient.
 *
 * Refactored architecture (9 focused services):
 * - ConnectionService: Handles connection/disconnection lifecycle only
 * - SessionService: Manages sessions and accounts
 * - HealthService: Monitors health and provides recovery
 * - UIService: Manages UI state and display logic
 * - PreferenceService: Handles user preferences
 * - ChainService: Manages chains and switching
 * - TransactionService: Handles transactions
 * - BalanceService: Manages balance queries
 * - DAppRpcService: Handles dApp RPC communication
 */
export class ServiceRegistry {
  private services = new Map<string, unknown>();
  private chainServiceRegistry?: ChainServiceRegistry;
  private queryManager?: QueryManager;
  private logger: Logger;
  private store: StoreApi<WalletMeshState>;
  private initialized = false;

  constructor(logger: Logger, store?: StoreApi<WalletMeshState>) {
    this.logger = logger;
    this.store = store || getWalletMeshStore();
  }

  /**
   * Initialize all services with the provided configuration
   */
  async initialize(config: ServicesConfig = {}): Promise<void> {
    if (this.initialized) {
      this.logger.debug('ServiceRegistry already initialized');
      return;
    }

    const logger = config.logger || this.logger;

    // Use provided store or default
    if (config.store) {
      this.store = config.store;
    }

    try {
      // Initialize QueryManager first
      const queryManagerDependencies: QueryManagerDependencies = {
        logger,
        ...(config.queryConfig && { queryConfig: config.queryConfig }),
      };
      this.queryManager = new QueryManager(queryManagerDependencies);

      // Initialize chain service registry
      this.chainServiceRegistry = createChainServiceRegistry(logger, config.chainServiceConfig);
      await this.chainServiceRegistry.initialize();

      // Create base services first (no dependencies on other services)
      const sessionDependencies: SessionServiceDependencies = {
        logger,
        store: this.store,
      };
      const sessionService = new SessionService(sessionDependencies);

      const healthDependencies: HealthServiceDependencies = { logger };
      const healthService = new HealthService(healthDependencies);

      const preferenceDependencies: WalletPreferenceServiceDependencies = { logger };
      const preferenceService = new WalletPreferenceService(preferenceDependencies);

      const chainDependencies: ChainServiceDependencies = { logger };
      const chainConfig = config.chains ? { chains: config.chains } : undefined;
      const chainService = new ChainService(chainDependencies, chainConfig);

      const uiDependencies: UIServiceDependencies = {
        logger,
        store: this.store,
      };
      const uiService = new UIService(uiDependencies);

      // Create services with dependencies on other services
      const connectionDependencies: ConnectionServiceDependencies = {
        logger,
        sessionService,
        healthService,
        uiService,
        preferenceService,
      };

      const transactionDependencies: TransactionServiceDependencies = {
        logger,
      };

      const balanceDependencies: BalanceServiceDependencies = {
        logger,
        chainServiceRegistry: this.chainServiceRegistry,
      };

      const dappRpcDependencies: DAppRpcServiceDependencies = {
        logger,
      };

      // Register all services
      this.services.set('session', sessionService);
      this.services.set('health', healthService);
      this.services.set('preference', preferenceService);
      this.services.set('chain', chainService);
      this.services.set('ui', uiService);
      this.services.set('connection', new ConnectionService(connectionDependencies));
      this.services.set('transaction', new TransactionService(transactionDependencies));
      this.services.set('balance', new BalanceService(balanceDependencies));
      this.services.set('dappRpc', new DAppRpcService(dappRpcDependencies));

      this.initialized = true;
      this.logger.info('ServiceRegistry initialized with 9 focused services');
    } catch (error) {
      this.logger.error('Failed to initialize ServiceRegistry', error);
      throw error;
    }
  }

  /**
   * Get a service by name
   */
  get<T>(name: string): T {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('ServiceRegistry not initialized');
    }

    const service = this.services.get(name);
    if (!service) {
      throw ErrorFactory.notFound(`Service ${name} not found`);
    }

    return service as T;
  }

  /**
   * Check if a service exists
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Dispose all services and cleanup resources
   */
  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    // Dispose services in reverse order of dependencies
    const disposalOrder = [
      'connection', // Depends on other services
      'transaction',
      'balance',
      'dappRpc',
      'ui',
      'chain',
      'preference',
      'health',
      'session',
    ];

    for (const serviceName of disposalOrder) {
      const service = this.services.get(serviceName);
      if (service) {
        try {
          // Services are mostly stateless, so disposal is minimal
          this.logger.debug(`Disposed service: ${serviceName}`);
        } catch (error) {
          this.logger.error(`Failed to dispose service ${serviceName}:`, error);
        }
      }
    }

    // Dispose chain service registry
    if (this.chainServiceRegistry) {
      try {
        await this.chainServiceRegistry.dispose();
      } catch (error) {
        this.logger.error('Failed to dispose chain service registry:', error);
      }
    }

    // Dispose query manager
    if (this.queryManager) {
      try {
        this.queryManager.cleanup();
      } catch (error) {
        this.logger.error('Failed to dispose query manager:', error);
      }
    }

    this.services.clear();
    this.initialized = false;
    this.logger.info('ServiceRegistry disposed');
  }

  /**
   * Get typed service instances for easy access
   */
  getServices() {
    if (!this.initialized) {
      throw ErrorFactory.configurationError('ServiceRegistry not initialized');
    }

    return {
      // Core connection services
      connection: this.get<ConnectionService>('connection'),
      session: this.get<SessionService>('session'),
      health: this.get<HealthService>('health'),
      ui: this.get<UIService>('ui'),
      preference: this.get<WalletPreferenceService>('preference'),

      // Blockchain services
      chain: this.get<ChainService>('chain'),
      transaction: this.get<TransactionService>('transaction'),
      balance: this.get<BalanceService>('balance'),

      // Communication
      dappRpc: this.get<DAppRpcService>('dappRpc'),
    };
  }

  /**
   * Get the store instance
   */
  getStore(): StoreApi<WalletMeshState> {
    return this.store;
  }

  /**
   * Get service statistics
   */
  getServiceStats(): {
    totalServices: number;
    serviceNames: string[];
    initialized: boolean;
  } {
    return {
      totalServices: this.services.size,
      serviceNames: this.getServiceNames(),
      initialized: this.initialized,
    };
  }

  /**
   * Get query manager instance
   */
  getQueryManager(): QueryManager | undefined {
    return this.queryManager;
  }
}
