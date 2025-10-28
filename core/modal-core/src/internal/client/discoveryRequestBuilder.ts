/**
 * Discovery request builder for creating technology-based discovery requests
 *
 * This module handles the conversion from the new SupportedChain and supportedInterfaces
 * configuration to the discovery protocol's technology-based format.
 *
 * @module internal/client/discoveryRequestBuilder
 * @internal
 */

import type { TechnologyRequirement } from '@walletmesh/discovery';
import type { SupportedChain } from '../../types.js';
import { ChainType } from '../../types.js';

/**
 * Build technology requirements from supported chains and interfaces
 *
 * @param supportedChains - Array of supported chain objects
 * @param supportedInterfaces - Supported interfaces per technology
 * @returns Array of technology requirements for discovery
 */
export function buildTechnologyRequirements(
  supportedChains?: SupportedChain[],
  supportedInterfaces?: {
    evm?: string[];
    solana?: string[];
    aztec?: string[];
  },
): TechnologyRequirement[] {
  const techRequirements: Map<string, TechnologyRequirement> = new Map();

  // Process supported chains to determine required technologies
  if (supportedChains && supportedChains.length > 0) {
    for (const chain of supportedChains) {
      const techType = mapChainTypeToTechnology(chain.chainType);
      if (!techType) continue;

      // Get or create technology requirement
      let techReq = techRequirements.get(techType);
      if (!techReq) {
        techReq = {
          type: techType,
          interfaces: [],
          features: [],
          networks: [],
        };
        techRequirements.set(techType, techReq);
      }

      // Add network from chain's chainId (CAIP-2 format)
      if (chain.chainId && !techReq.networks!.includes(chain.chainId)) {
        techReq.networks!.push(chain.chainId);
      }

      // Add chain-specific interfaces if specified
      if (chain.interfaces && chain.interfaces.length > 0) {
        for (const iface of chain.interfaces) {
          if (!techReq.interfaces.includes(iface)) {
            techReq.interfaces.push(iface);
          }
        }
      }
    }
  }

  // Apply supported interfaces configuration
  if (supportedInterfaces) {
    // Process EVM interfaces
    if (supportedInterfaces.evm && supportedInterfaces.evm.length > 0) {
      let evmReq = techRequirements.get('evm');
      if (!evmReq) {
        evmReq = { type: 'evm', interfaces: [], features: [] };
        techRequirements.set('evm', evmReq);
      }
      // Add interfaces that aren't already present
      for (const iface of supportedInterfaces.evm) {
        if (!evmReq.interfaces.includes(iface)) {
          evmReq.interfaces.push(iface);
        }
      }
    }

    // Process Solana interfaces
    if (supportedInterfaces.solana && supportedInterfaces.solana.length > 0) {
      let solanaReq = techRequirements.get('solana');
      if (!solanaReq) {
        solanaReq = { type: 'solana', interfaces: [], features: [] };
        techRequirements.set('solana', solanaReq);
      }
      for (const iface of supportedInterfaces.solana) {
        if (!solanaReq.interfaces.includes(iface)) {
          solanaReq.interfaces.push(iface);
        }
      }
    }

    // Process Aztec interfaces
    if (supportedInterfaces.aztec && supportedInterfaces.aztec.length > 0) {
      let aztecReq = techRequirements.get('aztec');
      if (!aztecReq) {
        aztecReq = { type: 'aztec', interfaces: [], features: [] };
        techRequirements.set('aztec', aztecReq);
      }
      for (const iface of supportedInterfaces.aztec) {
        if (!aztecReq.interfaces.includes(iface)) {
          aztecReq.interfaces.push(iface);
        }
      }
    }
  }

  // Add default interfaces if none specified
  for (const [techType, techReq] of techRequirements) {
    if (techReq.interfaces.length === 0) {
      techReq.interfaces = getDefaultInterfaces(techType as 'evm' | 'solana' | 'aztec');
    }
  }

  return Array.from(techRequirements.values());
}

/**
 * Map ChainType enum to technology type string
 */
function mapChainTypeToTechnology(chainType: ChainType): 'evm' | 'solana' | 'aztec' | null {
  switch (chainType) {
    case ChainType.Evm:
      return 'evm';
    case ChainType.Solana:
      return 'solana';
    case ChainType.Aztec:
      return 'aztec';
    default:
      return null;
  }
}

/**
 * Get default interfaces for a technology
 */
function getDefaultInterfaces(technology: 'evm' | 'solana' | 'aztec'): string[] {
  switch (technology) {
    case 'evm':
      return ['eip-1193'];
    case 'solana':
      return ['solana-standard-wallet'];
    case 'aztec':
      return ['aztec-wallet-api-v1'];
    default:
      return [];
  }
}

/**
 * Extract features from supported chains
 *
 * @param supportedChains - Array of supported chain objects
 * @param technology - Technology type to extract features for
 * @returns Array of feature strings
 */
export function extractFeaturesForTechnology(
  _supportedChains: SupportedChain[],
  technology: 'evm' | 'solana' | 'aztec',
): string[] {
  const features: Set<string> = new Set();

  // Add common features
  features.add('account-management');
  features.add('transaction-signing');

  // Add technology-specific features
  switch (technology) {
    case 'evm':
      features.add('message-signing');
      features.add('typed-data-signing');
      features.add('network-switching');
      break;
    case 'solana':
      features.add('message-signing');
      features.add('transaction-simulation');
      break;
    case 'aztec':
      features.add('private-transactions');
      features.add('note-management');
      break;
  }

  return Array.from(features);
}

/**
 * Validate technology requirements
 *
 * @param requirements - Array of technology requirements
 * @returns Validation result with any errors
 */
export function validateTechnologyRequirements(requirements: TechnologyRequirement[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const req of requirements) {
    // Validate technology type
    if (!['evm', 'solana', 'aztec'].includes(req.type)) {
      errors.push(`Invalid technology type: ${req.type}`);
    }

    // Validate interfaces
    if (!req.interfaces || req.interfaces.length === 0) {
      errors.push(`No interfaces specified for ${req.type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
