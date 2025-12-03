/**
 * @fileoverview CAIP-2 Chain Agnostic Improvement Proposal validation schemas
 * @module schemas/caip2
 *
 * CAIP-2 defines a standard way to identify blockchain networks using the format:
 * namespace:reference
 *
 * This module provides comprehensive Zod schemas for validating CAIP-2 identifiers
 * with namespace-specific validation rules and transformation capabilities.
 */

import { z } from 'zod';

// ============================================================================
// CAIP-2 BASE SCHEMAS
// ============================================================================

/**
 * CAIP-2 namespace validation
 * - Must be 3-8 lowercase alphanumeric characters
 * - Examples: eip155, solana, aztec, cosmos, polkadot
 */
const caip2NamespaceSchema = z
  .string()
  .regex(/^[a-z0-9]{3,8}$/, 'Namespace must be 3-8 lowercase alphanumeric characters');

/**
 * CAIP-2 reference validation (generic)
 * - Must be 1-32 characters (alphanumeric, underscore, hyphen)
 * - More specific validation applied per namespace
 */
const caip2ReferenceSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]{1,64}$/, 'Reference must be 1-64 characters (alphanumeric, underscore, hyphen)');

/**
 * CAIP-2 format validation (basic structure)
 * Validates the namespace:reference format without namespace-specific rules
 */
export const caip2FormatSchema = z
  .string()
  .regex(/^[a-z0-9]{3,8}:[a-zA-Z0-9_-]{1,64}$/, 'Invalid CAIP-2 format. Expected: namespace:reference');

/**
 * CAIP-2 parts schema for parsing
 */
export const caip2PartsSchema = z.object({
  /** The namespace (e.g., 'eip155', 'solana', 'aztec') */
  namespace: caip2NamespaceSchema,
  /** The reference within the namespace */
  reference: caip2ReferenceSchema,
});

/**
 * CAIP-2 parsing schema with transformation
 * Parses a CAIP-2 string into namespace and reference parts
 */
export const caip2ParseSchema = z
  .string()
  .regex(/^([a-z0-9]{3,8}):([a-zA-Z0-9_-]{1,64})$/, 'Invalid CAIP-2 format. Expected: namespace:reference')
  .transform((value) => {
    const parts = value.split(':');
    const namespace = parts[0] ?? '';
    const reference = parts[1] ?? '';
    return {
      namespace,
      reference,
      chainId: value,
    };
  });

// ============================================================================
// NAMESPACE-SPECIFIC SCHEMAS
// ============================================================================

/**
 * EVM (EIP-155) namespace validation
 * Reference must be a numeric chain ID (as string)
 * Examples: eip155:1, eip155:137, eip155:42161
 */
export const evmCAIP2Schema = z
  .string()
  .regex(/^eip155:\d+$/, 'Invalid EVM CAIP-2 format. Expected: eip155:chainId (numeric)')
  .refine((value) => {
    const reference = value.split(':')[1];
    const chainId = Number(reference);
    return !Number.isNaN(chainId) && chainId > 0 && chainId <= Number.MAX_SAFE_INTEGER;
  }, 'EVM chain ID must be a positive integer within safe range');

/**
 * Solana namespace validation
 * Reference can be either a well-known network name or genesis hash
 * Examples: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp, solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z
 */
export const solanaCAIP2Schema = z
  .string()
  .regex(/^solana:[a-zA-Z0-9_-]{1,64}$/, 'Invalid Solana CAIP-2 format. Expected: solana:reference')
  .refine((value) => {
    const parts = value.split(':');
    const reference = parts[1] ?? '';
    // Well-known Solana networks or base58-like genesis hashes
    const wellKnownNetworks = ['mainnet-beta', 'devnet', 'testnet', 'localnet'];
    const isWellKnown = wellKnownNetworks.includes(reference);
    const isGenesisHash = /^[1-9A-HJ-NP-Za-km-z]{32}$/.test(reference); // Base58 format

    return isWellKnown || isGenesisHash;
  }, 'Solana reference must be a well-known network or valid genesis hash');

/**
 * Aztec namespace validation
 * Reference can be mainnet, testnet, or numeric for local/sandbox
 * Examples: aztec:mainnet, aztec:testnet, aztec:31337
 */
export const aztecCAIP2Schema = z
  .string()
  .regex(/^aztec:[a-zA-Z0-9_-]{1,64}$/, 'Invalid Aztec CAIP-2 format. Expected: aztec:reference')
  .refine((value) => {
    const parts = value.split(':');
    const reference = parts[1] ?? '';
    // Well-known Aztec networks or numeric for sandbox/local
    const wellKnownNetworks = ['mainnet', 'testnet'];
    const isWellKnown = wellKnownNetworks.includes(reference);
    const isNumeric = /^\d+$/.test(reference);

    return isWellKnown || isNumeric;
  }, 'Aztec reference must be mainnet, testnet, or numeric for sandbox/local');

// ============================================================================
// COMPREHENSIVE CAIP-2 SCHEMA
// ============================================================================

/**
 * Comprehensive CAIP-2 schema with namespace-specific validation
 * Validates the format and applies namespace-specific rules
 */
export const caip2Schema = z.string().refine((value) => {
  // Parse namespace
  const parts = value.split(':');
  if (parts.length !== 2) return false;

  const namespace = parts[0];

  // Use namespace-specific validation for known namespaces
  if (namespace === 'eip155') {
    return evmCAIP2Schema.safeParse(value).success;
  }
  if (namespace === 'solana') {
    return solanaCAIP2Schema.safeParse(value).success;
  }
  if (namespace === 'aztec') {
    return aztecCAIP2Schema.safeParse(value).success;
  }

  // For unknown namespaces, use basic format validation
  return caip2FormatSchema.safeParse(value).success;
}, 'Invalid CAIP-2 format or namespace-specific validation failed');

/**
 * CAIP-2 schema with detailed parsing and validation
 * Returns parsed parts along with validation
 */
export const caip2DetailedSchema = z
  .string()
  .pipe(caip2ParseSchema)
  .refine((parsed) => {
    // Apply namespace-specific validation
    const fullChainId = parsed.chainId;

    try {
      return caip2Schema.safeParse(fullChainId).success;
    } catch {
      return false;
    }
  }, 'Chain ID failed namespace-specific validation');

/**
 * CAIP-2 normalization schema
 * Ensures consistent format and validates - CAIP-2 format only
 */
export const caip2NormalizationSchema = z
  .string()
  .transform((value) => {
    // Basic cleanup (trim and ensure proper case)
    return value.trim();
  })
  .pipe(caip2Schema);

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * Schema for extracting namespace from CAIP-2 ID
 */
export const extractNamespaceSchema = caip2Schema.transform((chainId) => chainId.split(':')[0] || '');

/**
 * Schema for extracting reference from CAIP-2 ID
 */
export const extractReferenceSchema = caip2Schema.transform((chainId) => chainId.split(':')[1] || '');

/**
 * Schema for validating array of CAIP-2 IDs
 */
export const caip2ArraySchema = z.array(caip2Schema);

/**
 * Schema for CAIP-2 ID with optional fallback
 */
export const optionalCAIP2Schema = z
  .union([caip2Schema, z.null(), z.undefined()])
  .transform((value) => value || null);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

/** Base CAIP-2 string type */
export type CAIP2String = z.infer<typeof caip2Schema>;

/** CAIP-2 parts after parsing */
export type CAIP2Parts = z.infer<typeof caip2PartsSchema>;

/** Detailed CAIP-2 parsing result */
export type CAIP2Detailed = z.infer<typeof caip2DetailedSchema>;

/** EVM-specific CAIP-2 string */
export type EVMCAIP2 = z.infer<typeof evmCAIP2Schema>;

/** Solana-specific CAIP-2 string */
export type SolanaCAIP2 = z.infer<typeof solanaCAIP2Schema>;

/** Aztec-specific CAIP-2 string */
export type AztecCAIP2 = z.infer<typeof aztecCAIP2Schema>;

/** Optional CAIP-2 string */
export type OptionalCAIP2 = z.infer<typeof optionalCAIP2Schema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Type guard for CAIP-2 strings using Zod validation
 */
export function isCAIP2(value: unknown): value is CAIP2String {
  return caip2Schema.safeParse(value).success;
}

/**
 * Parse and validate CAIP-2 string
 */
export function parseCAIP2(value: string): CAIP2Parts | null {
  const result = caip2ParseSchema.safeParse(value);
  if (!result.success) {
    return null;
  }

  return {
    namespace: result.data.namespace,
    reference: result.data.reference,
  };
}

/**
 * Validate and normalize CAIP-2 string
 * Only accepts valid CAIP-2 format strings
 */
export function normalizeCAIP2(value: string): CAIP2String {
  return caip2NormalizationSchema.parse(value);
}

/**
 * Extract namespace from CAIP-2 string
 */
export function extractNamespace(chainId: CAIP2String): string {
  return extractNamespaceSchema.parse(chainId);
}

/**
 * Extract reference from CAIP-2 string
 */
export function extractReference(chainId: CAIP2String): string {
  return extractReferenceSchema.parse(chainId);
}
