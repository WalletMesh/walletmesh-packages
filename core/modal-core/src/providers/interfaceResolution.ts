/**
 * Interface resolution logic for determining which provider to use
 * based on negotiated interfaces during wallet discovery
 *
 * @module providers/interfaceResolution
 * @packageDocumentation
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type {
  AztecInterface,
  ChainInterfaceMap,
  EVMInterface,
  ProviderInterface,
  SolanaInterface,
} from './types/index.js';

/**
 * Interface priority map for each blockchain technology
 * Higher priority interfaces are preferred when multiple are available
 *
 * @remarks
 * This map uses explicit interface types to ensure type safety and prevent
 * typos in interface specifications. Higher numbers indicate higher priority.
 */
const INTERFACE_PRIORITY = {
  evm: {
    'eip-6963': 100, // Latest EVM provider standard
    'eip-1193': 90, // Standard EVM provider interface
    'eip-1102': 80, // Legacy request access interface
    'web3-provider': 70, // Legacy Web3 provider
  } as Record<EVMInterface, number>,

  solana: {
    'solana-standard-wallet': 100, // Latest Solana wallet standard
    'solana-wallet-standard': 90, // Alternative naming
    'solana-wallet-adapter': 80, // Wallet adapter protocol
  } as Record<SolanaInterface, number>,

  aztec: {
    'aztec-connect-v2': 100, // Latest Aztec Connect protocol
    'aztec-wallet-api-v1': 90, // Standard Aztec wallet API
    'aztec-rpc': 80, // RPC-based interface
    'aztec-wallet': 70, // Generic Aztec wallet interface
  } as Record<AztecInterface, number>,
} as const;

/**
 * Provider type mapping based on interface specification
 * Maps interface identifiers to provider implementation class names
 *
 * @remarks
 * This mapping connects interface specifications (protocol standards) to their
 * corresponding provider implementation class names. It uses explicit types to
 * ensure all supported interfaces are mapped correctly.
 */
const INTERFACE_TO_PROVIDER: Record<ProviderInterface, string> = {
  // EVM interface specifications → EvmProvider implementation
  'eip-6963': 'EvmProvider',
  'eip-1193': 'EvmProvider',
  'eip-1102': 'EvmProvider',
  'web3-provider': 'EvmProvider',

  // Solana interface specifications → SolanaProvider implementation
  'solana-standard-wallet': 'SolanaProvider',
  'solana-wallet-standard': 'SolanaProvider',
  'solana-wallet-adapter': 'SolanaProvider',

  // Aztec interface specifications → AztecProvider implementation
  'aztec-connect-v2': 'AztecProvider',
  'aztec-wallet-api-v1': 'AztecProvider',
  'aztec-rpc': 'AztecProvider',
  'aztec-wallet': 'AztecProvider',
} satisfies Record<ProviderInterface, string>;

/**
 * Result of interface resolution
 *
 * @remarks
 * Contains the results of resolving which interface specification to use
 * and which provider implementation should handle it.
 */
export interface InterfaceResolutionResult {
  /** The selected interface specification to use */
  selectedInterface: ProviderInterface;
  /** The provider implementation type to instantiate */
  providerType: string;
  /** Priority score of the selected interface */
  priority: number;
  /** All matched interface specifications in priority order */
  matchedInterfaces: ProviderInterface[];
}

/**
 * Resolve which interface to use from matched capabilities
 *
 * @param technology - The blockchain technology type
 * @param matchedInterfaces - Array of interfaces that both dApp and wallet support
 * @returns Resolution result with selected interface and provider type
 * @throws If no suitable interface is found
 */
export function resolveInterface(
  technology: 'evm' | 'solana' | 'aztec',
  matchedInterfaces: string[],
): InterfaceResolutionResult {
  if (!matchedInterfaces || matchedInterfaces.length === 0) {
    throw ErrorFactory.configurationError(`No interfaces matched for ${technology}`);
  }

  const priorityMap = INTERFACE_PRIORITY[technology] || {};

  // Filter to only supported interfaces and sort by priority
  const validInterfaces = matchedInterfaces.filter(isProviderInterface);
  const sortedInterfaces = validInterfaces
    .filter((iface) => iface in priorityMap)
    .sort((a, b) => {
      const priorityA = (priorityMap as Record<string, number>)[a] || 0;
      const priorityB = (priorityMap as Record<string, number>)[b] || 0;
      return priorityB - priorityA;
    });

  if (sortedInterfaces.length === 0) {
    // Fallback to first valid interface if none are in priority map
    if (validInterfaces.length > 0) {
      const selectedInterface = validInterfaces[0];
      if (!selectedInterface) {
        throw ErrorFactory.notFound(`No valid interface found for ${technology}`);
      }
      return {
        selectedInterface,
        providerType: INTERFACE_TO_PROVIDER[selectedInterface] || getDefaultProvider(technology),
        priority: 0,
        matchedInterfaces: validInterfaces,
      };
    }

    throw ErrorFactory.notFound(
      `No valid interfaces found for ${technology} among: ${matchedInterfaces.join(', ')}`,
    );
  }

  // Select highest priority interface
  const selectedInterface = sortedInterfaces[0];
  if (!selectedInterface) {
    throw ErrorFactory.notFound(`No valid interface found for ${technology} after sorting`);
  }
  const providerType = INTERFACE_TO_PROVIDER[selectedInterface] || getDefaultProvider(technology);

  return {
    selectedInterface,
    providerType,
    priority: (priorityMap as Record<string, number>)[selectedInterface] || 0,
    matchedInterfaces: sortedInterfaces,
  };
}

/**
 * Get default provider type for a technology
 */
function getDefaultProvider(technology: 'evm' | 'solana' | 'aztec'): string {
  switch (technology) {
    case 'evm':
      return 'EvmProvider';
    case 'solana':
      return 'SolanaProvider';
    case 'aztec':
      return 'AztecProvider';
    default:
      return 'BaseProvider';
  }
}

/**
 * Resolve interface from wallet response
 * Extracts matched interfaces from qualified responder and resolves the best one
 *
 * @param wallet - Qualified wallet responder from discovery
 * @param technology - Technology type to resolve for
 * @returns Resolution result
 */
export function resolveInterfaceFromWallet(
  wallet: QualifiedResponder,
  technology: 'evm' | 'solana' | 'aztec',
): InterfaceResolutionResult | null {
  // Check if wallet has technology matches
  if (!wallet.matched?.required?.technologies) {
    // Fallback to legacy format - check if it has interfaces property
    const legacyMatched = wallet.matched?.required as { interfaces?: string[] };
    if (legacyMatched?.interfaces) {
      return resolveInterface(technology, legacyMatched.interfaces);
    }
    return null;
  }

  // Find technology match
  const techMatch = wallet.matched.required.technologies.find((t: any) => t.type === technology);

  if (!techMatch || !techMatch.interfaces || techMatch.interfaces.length === 0) {
    return null;
  }

  return resolveInterface(technology, techMatch.interfaces);
}

/**
 * Check if an interface is supported for a technology
 */
export function isInterfaceSupported(technology: 'evm' | 'solana' | 'aztec', interfaceId: string): boolean {
  const priorityMap = INTERFACE_PRIORITY[technology];
  return priorityMap ? interfaceId in priorityMap : false;
}

/**
 * Get all supported interfaces for a technology
 */
export function getSupportedInterfaces(technology: 'evm' | 'solana' | 'aztec'): string[] {
  const priorityMap = INTERFACE_PRIORITY[technology];
  return priorityMap ? Object.keys(priorityMap) : [];
}

/**
 * Get recommended interfaces for a technology
 * Returns top 3 interfaces by priority
 */
export function getRecommendedInterfaces(technology: 'evm' | 'solana' | 'aztec'): string[] {
  const priorityMap = INTERFACE_PRIORITY[technology];
  if (!priorityMap) return [];

  return Object.entries(priorityMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([iface]) => iface);
}

/**
 * Validate supported interfaces configuration
 * Ensures all specified interfaces are known and supported
 */
export function validateSupportedInterfaces(supportedInterfaces: Record<string, string[]>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const [technology, interfaces] of Object.entries(supportedInterfaces)) {
    if (!['evm', 'solana', 'aztec'].includes(technology)) {
      errors.push(`Unknown technology: ${technology}`);
      continue;
    }

    const tech = technology as 'evm' | 'solana' | 'aztec';
    const supportedList = getSupportedInterfaces(tech);

    for (const iface of interfaces) {
      if (!supportedList.includes(iface)) {
        errors.push(`Unknown interface '${iface}' for ${technology}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ========================================================================
// EXPLICIT PROVIDER/INTERFACE TYPE GUARDS AND UTILITIES
// ========================================================================

/**
 * Type guard to check if a string is a valid provider interface specification
 */
export function isProviderInterface(value: string): value is ProviderInterface {
  return value in INTERFACE_TO_PROVIDER;
}

/**
 * Type guard to check if a string is a valid EVM interface specification
 */
export function isEVMInterface(value: string): value is EVMInterface {
  const evmInterfaces: EVMInterface[] = ['eip-1193', 'eip-6963', 'eip-1102', 'web3-provider'];
  return evmInterfaces.includes(value as EVMInterface);
}

/**
 * Type guard to check if a string is a valid Solana interface specification
 */
export function isSolanaInterface(value: string): value is SolanaInterface {
  const solanaInterfaces: SolanaInterface[] = [
    'solana-standard-wallet',
    'solana-wallet-standard',
    'solana-wallet-adapter',
  ];
  return solanaInterfaces.includes(value as SolanaInterface);
}

/**
 * Type guard to check if a string is a valid Aztec interface specification
 */
export function isAztecInterface(value: string): value is AztecInterface {
  const aztecInterfaces: AztecInterface[] = [
    'aztec-connect-v2',
    'aztec-wallet-api-v1',
    'aztec-rpc',
    'aztec-wallet',
  ];
  return aztecInterfaces.includes(value as AztecInterface);
}

/**
 * Get the blockchain technology type for an interface specification
 */
export function getTechnologyForInterface(interfaceSpec: ProviderInterface): keyof ChainInterfaceMap {
  if (isEVMInterface(interfaceSpec)) return 'evm';
  if (isSolanaInterface(interfaceSpec)) return 'solana';
  if (isAztecInterface(interfaceSpec)) return 'aztec';

  throw ErrorFactory.configurationError(`Unknown interface specification: ${interfaceSpec}`);
}

/**
 * Get the provider implementation class name for an interface specification
 */
export function getProviderTypeForInterface(interfaceSpec: ProviderInterface): string {
  return INTERFACE_TO_PROVIDER[interfaceSpec];
}

/**
 * Get all interface specifications supported by a technology
 */
export function getInterfaceSpecificationsForTechnology<T extends keyof ChainInterfaceMap>(
  technology: T,
): ChainInterfaceMap[T][] {
  const priorityMap = INTERFACE_PRIORITY[technology];
  return Object.keys(priorityMap) as ChainInterfaceMap[T][];
}

/**
 * Get interface specifications sorted by priority for a technology
 */
export function getInterfaceSpecificationsByPriority<T extends keyof ChainInterfaceMap>(
  technology: T,
): ChainInterfaceMap[T][] {
  const priorityMap = INTERFACE_PRIORITY[technology];
  return Object.entries(priorityMap)
    .sort(([, a], [, b]) => b - a)
    .map(([iface]) => iface) as ChainInterfaceMap[T][];
}

/**
 * Check if an interface specification has higher priority than another
 */
export function hasHigherPriority(
  technology: keyof ChainInterfaceMap,
  interfaceSpecA: string,
  interfaceSpecB: string,
): boolean {
  const priorityMap = INTERFACE_PRIORITY[technology] as Record<string, number>;
  const priorityA = priorityMap[interfaceSpecA] || 0;
  const priorityB = priorityMap[interfaceSpecB] || 0;
  return priorityA > priorityB;
}
