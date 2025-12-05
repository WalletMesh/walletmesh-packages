/**
 * Value formatting utilities for displaying contract arguments
 *
 * Provides type-aware formatting for Aztec contract function arguments
 * based on ABI type information.
 *
 * @module formatters
 * @packageDocumentation
 */

import type { AbiType } from '@aztec/aztec.js/abi';
import type { FormattedValue } from './types.js';

/**
 * Format argument value based on ABI type for display
 *
 * @param value - The argument value to format
 * @param abiType - The ABI type from the contract artifact
 * @returns Formatted value with display and raw representations
 *
 * @example
 * ```typescript
 * const formatted = formatArgumentValue(
 *   '0x07ad992ffcf83a154156605c4afeba3fdd3edd124a71a6653b66914659407d4d',
 *   { kind: 'field' }
 * );
 * console.log(formatted.display); // '0x07ad99...59407d4d'
 * console.log(formatted.raw); // Full hex string
 * console.log(formatted.copyable); // true
 * ```
 *
 * @public
 */
export function formatArgumentValue(value: unknown, abiType: AbiType): FormattedValue {
  switch (abiType.kind) {
    case 'field':
      return formatFieldValue(value);

    case 'boolean':
      return {
        display: String(value),
        raw: String(value),
        copyable: false,
      };

    case 'integer':
      return formatIntegerValue(value, abiType);

    case 'array':
      return formatArrayValue(value, abiType);

    case 'struct':
      return formatStructValue(value, abiType);

    case 'string':
      return {
        display: `"${value}"`,
        raw: String(value),
        copyable: true,
      };

    default:
      return formatDefaultValue(value);
  }
}

/**
 * Format Field values: show shortened hex for long values
 *
 * @param value - The field value to format
 * @returns Formatted field value
 *
 * @internal
 */
function formatFieldValue(value: unknown): FormattedValue {
  const hexStr = String(value);

  // Shorten long hex values (keep first 10 and last 8 characters)
  const display = hexStr.length > 20 ? `${hexStr.slice(0, 10)}...${hexStr.slice(-8)}` : hexStr;

  return {
    display,
    raw: hexStr,
    copyable: true,
  };
}

/**
 * Format integer values with locale formatting
 *
 * @param value - The integer value to format
 * @param _abiType - The integer ABI type (reserved for future use)
 * @returns Formatted integer value
 *
 * @internal
 */
function formatIntegerValue(value: unknown, _abiType: AbiType): FormattedValue {
  try {
    const num = BigInt(String(value));
    return {
      display: num.toLocaleString(),
      raw: String(value),
      copyable: false,
    };
  } catch {
    // Fallback if BigInt conversion fails
    return formatDefaultValue(value);
  }
}

/**
 * Format array values
 *
 * @param value - The array value to format
 * @param abiType - The array ABI type
 * @returns Formatted array value
 *
 * @internal
 */
function formatArrayValue(value: unknown, abiType: AbiType): FormattedValue {
  if (!Array.isArray(value)) {
    return formatDefaultValue(value);
  }

  // Type guard to check if abiType is an array type
  if (abiType.kind !== 'array') {
    return formatDefaultValue(value);
  }

  const elementType = abiType.type;
  const formattedElements = value.map((v) => formatArgumentValue(v, elementType).display);

  // For short arrays, show inline; for long arrays, indicate count
  const display =
    formattedElements.length <= 3
      ? `[${formattedElements.join(', ')}]`
      : `[${formattedElements.length} elements]`;

  return {
    display,
    raw: JSON.stringify(value, null, 2),
    copyable: true,
  };
}

/**
 * Format struct values (show as expandable object)
 *
 * @param value - The struct value to format
 * @param abiType - The struct ABI type
 * @returns Formatted struct value
 *
 * @internal
 */
function formatStructValue(value: unknown, abiType: AbiType): FormattedValue {
  // Type guard to check if abiType is a struct type
  const structName = abiType.kind === 'struct' ? abiType.path || 'struct' : 'struct';

  return {
    display: `${structName} { ... }`,
    raw: JSON.stringify(value, null, 2),
    copyable: true,
  };
}

/**
 * Fallback formatter for unknown types
 *
 * @param value - The value to format
 * @returns Formatted value
 *
 * @internal
 */
function formatDefaultValue(value: unknown): FormattedValue {
  const str = String(value);

  // Shorten very long strings
  const display = str.length > 50 ? `${str.slice(0, 47)}...` : str;

  return {
    display,
    raw: str,
    copyable: true,
  };
}
