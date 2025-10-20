/**
 * Mock for @walletmesh/modal-core/providers/aztec utilities
 * Works with the mocked @aztec/aztec.js AztecAddress class
 */
import { AztecAddress } from '@aztec/aztec.js';

/**
 * Check if a value is an AztecAddress instance
 */
export function isAztecAddressValue(value) {
  return value instanceof AztecAddress;
}

/**
 * Normalize a value to an AztecAddress instance
 */
export function normalizeAztecAddress(value, label = 'address') {
  if (value instanceof AztecAddress) {
    return value;
  }

  if (typeof value === 'string') {
    return AztecAddress.fromString(value);
  }

  // Handle objects with toString method
  if (value && typeof value.toString === 'function') {
    const str = value.toString();
    if (typeof str === 'string') {
      return AztecAddress.fromString(str);
    }
  }

  throw new Error(`Cannot normalize ${label}: invalid value`);
}

/**
 * Format a value as an Aztec address string
 */
export function formatAztecAddress(value, label = 'address') {
  const address = normalizeAztecAddress(value, label);
  return address.toString();
}

/**
 * Ensure contract class is registered (mock implementation)
 */
export async function ensureContractClassRegistered() {
  // Mock implementation - does nothing
  return undefined;
}

/**
 * Normalize artifact (mock implementation)
 */
export function normalizeArtifact(artifact) {
  // Mock implementation - returns artifact as-is
  return artifact;
}

/**
 * Get contract at address (mock implementation for lazy import)
 */
export async function getContractAt(_wallet, _address, _artifact) {
  // Mock implementation - returns a mock contract
  return {
    address: _address,
    methods: {},
  };
}
