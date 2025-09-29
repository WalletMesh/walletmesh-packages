/**
 * Type mappings between discovery protocol and modal-core
 *
 * This module provides utility functions and type definitions to bridge
 * the gap between the discovery protocol's types and modal-core's internal types.
 *
 * @module client/types/discoveryMappings
 */

import type {
  CapabilityRequirements,
  DiscoveryResponseEvent,
  QualifiedResponder,
  TechnologyRequirement,
} from '@walletmesh/discovery';
import { ChainType, TransportType } from '../../types.js';

/**
 * Chain ID mappings for common networks
 * Using CAIP-2 format: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
 * Format: namespace:reference (e.g., "eip155:1" for Ethereum mainnet)
 */
export const CHAIN_MAPPINGS: Record<string, string[]> = {
  // EVM chains (EIP-155 namespace)
  'eip155:1': ['ethereum', 'eth', 'mainnet'],
  'eip155:137': ['polygon', 'matic'],
  'eip155:42161': ['arbitrum', 'arbitrum-one'],
  'eip155:10': ['optimism', 'op'],
  'eip155:56': ['bsc', 'binance', 'binance-smart-chain'],
  'eip155:43114': ['avalanche', 'avax', 'avalanche-c-chain'],
  'eip155:8453': ['base'],
  'eip155:100': ['gnosis', 'xdai'],
  'eip155:250': ['fantom', 'ftm'],

  // Solana chains
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': ['solana', 'sol', 'solana-mainnet'],
  'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': ['solana-devnet'],
  'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': ['solana-testnet'],

  // Aztec chains (using placeholder format until official CAIP-2 namespace)
  'aztec:mainnet': ['aztec', 'aztec-mainnet'],
  'aztec:testnet': ['aztec-testnet'],
  'aztec:sandbox': ['aztec-sandbox', 'aztec-devnet'],
  'aztec:31337': ['aztec-local', 'aztec-localhost'],

  // Common test networks
  'eip155:11155111': ['sepolia', 'ethereum-sepolia'],
  'eip155:5': ['goerli', 'ethereum-goerli'],
  'eip155:80001': ['mumbai', 'polygon-mumbai'],
};

/**
 * Convert modal-core chain types to discovery protocol chain IDs
 * Returns CAIP-2 formatted chain identifiers
 */
export function chainTypesToDiscoveryChains(chainTypes: ChainType[]): string[] {
  const chains = new Set<string>();

  for (const chainType of chainTypes) {
    switch (chainType) {
      case ChainType.Evm:
        // Return all EVM chains from mappings
        for (const chain of Object.keys(CHAIN_MAPPINGS)) {
          if (chain.startsWith('eip155:')) {
            chains.add(chain);
          }
        }
        break;
      case ChainType.Solana:
        // Return all Solana chains
        chains.add('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'); // mainnet
        chains.add('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z'); // testnet
        chains.add('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'); // devnet
        break;
      case ChainType.Aztec:
        // Return all Aztec chains
        chains.add('aztec:mainnet');
        chains.add('aztec:testnet');
        chains.add('aztec:sandbox');
        chains.add('aztec:31337');
        break;
    }
  }

  return Array.from(chains);
}

/**
 * Map discovery technologies to chain types
 * Converts technology types to modal-core ChainType enums
 */
export function mapDiscoveryTechnologiesToChainTypes(technologies: Array<{ type: string }>): ChainType[] {
  const chainTypes = new Set<ChainType>();

  for (const tech of technologies) {
    switch (tech.type) {
      case 'evm':
        chainTypes.add(ChainType.Evm);
        break;
      case 'solana':
        chainTypes.add(ChainType.Solana);
        break;
      case 'aztec':
        chainTypes.add(ChainType.Aztec);
        break;
    }
  }

  return Array.from(chainTypes);
}

/**
 * Extract chain types from discovery protocol chain IDs
 * Supports both legacy format and CAIP-2 format
 * Handles both single chain string and array of chains
 */
export function discoveryChainToChainTypes(chains: string | string[]): ChainType[] {
  const chainArray = Array.isArray(chains) ? chains : [chains];
  const chainTypes = new Set<ChainType>();

  for (const chain of chainArray) {
    // Support CAIP-2 format
    if (chain.startsWith('eip155:') || chain.startsWith('evm:')) {
      chainTypes.add(ChainType.Evm);
    } else if (chain.startsWith('solana:')) {
      chainTypes.add(ChainType.Solana);
    } else if (chain.startsWith('aztec:')) {
      chainTypes.add(ChainType.Aztec);
    }
    // Note: Unknown chain types are ignored
  }

  return Array.from(chainTypes);
}

/**
 * Get interfaces for chain types
 */
export function getInterfacesForChainTypes(chainTypes: ChainType[]): string[] {
  const interfaces = new Set<string>();

  const chainInterfaces: Record<ChainType, string[]> = {
    [ChainType.Evm]: ['eip-1193', 'eip-1102'],
    [ChainType.Solana]: ['solana-standard', 'solana-wallet-standard'],
    [ChainType.Aztec]: ['aztec-wallet', 'aztec-rpc'],
  };

  for (const chainType of chainTypes) {
    const mappedInterfaces = chainInterfaces[chainType] || [];
    for (const iface of mappedInterfaces) {
      interfaces.add(iface);
    }
  }

  return Array.from(interfaces);
}

/**
 * Get features for chain types
 */
export function getFeaturesForChainTypes(chainTypes: ChainType[]): string[] {
  const features = new Set<string>();

  // Common features across all chain types
  features.add('account-management');
  features.add('transaction-signing');

  // Chain-specific features
  const chainFeatures: Record<ChainType, string[]> = {
    [ChainType.Evm]: ['message-signing', 'typed-data-signing', 'network-switching'],
    [ChainType.Solana]: ['message-signing', 'transaction-simulation'],
    [ChainType.Aztec]: ['private-transactions', 'note-management'],
  };

  for (const chainType of chainTypes) {
    const mappedFeatures = chainFeatures[chainType] || [];
    for (const feature of mappedFeatures) {
      features.add(feature);
    }
  }

  return Array.from(features);
}

/**
 * Get technologies for chain types
 */
export function getTechnologiesForChainTypes(chainTypes: ChainType[]): TechnologyRequirement[] {
  const technologies: TechnologyRequirement[] = [];

  if (chainTypes.includes(ChainType.Evm)) {
    technologies.push({
      type: 'evm' as const,
      interfaces: ['eip-1193', 'eip-6963'],
    });
  }

  if (chainTypes.includes(ChainType.Solana)) {
    technologies.push({
      type: 'solana' as const,
      interfaces: ['solana-standard-wallet'],
    });
  }

  if (chainTypes.includes(ChainType.Aztec)) {
    technologies.push({
      type: 'aztec' as const,
      interfaces: ['aztec-wallet-api-v1'],
    });
  }

  return technologies;
}

/**
 * Convert chain IDs to CAIP-2 format if needed
 * Handles common chain ID formats and converts them to CAIP-2
 */
export function normalizeChainId(chainId: string): string {
  // First check if it's a special mapping (handles solana:mainnet etc.)
  const nameMappings: Record<string, string> = {
    ethereum: 'eip155:1',
    polygon: 'eip155:137',
    arbitrum: 'eip155:42161',
    optimism: 'eip155:10',
    bsc: 'eip155:56',
    avalanche: 'eip155:43114',
    base: 'eip155:8453',
    gnosis: 'eip155:100',
    fantom: 'eip155:250',
    solana: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    aztec: 'aztec:0x1',
    // Special handling for Solana network names
    'solana:mainnet': 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    'solana:testnet': 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    'solana:devnet': 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  };

  // Check special mappings first
  const mapped = nameMappings[chainId] || nameMappings[chainId.toLowerCase()];
  if (mapped) {
    return mapped;
  }

  // Already in CAIP-2 format (but not a special mapping)
  if (chainId.includes(':')) {
    return chainId;
  }

  // Handle hex format (0x89 -> 137)
  if (chainId.startsWith('0x')) {
    if (chainId === '0x') {
      return '0x'; // Pass through empty hex
    }
    const decimal = Number.parseInt(chainId, 16);
    if (Number.isNaN(decimal)) {
      return chainId; // Return as-is if not a valid hex number
    }
    return normalizeChainId(decimal.toString());
  }

  // Common numeric chain IDs to CAIP-2
  const numericMappings: Record<string, string> = {
    '1': 'eip155:1',
    '137': 'eip155:137',
    '42161': 'eip155:42161',
    '10': 'eip155:10',
    '56': 'eip155:56',
    '43114': 'eip155:43114',
    '8453': 'eip155:8453',
    '100': 'eip155:100',
    '250': 'eip155:250',
    '11155111': 'eip155:11155111',
    '5': 'eip155:5',
    '80001': 'eip155:80001',
  };

  return numericMappings[chainId] || chainId;
}

/**
 * Create capability requirements from chain types
 */
export function createCapabilityRequirementsFromChainTypes(
  chainTypes: ChainType[],
  customChains?: string[],
  customFeatures?: string[],
  customInterfaces?: string[],
): CapabilityRequirements;
export function createCapabilityRequirementsFromChainTypes(
  chainTypes: ChainType[],
  existingCapabilities?: CapabilityRequirements,
): CapabilityRequirements;
export function createCapabilityRequirementsFromChainTypes(
  chainTypes: ChainType[],
  customChainsOrCapabilities?: string[] | CapabilityRequirements,
  customFeatures?: string[],
  _customInterfaces?: string[],
): CapabilityRequirements {
  // Handle overload - check if second parameter is capabilities object
  if (
    customChainsOrCapabilities &&
    typeof customChainsOrCapabilities === 'object' &&
    !Array.isArray(customChainsOrCapabilities)
  ) {
    const existingCapabilities = customChainsOrCapabilities as CapabilityRequirements;

    // Merge technologies from chain types
    const chainTechnologies = getTechnologiesForChainTypes(chainTypes);
    const mergedTechnologies = [...(existingCapabilities.technologies || []), ...chainTechnologies];

    return {
      technologies: mergedTechnologies,
      features: existingCapabilities.features || getFeaturesForChainTypes(chainTypes),
    };
  }

  // Handle original overload
  const features =
    customFeatures && customFeatures.length > 0 ? customFeatures : getFeaturesForChainTypes(chainTypes);

  // Create technologies from chain types
  const technologies = getTechnologiesForChainTypes(chainTypes);

  return {
    technologies,
    features,
  };
}

/**
 * Check if a qualified wallet supports specific chain types
 */
export function walletSupportsChainTypes(
  wallet: QualifiedResponder,
  requiredChainTypes: ChainType[],
): boolean {
  // Check technologies in matched.required
  if ('matched' in wallet && wallet.matched?.required?.technologies) {
    const walletTechnologies = wallet.matched.required.technologies;
    const walletChainTypes = walletTechnologies
      .map((tech: any) => {
        switch (tech.type) {
          case 'evm':
            return ChainType.Evm;
          case 'solana':
            return ChainType.Solana;
          case 'aztec':
            return ChainType.Aztec;
          default:
            return null;
        }
      })
      .filter(Boolean) as ChainType[];

    return requiredChainTypes.every((requiredType) => walletChainTypes.includes(requiredType));
  }

  return false;
}

/**
 * Get supported chain types from a qualified wallet
 */
export function getWalletChainTypes(wallet: QualifiedResponder): ChainType[] {
  // Check technologies in matched.required
  if ('matched' in wallet && wallet.matched?.required?.technologies) {
    const walletTechnologies = wallet.matched.required.technologies;
    return walletTechnologies
      .map((tech: any) => {
        switch (tech.type) {
          case 'evm':
            return ChainType.Evm;
          case 'solana':
            return ChainType.Solana;
          case 'aztec':
            return ChainType.Aztec;
          default:
            return null;
        }
      })
      .filter(Boolean) as ChainType[];
  }

  return [];
}

/**
 * Map discovery chain IDs to specific chain types with network info
 * Supports both legacy format and CAIP-2 format
 */
export function mapDiscoveryChainsToChainTypes(chains: string[]): ChainType[] {
  const chainTypes = new Set<ChainType>();

  for (const chain of chains) {
    const [protocol] = chain.split(':');

    switch (protocol) {
      case 'evm':
      case 'eip155':
        chainTypes.add(ChainType.Evm);
        break;
      case 'solana':
        chainTypes.add(ChainType.Solana);
        break;
      case 'aztec':
        chainTypes.add(ChainType.Aztec);
        break;
    }
  }

  return Array.from(chainTypes);
}

/**
 * Convert a single chain type to discovery protocol chain IDs
 */
export function chainTypeToDiscoveryChains(chainType: ChainType): string[] {
  return chainTypesToDiscoveryChains([chainType]);
}

/**
 * Alias for walletSupportsChainTypes
 */
export function checkWalletSupportsChainTypes(wallet: QualifiedResponder, chainTypes: ChainType[]): boolean {
  return walletSupportsChainTypes(wallet, chainTypes);
}

/**
 * Get transport type from discovery response
 */
export function getTransportTypeFromDiscovery(transportType: string): TransportType {
  switch (transportType) {
    case 'injected':
      return TransportType.Injected;
    case 'popup':
      return TransportType.Popup;
    case 'iframe':
      return TransportType.Iframe;
    case 'websocket':
      return TransportType.WebSocket;
    case 'web':
      return TransportType.Popup; // map to Popup in minimal wiring
    case 'extension':
      return TransportType.Extension;
    default:
      return TransportType.Extension; // Default
  }
}

/**
 * Extract transport config from responder
 */
export function extractTransportConfig(responder: QualifiedResponder): Record<string, unknown> {
  if (responder.transportConfig && typeof responder.transportConfig === 'object') {
    return { ...responder.transportConfig };
  }
  return {};
}

/**
 * Extract transport metadata from wallet announcement
 */
export function extractTransportMetadata(announcement: DiscoveryResponseEvent): {
  transportType: TransportType | null;
  metadata: Record<string, unknown>;
} {
  // Check for extension ID
  if ('extensionId' in announcement && announcement.extensionId) {
    return {
      transportType: TransportType.Extension,
      metadata: {
        extensionId: announcement.extensionId,
      },
    };
  }

  // Check for popup URL
  if ('popupUrl' in announcement && announcement.popupUrl) {
    return {
      transportType: TransportType.Popup,
      metadata: {
        popupUrl: announcement.popupUrl,
      },
    };
  }

  // Check for WebSocket URL (use Popup as fallback)
  if ('websocketUrl' in announcement && announcement.websocketUrl) {
    return {
      transportType: TransportType.Popup, // WebSocket not yet supported
      metadata: {
        websocketUrl: announcement.websocketUrl,
      },
    };
  }

  // Default to popup
  return {
    transportType: TransportType.Popup,
    metadata: {},
  };
}

/**
 * Validate wallet for transport compatibility
 */
export function validateWalletTransport(responder: QualifiedResponder): boolean {
  const { transportConfig } = responder;

  if (!transportConfig) {
    return false;
  }

  switch (transportConfig.type as any) {
    case 'extension':
      return !!transportConfig.extensionId;
    case 'popup':
      return true; // Popup can work with default URL
    case 'websocket':
      return !!(transportConfig as any).url || !!(transportConfig as any).websocketUrl;
    case 'postmessage':
      return true;
    case 'iframe':
      return true;
    case 'injected':
      return true; // Injected wallets don't need transport
    default:
      return false;
  }
}

/**
 * Get transport configuration from wallet
 */
export function getTransportConfigFromWallet(responder: QualifiedResponder): Record<string, unknown> {
  const { transportConfig } = responder;

  if (!transportConfig) {
    return {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
    };
  }

  const baseConfig = {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    ...transportConfig.adapterConfig,
  };

  // Cast type to any to allow non-standard 'web' during minimal wiring
  switch ((transportConfig as any).type) {
    case 'extension':
      return {
        ...baseConfig,
        extensionId: transportConfig.extensionId,
      };
    case 'popup':
      return {
        ...baseConfig,
        url: transportConfig.popupUrl || `/wallets/${responder.rdns}/popup`,
      };
    case 'websocket':
      return {
        ...baseConfig,
        url: (transportConfig as any).url ?? (transportConfig as any).websocketUrl,
      };
    case 'postmessage':
      return baseConfig;
    case 'iframe':
      return baseConfig;
    default:
      return baseConfig;
  }
}

/**
 * Notes for future enhancements:
 *
 * 1. Chain ID Standardization:
 *    - Consider adopting CAIP-2 chain identifiers for broader compatibility
 *    - Add support for custom chain ID mappings via configuration
 *
 * 2. Feature Detection:
 *    - Add runtime feature detection to verify actual wallet capabilities
 *    - Create a feature compatibility matrix for different wallet types
 *
 * 3. Interface Versioning:
 *    - Support multiple versions of interfaces (e.g., eip-1193v1, eip-1193v2)
 *    - Add interface negotiation during connection phase
 *
 * 4. Dynamic Chain Support:
 *    - Allow wallets to dynamically add/remove chain support
 *    - Implement chain capability updates via events
 *
 * 5. Capability Scoring:
 *    - Enhance matchScore calculation with weighted features
 *    - Add user preference weighting to capability matching
 *
 * 6. Transport Auto-Detection:
 *    - Implement transport capability detection
 *    - Support multiple transport options per wallet
 *    - Add transport preference configuration
 */
