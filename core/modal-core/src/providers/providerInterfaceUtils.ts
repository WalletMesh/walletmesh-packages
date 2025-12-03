/**
 * Provider/Interface Utility Functions
 *
 * This module provides developer-friendly utilities that demonstrate the
 * distinction between provider implementations (runtime objects) and
 * interface specifications (protocol standards).
 *
 * @module providers/providerInterfaceUtils
 * @packageDocumentation
 */

import type { ChainInterfaceMap, ProviderInterface } from './types/index.js';

import {
  getInterfaceSpecificationsByPriority,
  getInterfaceSpecificationsForTechnology,
  getTechnologyForInterface as getInterfaceTechnology,
  getProviderTypeForInterface,
  isAztecInterface,
  isEVMInterface,
  isProviderInterface,
  isSolanaInterface,
} from './interfaceResolution.js';

/**
 * Provider/Interface Utility Functions
 *
 * @remarks
 * These utilities help developers understand and work with the distinction
 * between provider implementations and interface specifications.
 */
export namespace ProviderInterfaceUtils {
  /**
   * Get the provider implementation class name for an interface specification
   *
   * @param interfaceSpec - The interface specification (e.g., 'eip-1193')
   * @returns The provider implementation class name (e.g., 'EvmProvider')
   *
   * @example
   * ```typescript
   * const providerClass = ProviderInterfaceUtils.getProviderForInterface('eip-1193');
   * console.log(providerClass); // 'EvmProvider'
   * ```
   */
  export function getProviderForInterface(interfaceSpec: ProviderInterface): string {
    return getProviderTypeForInterface(interfaceSpec);
  }

  /**
   * Get all interface specifications supported by a blockchain technology
   *
   * @param technology - The blockchain technology ('evm', 'solana', 'aztec')
   * @returns Array of interface specifications supported by the technology
   *
   * @example
   * ```typescript
   * const evmInterfaces = ProviderInterfaceUtils.getSupportedInterfaces('evm');
   * console.log(evmInterfaces); // ['eip-1193', 'eip-6963', 'eip-1102', 'web3-provider']
   * ```
   */
  export function getSupportedInterfaces<T extends keyof ChainInterfaceMap>(
    technology: T,
  ): ChainInterfaceMap[T][] {
    return getInterfaceSpecificationsForTechnology(technology);
  }

  /**
   * Get interface specifications sorted by priority (highest first)
   *
   * @param technology - The blockchain technology
   * @returns Interface specifications sorted by priority
   *
   * @example
   * ```typescript
   * const prioritized = ProviderInterfaceUtils.getInterfacesByPriority('evm');
   * console.log(prioritized); // ['eip-6963', 'eip-1193', 'eip-1102', 'web3-provider']
   * ```
   */
  export function getInterfacesByPriority<T extends keyof ChainInterfaceMap>(
    technology: T,
  ): ChainInterfaceMap[T][] {
    return getInterfaceSpecificationsByPriority(technology);
  }

  /**
   * Get the blockchain technology for an interface specification
   *
   * @param interfaceSpec - The interface specification
   * @returns The blockchain technology that uses this interface
   *
   * @example
   * ```typescript
   * const tech = ProviderInterfaceUtils.getTechnologyForInterface('eip-1193');
   * console.log(tech); // 'evm'
   * ```
   */
  export function getTechnologyForInterface(interfaceSpec: ProviderInterface): keyof ChainInterfaceMap {
    return getInterfaceTechnology(interfaceSpec);
  }

  /**
   * Validate that an interface specification is supported
   *
   * @param interfaceSpec - The interface specification to validate
   * @returns true if the interface is supported
   *
   * @example
   * ```typescript
   * const isValid = ProviderInterfaceUtils.isValidInterface('eip-1193');
   * console.log(isValid); // true
   * ```
   */
  export function isValidInterface(interfaceSpec: string): interfaceSpec is ProviderInterface {
    return isProviderInterface(interfaceSpec);
  }

  /**
   * Check if an interface specification belongs to a specific technology
   *
   * @param interfaceSpec - The interface specification
   * @param technology - The blockchain technology
   * @returns true if the interface belongs to the technology
   *
   * @example
   * ```typescript
   * const isEvmInterface = ProviderInterfaceUtils.isInterfaceForTechnology('eip-1193', 'evm');
   * console.log(isEvmInterface); // true
   * ```
   */
  export function isInterfaceForTechnology(
    interfaceSpec: string,
    technology: keyof ChainInterfaceMap,
  ): boolean {
    if (!isProviderInterface(interfaceSpec)) return false;

    try {
      return getInterfaceTechnology(interfaceSpec) === technology;
    } catch {
      return false;
    }
  }

  /**
   * Get recommended interface specifications for a technology
   *
   * @param technology - The blockchain technology
   * @param count - Number of recommendations to return (default: 2)
   * @returns Top recommended interface specifications
   *
   * @example
   * ```typescript
   * const recommended = ProviderInterfaceUtils.getRecommendedInterfaces('evm');
   * console.log(recommended); // ['eip-6963', 'eip-1193']
   * ```
   */
  export function getRecommendedInterfaces<T extends keyof ChainInterfaceMap>(
    technology: T,
    count = 2,
  ): ChainInterfaceMap[T][] {
    return getInterfaceSpecificationsByPriority(technology).slice(0, count);
  }

  /**
   * Check if interface specifications are compatible with each other
   *
   * @param interfaces - Array of interface specifications
   * @returns true if all interfaces belong to the same technology
   *
   * @example
   * ```typescript
   * const compatible = ProviderInterfaceUtils.areInterfacesCompatible(['eip-1193', 'eip-6963']);
   * console.log(compatible); // true (both are EVM interfaces)
   * ```
   */
  export function areInterfacesCompatible(interfaces: string[]): boolean {
    const validInterfaces = interfaces.filter(isProviderInterface);
    if (validInterfaces.length !== interfaces.length) return false;

    if (validInterfaces.length === 0) return true;

    const firstInterface = validInterfaces[0];
    if (!firstInterface) return true;

    const firstTechnology = getInterfaceTechnology(firstInterface);
    return validInterfaces.every((ifaceSpec) => {
      try {
        return getInterfaceTechnology(ifaceSpec) === firstTechnology;
      } catch {
        return false;
      }
    });
  }

  /**
   * Validate provider/interface compatibility configuration
   *
   * @param config - Configuration mapping technologies to interface arrays
   * @returns Validation result with any errors found
   *
   * @example
   * ```typescript
   * const result = ProviderInterfaceUtils.validateProviderInterfaceCompatibility({
   *   evm: ['eip-1193', 'eip-6963'],
   *   solana: ['solana-standard-wallet'],
   *   aztec: ['aztec-wallet-api-v1']
   * });
   * console.log(result.valid); // true
   * ```
   */
  export function validateProviderInterfaceCompatibility(config: Record<string, string[]>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [technology, interfaces] of Object.entries(config)) {
      // Check if technology is supported
      if (!['evm', 'solana', 'aztec'].includes(technology)) {
        errors.push(`Unknown blockchain technology: ${technology}`);
        continue;
      }

      const tech = technology as keyof ChainInterfaceMap;
      const supportedInterfaces = getSupportedInterfaces(tech);

      // Check each interface
      for (const ifaceSpec of interfaces) {
        if (!isProviderInterface(ifaceSpec)) {
          errors.push(`Unknown interface specification: ${ifaceSpec}`);
          continue;
        }

        // Check if interface belongs to the technology
        if (!isInterfaceForTechnology(ifaceSpec, tech)) {
          errors.push(`Interface '${ifaceSpec}' does not belong to technology '${technology}'`);
          continue;
        }

        // Check if interface is supported
        if (!supportedInterfaces.includes(ifaceSpec as ChainInterfaceMap[typeof tech])) {
          warnings.push(`Interface '${ifaceSpec}' is not in the supported list for ${technology}`);
        }
      }

      // Check for recommended interfaces
      const recommended = getRecommendedInterfaces(tech, 1);
      const hasRecommended = interfaces.some((ifaceSpec) =>
        recommended.includes(ifaceSpec as ChainInterfaceMap[typeof tech]),
      );

      if (!hasRecommended && interfaces.length > 0) {
        warnings.push(`Consider including recommended interface '${recommended[0]}' for ${technology}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Re-export type guards for convenience
export { isProviderInterface, isEVMInterface, isSolanaInterface, isAztecInterface };
