/**
 * Internal hook for standardized service access
 *
 * Provides a consistent pattern for accessing modal-core services with:
 * - Automatic null checks
 * - TypeScript type safety
 * - Proper error handling
 * - Service availability detection
 *
 * @internal
 */

import type {
  BalanceService,
  ChainService,
  ConnectionService,
  TransactionService,
} from '@walletmesh/modal-core';
import { ErrorFactory } from '@walletmesh/modal-core';
import { useMemo } from 'react';
import { useWalletMeshServices } from '../../WalletMeshContext.js';
import { createComponentLogger } from '../../utils/logger.js';

/**
 * Service types available through useService hook
 */
export type ServiceType = 'transaction' | 'balance' | 'chain' | 'connection';

/**
 * Map service types to their corresponding service interfaces
 */
interface ServiceTypeMap {
  transaction: TransactionService;
  balance: BalanceService;
  chain: ChainService;
  connection: ConnectionService;
}

/**
 * Hook result with service instance and availability status
 */
export interface UseServiceReturn<T extends ServiceType> {
  service: ServiceTypeMap[T] | null;
  isAvailable: boolean;
}

/**
 * Hook for standardized service access
 *
 * @param serviceType - The type of service to access
 * @param componentName - Name of the component using the service (for logging)
 * @returns Service instance and availability status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { service: chainService, isAvailable } = useService('chain', 'MyComponent');
 *
 *   if (!isAvailable) {
 *     return <div>Service not available</div>;
 *   }
 *
 *   // Use chainService safely
 *   const chains = chainService.getSupportedChains();
 * }
 * ```
 *
 * @internal
 */
export function useService<T extends ServiceType>(
  serviceType: T,
  componentName: string,
): UseServiceReturn<T> {
  const services = useWalletMeshServices();
  const logger = useMemo(() => createComponentLogger(`${componentName}:useService`), [componentName]);

  return useMemo(() => {
    if (!services) {
      logger.debug(`Services not available for ${serviceType}`);
      return { service: null, isAvailable: false };
    }

    const service = services[serviceType as keyof typeof services];
    if (!service) {
      logger.warn(`Service '${serviceType}' not found in services`);
      return { service: null, isAvailable: false };
    }

    return {
      service: service as ServiceTypeMap[T],
      isAvailable: true,
    };
  }, [services, serviceType, logger]);
}

/**
 * Hook that throws if service is not available
 *
 * Use this variant when the service is required for the component to function.
 * It will throw an error if the service is not available, making it clear
 * that the component cannot work without the service.
 *
 * @param serviceType - The type of service to access
 * @param componentName - Name of the component using the service
 * @returns The service instance (never null)
 * @throws Error if service is not available
 *
 * @example
 * ```tsx
 * function TransactionComponent() {
 *   const transactionService = useRequiredService('transaction', 'TransactionComponent');
 *
 *   // Service is guaranteed to be available here
 *   const sendTransaction = async (tx: TransactionRequest) => {
 *     return await transactionService.sendTransaction(tx);
 *   };
 * }
 * ```
 *
 * @internal
 */
export function useRequiredService<T extends ServiceType>(
  serviceType: T,
  componentName: string,
): ServiceTypeMap[T] {
  const { service, isAvailable } = useService(serviceType, componentName);

  if (!isAvailable || !service) {
    throw ErrorFactory.configurationError(
      `Required service '${serviceType}' is not available. ` +
        `Ensure ${componentName} is wrapped in WalletMeshProvider and services are initialized.`,
    );
  }

  return service;
}
