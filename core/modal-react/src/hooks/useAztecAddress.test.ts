import { renderHook } from '@testing-library/react';
import { AztecAddress } from '@aztec/aztec.js';
import { describe, expect, it } from 'vitest';
import { useAztecAddress } from './useAztecAddress.js';

const SAMPLE_ADDRESS = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

describe('useAztecAddress', () => {
  it('returns nulls when no value provided', () => {
    const { result } = renderHook(() => useAztecAddress());

    expect(result.current.address).toBeNull();
    expect(result.current.addressString).toBeNull();
    expect(result.current.isAztecAddress(SAMPLE_ADDRESS)).toBe(false);
  });

  it('normalizes string input', () => {
    const { result } = renderHook(() => useAztecAddress(SAMPLE_ADDRESS));

    expect(result.current.address).toBeInstanceOf(AztecAddress);
    expect(result.current.addressString).toBe(SAMPLE_ADDRESS.toLowerCase());
  });

  it('converts to AztecAddress using helper', () => {
    const { result } = renderHook(() => useAztecAddress());

    const address = result.current.toAztecAddress(SAMPLE_ADDRESS);
    expect(address).toBeInstanceOf(AztecAddress);
    expect(address.toString()).toBe(SAMPLE_ADDRESS.toLowerCase());
  });

  it('accepts AztecAddress instances without modification', () => {
    const original = AztecAddress.fromString(SAMPLE_ADDRESS);
    const { result } = renderHook(() => useAztecAddress());

    const converted = result.current.toAztecAddress(original);
    expect(converted).toBe(original);
  });

  it('provides string representation helper', () => {
    const { result } = renderHook(() => useAztecAddress());

    // toUpperCase on full address would also uppercase the 'x' in '0x', so we uppercase only the hex part
    const uppercaseAddress = `0x${SAMPLE_ADDRESS.slice(2).toUpperCase()}`;
    const str = result.current.toAddressString(uppercaseAddress);
    expect(str).toBe(SAMPLE_ADDRESS.toLowerCase());
  });

  it('throws helpful error for invalid input', () => {
    const { result } = renderHook(() => useAztecAddress());

    expect(() => result.current.toAztecAddress('not-an-address')).toThrow(/Invalid address/i);
  });
});
