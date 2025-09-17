/**
 * Capability and responder types for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Contains all types related to capability requirements, preferences, responder information,
 * and capability matching. These types define how dApps express their needs and how
 * wallets describe their capabilities.
 *
 * @module types/capabilities
 * @category Types
 * @since 0.1.0
 */

import type { CHAIN_TYPES } from '../core/constants.js';

/**
 * Technology requirement for discovery.
 *
 * Defines a blockchain technology (e.g., EVM, Solana, Aztec) and the
 * interfaces/features required for that technology. This enables technology-level
 * discovery where wallets announce support for blockchain types rather than
 * specific chains.
 *
 * @category Discovery
 * @since 0.3.0
 */
export interface TechnologyRequirement {
  /**
   * Blockchain technology type.
   * Must be one of the supported technology types.
   */
  type: 'evm' | 'solana' | 'aztec';

  /**
   * Provider interfaces required for this technology.
   * Listed in preference order - first match will be used.
   * Examples: 'eip-1193', 'solana-standard-wallet', 'aztec-connect-v2'
   */
  interfaces: string[];

  /**
   * Technology-specific features required.
   * These are features specific to this blockchain technology.
   */
  features?: string[];
}

/**
 * Capability requirements specification for responder discovery.
 *
 * Capabilities represent the complete set of functionalities a wallet can provide,
 * organized into technology-based requirements and global features.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface CapabilityRequirements {
  /**
   * Blockchain technologies that must be supported.
   * Each technology includes its required interfaces and features.
   * Wallets must support at least the interfaces listed for each technology.
   */
  technologies: TechnologyRequirement[];

  /**
   * Global wallet features that must be available.
   * These represent wallet-level functionalities beyond specific blockchain support,
   * such as hardware security, multi-account support, or session management.
   * See RESPONDER_FEATURES for standard values.
   */
  features: string[];
}

/**
 * Optional capability preferences for enhanced responder matching.
 *
 * While CapabilityRequirements define what a wallet MUST support,
 * preferences indicate what would be nice to have. These help rank
 * and prioritize wallets that go beyond the minimum requirements.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface CapabilityPreferences {
  /**
   * Additional technology capabilities that would be beneficial.
   * These technologies are not required but having them increases wallet ranking.
   */
  technologies?: TechnologyRequirement[];

  /**
   * Additional wallet features that would enhance the user experience.
   * These are "nice to have" capabilities beyond the required features.
   */
  features?: string[];
}

/**
 * Technology capability match for discovery response.
 *
 * Represents a matched technology with the specific interface and features
 * that the wallet supports for that technology.
 *
 * @category Discovery
 * @since 0.3.0
 */
export interface TechnologyMatch {
  /**
   * Blockchain technology type.
   */
  type: 'evm' | 'solana' | 'aztec';

  /**
   * Supported interfaces for this technology.
   * Subset of what the wallet supports that matches the requirement.
   */
  interfaces: string[];

  /**
   * Supported features for this technology.
   * Subset of what the wallet supports that matches the requirement.
   */
  features: string[];
}

/**
 * Technology capability declaration for responders.
 *
 * Describes a blockchain technology supported by a responder, including
 * all interfaces and features available for that technology.
 *
 * @category Discovery
 * @since 0.3.0
 */
export interface TechnologyCapability {
  /**
   * Blockchain technology type.
   */
  type: 'evm' | 'solana' | 'aztec' | string;

  /**
   * All provider interfaces supported for this technology.
   * Responders should list all interfaces they implement.
   */
  interfaces: string[];

  /**
   * All technology-specific features supported.
   * Should include all capabilities specific to this blockchain technology.
   */
  features?: string[];
}

/**
 * Result of capability intersection between requirements and responder capabilities.
 *
 * Contains the overlapping capabilities between what the initiator requested
 * and what the responder supports. Only includes capabilities that match both
 * requirements and responder capabilities.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface CapabilityIntersection {
  /**
   * The intersection of required capabilities.
   * All of these were requested as mandatory and are supported by the wallet.
   */
  required: {
    /**
     * Matched blockchain technologies with their supported interfaces/features.
     */
    technologies: TechnologyMatch[];

    /**
     * Global features that overlap between requirements and responder support.
     */
    features: string[];
  };

  /**
   * The intersection of optional/preferred capabilities.
   * These were requested as nice-to-have and are supported by the wallet.
   */
  optional?: {
    /**
     * Optional technology matches.
     */
    technologies?: TechnologyMatch[];

    /**
     * Optional features that are supported.
     */
    features?: string[];
  };
}

/**
 * Chain type classification.
 *
 * @category Discovery
 * @since 0.1.0
 */
export type ChainType = (typeof CHAIN_TYPES)[keyof typeof CHAIN_TYPES];

/**
 * Network information for blockchain networks.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface NetworkInfo {
  name: string;
  chainId: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: boolean;
}

/**
 * Transaction type classification.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface TransactionType {
  id: string;
  name: string;
  description: string;
  parameters: ParameterSpec[];
  supportsGasEstimation: boolean;
  requiresUserApproval: boolean;
}

/**
 * Parameter specification for transaction types.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ParameterSpec {
  name: string;
  type: string;
  required: boolean;
  description: string;
  validation?: ValidationRule[];
}

/**
 * Validation rule for parameters.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ValidationRule {
  type: 'min' | 'max' | 'regex' | 'enum' | 'custom';
  value: unknown;
  message: string;
}

/**
 * Chain-specific feature declaration.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ChainFeature {
  id: string;
  name: string;
  description: string;
  supportsEstimation: boolean;
  requiresNetwork: boolean;
}

/**
 * Complete chain capability declaration.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ChainCapability {
  chainId: string;
  chainType: ChainType;
  network: NetworkInfo;
  standards: string[];
  rpcMethods: string[];
  transactionTypes: TransactionType[];
  signatureSchemes: string[];
  features: ChainFeature[];
}

/**
 * Individual responder feature declaration.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ResponderFeature {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

/**
 * Responder type classification.
 *
 * @category Discovery
 * @since 0.1.0
 */
export type ResponderType = 'extension' | 'web' | 'mobile' | 'desktop' | 'hardware';

/**
 * Platform information for responders.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ResponderPlatform {
  os: string[];
  browsers: string[];
  minVersion?: string;
  maxVersion?: string;
}

/**
 * Verification information for responders.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface VerificationInfo {
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  signature?: string;
}

/**
 * Permission model for responders.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface PermissionModel {
  required: string[];
  optional?: string[];
  scopes?: Record<string, string[]>;
}

/**
 * Base responder information.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface BaseResponderInfo {
  uuid: string;
  rdns: string;
  name: string;
  icon: string;
  type: ResponderType;
  version: string;
  protocolVersion: string;
  technologies: TechnologyCapability[];
  features: ResponderFeature[];
  description?: string;
  homepage?: string;
  platform?: ResponderPlatform;
  verification?: VerificationInfo;
  permissions?: PermissionModel;
  transportConfig?: import('./core.js').TransportConfig;
}

/**
 * Extension responder information.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface ExtensionResponderInfo extends BaseResponderInfo {
  type: 'extension';
  extensionId?: string;
  downloadUrl?: string;
  manifestVersion?: string;
  extensionPermissions?: string[];
}

/**
 * Web responder information.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface WebResponderInfo extends BaseResponderInfo {
  type: 'web';
  url: string;
  origin?: string;
  domains?: string[];
}

/**
 * Union type of all responder information types.
 *
 * @category Discovery
 * @since 0.1.0
 */
export type ResponderInfo = ExtensionResponderInfo | WebResponderInfo | BaseResponderInfo;

/**
 * Qualified responder with capability intersection.
 *
 * @category Discovery
 * @since 0.1.0
 */
export interface QualifiedResponder {
  responderId: string;
  rdns: string;
  name: string;
  icon: string;
  matched: CapabilityIntersection;
  transportConfig?: import('./core.js').TransportConfig;
  metadata?: {
    version?: string;
    description?: string;
  };
}
