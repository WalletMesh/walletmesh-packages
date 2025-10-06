/**
 * Aztec address normalization hook
 *
 * Provides helper utilities for normalizing values into Aztec addresses or
 * their canonical hexadecimal string representation. This makes it easy for
 * dApps to accept flexible input (strings, AztecAddress instances, objects
 * exposing `toString()`/`toBuffer()`) while keeping the final form explicit.
 *
 * @module hooks/useAztecAddress
 * @packageDocumentation
 */

import { AztecAddress } from '@aztec/aztec.js';
import { ErrorFactory } from '@walletmesh/modal-core';
import { useMemo } from 'react';

/**
 * Result of {@link useAztecAddress}.
 *
 * @public
 */
export interface UseAztecAddressReturn {
  /** Normalized {@link AztecAddress} from the provided value (if supplied). */
  address: AztecAddress | null;
  /** Hex string representation from the provided value (if supplied). */
  addressString: string | null;
  /** Type guard to check if a value is already an {@link AztecAddress}. */
  isAztecAddress: (value: unknown) => value is AztecAddress;
  /** Normalize an arbitrary value into an {@link AztecAddress}. */
  toAztecAddress: (value: unknown, label?: string) => AztecAddress;
  /** Normalize an arbitrary value into a checksummed hex string. */
  toAddressString: (value: unknown, label?: string) => string;
}

function isAztecAddress(value: unknown): value is AztecAddress {
  return value instanceof AztecAddress;
}

function asAztecAddress(value: unknown, label = 'address'): AztecAddress {
  if (value === undefined || value === null) {
    throw ErrorFactory.invalidParams(`No ${label} provided`);
  }

  if (isAztecAddress(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return AztecAddress.fromString(value);
    } catch (error) {
      throw ErrorFactory.invalidParams(`Invalid ${label}: ${(error as Error).message}`);
    }
  }

  if (typeof value === 'object') {
    const stringValue = (value as { toString?: () => unknown }).toString?.();
    if (typeof stringValue === 'string') {
      try {
        return AztecAddress.fromString(stringValue);
      } catch (error) {
        throw ErrorFactory.invalidParams(`Invalid ${label}: ${(error as Error).message}`);
      }
    }
  }

  throw ErrorFactory.invalidParams(`Invalid ${label}: expected Aztec address-like input`);
}

function asAddressString(value: unknown, label = 'address'): string {
  return asAztecAddress(value, label).toString();
}

/**
 * Normalize addresses while keeping helper utilities readily available.
 *
 * @param value - Optional initial address-like value to normalize.
 * @returns Helper functions and the normalized address/string (if possible).
 *
 * @example
 * ```tsx
 * const { toAztecAddress, toAddressString } = useAztecAddress();
 *
 * const owner = toAztecAddress(inputFromForm);
 * const hex = toAddressString(owner);
 * ```
 *
 * @public
 */
export function useAztecAddress(value?: unknown): UseAztecAddressReturn {
  const helpers = useMemo(
    () => ({
      isAztecAddress,
      toAztecAddress: asAztecAddress,
      toAddressString: asAddressString,
    }),
    [],
  );

  const address = useMemo(() => {
    if (value === undefined || value === null) {
      return null;
    }
    try {
      return helpers.toAztecAddress(value);
    } catch (_error) {
      return null;
    }
  }, [value, helpers]);

  const addressString = useMemo(() => {
    if (!address) {
      return null;
    }
    return address.toString();
  }, [address]);

  return {
    address,
    addressString,
    ...helpers,
  };
}

export default useAztecAddress;
