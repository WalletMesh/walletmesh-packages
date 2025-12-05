/**
 * Type definitions for enhanced parameter information and formatted values
 *
 * @module types
 * @packageDocumentation
 */

import type { AbiType } from '@aztec/aztec.js/abi';

/**
 * Enhanced parameter information that preserves full ABI type
 *
 * This extends the basic parameter info to include the complete AbiType object
 * from the contract artifact, enabling type-aware value formatting.
 */
export interface EnhancedParameterInfo {
  /** The parameter name from the contract */
  name: string;

  /** The full ABI type object from Aztec */
  abiType: AbiType;

  /** Human-readable type string for display */
  typeString: string;
}

/**
 * Formatted value for display in UI
 *
 * Provides both a formatted version for display and the raw value
 * for copying/verification.
 */
export interface FormattedValue {
  /** Human-readable formatted value for display */
  display: string;

  /** Original raw value (hex, decimal, etc.) */
  raw: string;

  /** Whether to show a copy button for this value */
  copyable: boolean;
}
