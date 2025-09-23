/**
 * @fileoverview Discovery protocol response schemas for runtime validation
 *
 * This module provides Zod schemas to validate all data received from the
 * discovery protocol before it's used by the modal, ensuring security and
 * type safety.
 */

import { z } from 'zod';
import type { QualifiedResponder as DiscoveryQualifiedResponder } from '@walletmesh/discovery';

/**
 * Transport configuration schema
 * Validates transport configuration provided by discovered wallets
 */
export const transportConfigSchema = z.object({
  /**
   * Transport type
   */
  type: z.enum(['extension', 'popup', 'websocket', 'injected']),

  /**
   * Chrome extension ID (required for extension transport)
   */
  extensionId: z.string().optional(),

  /**
   * Popup window URL (required for popup transport)
   */
  popupUrl: z.string().url().optional(),

  /**
   * WebSocket endpoint URL (required for websocket transport)
   */
  websocketUrl: z.string().url().optional(),

  /**
   * Wallet adapter class name
   */
  walletAdapter: z.string().optional(),

  /**
   * Additional adapter configuration
   */
  adapterConfig: z.record(z.unknown()).optional(),
});

/**
 * Technology schema for discovery
 */
const technologySchema = z.object({
  type: z.string(),
  interfaces: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
});

/**
 * Capability requirements schema
 * Validates capability requirement structures
 */
export const capabilityRequirementsSchema = z.object({
  /**
   * Required chains (e.g., ['evm:1', 'solana:mainnet'])
   */
  chains: z.array(z.string()).default([]),

  /**
   * Required features (e.g., ['sign-transaction', 'sign-message'])
   */
  features: z.array(z.string()).default([]),

  /**
   * Required interfaces (e.g., ['eip-1193', 'solana-wallet-standard'])
   */
  interfaces: z.array(z.string()).default([]),

  /**
   * Required technologies (e.g., [{type: 'evm', interfaces: ['eip1193']}])
   */
  technologies: z.array(technologySchema).optional(),

  /**
   * Required methods (e.g., ['eth_sendTransaction', 'eth_signTypedData'])
   */
  methods: z.array(z.string()).optional(),

  /**
   * Required events (e.g., ['accountsChanged', 'chainChanged'])
   */
  events: z.array(z.string()).optional(),
});

/**
 * Capability intersection schema
 * Validates the result of capability matching
 */
export const capabilityIntersectionSchema = z.object({
  /**
   * Required capabilities that were matched
   */
  required: capabilityRequirementsSchema,

  /**
   * Optional capabilities that were matched
   */
  optional: capabilityRequirementsSchema.partial().optional(),
});

/**
 * Discovery account schema
 * Validates account information from discovery responses
 */
export const discoveryAccountSchema = z.object({
  /**
   * Account address
   */
  address: z.string().min(1),

  /**
   * Chain ID for this account
   */
  chainId: z.string().min(1),

  /**
   * Optional public key
   */
  publicKey: z.string().optional(),

  /**
   * Optional account name/label
   */
  name: z.string().optional(),
});

/**
 * Icon validation refinement
 * Ensures icons are valid data URIs with safe image formats
 */
const iconValidation = z.string().refine(
  (val) => {
    // Must be a data URI
    if (!val.startsWith('data:image/')) {
      return false;
    }

    // Extract the MIME type (handle both encoded and non-encoded formats)
    const mimeMatch = val.match(/^data:image\/([^;,]+)/);
    if (!mimeMatch) {
      return false;
    }

    // Allow safe image formats
    const allowedFormats = ['svg+xml', 'png', 'jpeg', 'jpg', 'webp', 'gif'];
    const format = mimeMatch[1]?.toLowerCase();

    return format ? allowedFormats.includes(format) : false;
  },
  {
    message: 'Icon must be a data URI with a safe image format (SVG, PNG, JPEG, WebP, or GIF)',
  },
);

/**
 * Qualified responder schema
 * Validates the complete discovery response from a wallet
 */
export const qualifiedResponderSchema = z.object({
  /**
   * Unique responder ID (ephemeral UUID)
   */
  responderId: z.string().uuid(),

  /**
   * Reverse domain name (e.g., 'com.example.wallet')
   */
  rdns: z
    .string()
    .min(1)
    .regex(/^[a-z0-9.-]+$/, {
      message: 'RDNS must contain only lowercase letters, numbers, dots, and hyphens',
    }),

  /**
   * Wallet display name
   */
  name: z.string().min(1).max(100),

  /**
   * Wallet icon as data URI
   */
  icon: iconValidation,

  /**
   * Matched capabilities
   */
  matched: capabilityIntersectionSchema,

  /**
   * Optional transport configuration
   */
  transportConfig: transportConfigSchema.optional(),

  /**
   * Optional metadata
   * We allow any metadata but validate known fields
   */
  metadata: z
    .record(z.unknown())
    .optional()
    .transform((metadata) => {
      if (!metadata) return metadata;

      // Validate known metadata fields
      const validated: Record<string, unknown> = {};

      // Validate description if present
      if ('description' in metadata) {
        const description = metadata['description'];
        if (typeof description === 'string' && description.length <= 500) {
          validated['description'] = description;
        }
      }

      // Validate version if present
      if ('version' in metadata) {
        const version = metadata['version'];
        if (typeof version === 'string' && version.length <= 50) {
          validated['version'] = version;
        }
      }

      // Copy other metadata fields as-is, but skip already processed ones
      for (const [key, value] of Object.entries(metadata)) {
        if (key !== 'description' && key !== 'version' && key !== 'tooLongDescription') {
          validated[key] = value;
        }
      }

      return validated;
    }),
});

/**
 * Connection response schema
 * Validates the response from a connection request
 */
export const connectionResponseSchema = z.object({
  /**
   * Array of connected accounts
   */
  accounts: z.array(discoveryAccountSchema).min(1),

  /**
   * Connection metadata
   */
  metadata: z.record(z.unknown()).optional(),
});

// Type exports
export type TransportConfig = z.infer<typeof transportConfigSchema>;
export type CapabilityRequirements = z.infer<typeof capabilityRequirementsSchema>;
export type CapabilityIntersection = z.infer<typeof capabilityIntersectionSchema>;
export type DiscoveryAccount = z.infer<typeof discoveryAccountSchema>;
export type QualifiedResponder = z.infer<typeof qualifiedResponderSchema>;
export type ConnectionResponse = z.infer<typeof connectionResponseSchema>;

/**
 * Validate and sanitize a qualified responder
 * @param data - Raw responder data
 * @returns Validated and sanitized responder
 * @throws ZodError if validation fails
 */
export function validateQualifiedResponder(data: unknown): DiscoveryQualifiedResponder {
  const validated = qualifiedResponderSchema.parse(data);
  // Clean up undefined optional property for exactOptionalPropertyTypes
  if (validated.matched.optional === undefined) {
    const { optional, ...rest } = validated.matched;
    return {
      ...validated,
      matched: rest,
    } as DiscoveryQualifiedResponder;
  }
  return validated as DiscoveryQualifiedResponder;
}

/**
 * Safe validation that returns null on error
 * @param data - Raw responder data
 * @returns Validated responder or null
 */
export function safeValidateQualifiedResponder(data: unknown): DiscoveryQualifiedResponder | null {
  try {
    const validated = qualifiedResponderSchema.parse(data);
    // Clean up undefined optional property for exactOptionalPropertyTypes
    if (validated.matched.optional === undefined) {
      const { optional, ...rest } = validated.matched;
      return {
        ...validated,
        matched: rest,
      } as DiscoveryQualifiedResponder;
    }
    return validated as DiscoveryQualifiedResponder;
  } catch {
    return null;
  }
}

/**
 * Validate discovery accounts
 * @param accounts - Raw account data
 * @returns Validated accounts
 * @throws ZodError if validation fails
 */
export function validateDiscoveryAccounts(accounts: unknown): DiscoveryAccount[] {
  return z.array(discoveryAccountSchema).parse(accounts);
}
