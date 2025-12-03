/**
 * @fileoverview Testing utilities for schema validation
 */

import { z, ZodError, type ZodSchema } from 'zod';
import { expect } from 'vitest';

// ============================================================================
// SCHEMA TESTING UTILITIES
// ============================================================================

/**
 * Test that a schema accepts valid input
 */
export function expectSchemaToAccept<T>(schema: ZodSchema<T>, input: unknown, message?: string): T {
  try {
    const result = schema.parse(input);
    return result;
  } catch (error) {
    const zodError = error as ZodError;
    const errorMessage = message || 'Schema should accept input';
    throw new Error(`${errorMessage}\n${JSON.stringify(zodError.errors, null, 2)}`);
  }
}

/**
 * Test that a schema rejects invalid input
 */
export function expectSchemaToReject(
  schema: ZodSchema,
  input: unknown,
  expectedError?: string | RegExp,
  message?: string,
): void {
  try {
    schema.parse(input);
    throw new Error(message || 'Schema should reject input but accepted it');
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    if (expectedError) {
      const errorMessages = error.errors.map((e) => e.message).join(', ');
      if (typeof expectedError === 'string') {
        expect(errorMessages).toContain(expectedError);
      } else {
        expect(errorMessages).toMatch(expectedError);
      }
    }
  }
}

/**
 * Test schema with multiple valid inputs
 */
export function testSchemaWithValidInputs<T>(
  schema: ZodSchema<T>,
  validInputs: Array<{ input: unknown; description?: string; expected?: Partial<T> }>,
): void {
  for (const { input, description, expected } of validInputs) {
    const testDescription = description || `should accept ${JSON.stringify(input)}`;
    try {
      const result = schema.parse(input);
      if (expected) {
        for (const [key, value] of Object.entries(expected)) {
          expect(result[key as keyof T]).toEqual(value);
        }
      }
    } catch (error) {
      const zodError = error as ZodError;
      throw new Error(`${testDescription}\n${JSON.stringify(zodError.errors, null, 2)}`);
    }
  }
}

/**
 * Test schema with multiple invalid inputs
 */
export function testSchemaWithInvalidInputs(
  schema: ZodSchema,
  invalidInputs: Array<{
    input: unknown;
    description?: string;
    expectedError?: string | RegExp;
  }>,
): void {
  for (const { input, description, expectedError } of invalidInputs) {
    const testDescription = description || `should reject ${JSON.stringify(input)}`;
    expectSchemaToReject(schema, input, expectedError, testDescription);
  }
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate a valid EVM address
 */
export function generateEvmAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

/**
 * Generate a valid Solana address (base58)
 */
export function generateSolanaAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let address = '';
  for (let i = 0; i < 44; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

/**
 * Generate a valid Aztec address
 */
export function generateAztecAddress(): string {
  return `aztec-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate mock wallet info
 */
export function generateMockWalletInfo(overrides?: Partial<unknown>) {
  return {
    id: 'debug-wallet',
    name: 'Debug Wallet',
    icon: 'https://example.com/icon.png',
    chains: [{ chainId: '1', chainType: 'evm' }],
    features: ['eip1193'],
    mobile: false,
    desktop: true,
    ...overrides,
  };
}

/**
 * Generate mock chain config
 */
export function generateMockChainConfig(chainType: 'evm' | 'solana' | 'aztec', overrides?: Partial<unknown>) {
  const baseConfig = {
    name: 'Test Chain',
    rpcUrls: [{ url: 'https://rpc.example.com' }],
    nativeCurrency: {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
    },
  };

  switch (chainType) {
    case 'evm':
      return {
        ...baseConfig,
        chainId: '1',
        chainType: 'evm',
        ...overrides,
      };
    case 'solana':
      return {
        ...baseConfig,
        chainId: 'solana:mainnet-beta',
        chainType: 'solana',
        nativeCurrency: {
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9,
        },
        ...overrides,
      };
    case 'aztec':
      return {
        ...baseConfig,
        chainId: 'aztec:mainnet',
        chainType: 'aztec',
        ...overrides,
      };
  }
}

// ============================================================================
// SCHEMA VALIDATION HELPERS
// ============================================================================

/**
 * Check if a value matches a schema without throwing
 */
export function isValidSchema<T>(schema: ZodSchema<T>, value: unknown): value is T {
  return schema.safeParse(value).success;
}

/**
 * Get validation errors for a value
 */
export function getSchemaErrors(schema: ZodSchema, value: unknown): string[] {
  const result = schema.safeParse(value);
  if (result.success) {
    return [];
  }
  return result.error.errors.map((e) => e.message);
}

/**
 * Create a partial schema for testing
 */
export function createPartialSchema<T extends z.ZodRawShape>(
  shape: T,
): z.ZodObject<{ [k in keyof T]: z.ZodOptional<T[k]> }, 'strip', z.ZodTypeAny, unknown, unknown> {
  return z.object(shape).partial();
}

/**
 * Test schema defaults
 */
export function testSchemaDefaults<T>(schema: ZodSchema<T>, expectedDefaults: Partial<T>): void {
  const result = schema.parse({});
  for (const [key, value] of Object.entries(expectedDefaults)) {
    expect(result[key as keyof T]).toEqual(value);
  }
}

// ============================================================================
// COMPLEX VALIDATION SCENARIOS
// ============================================================================

/**
 * Test discriminated union schemas
 */
export function testDiscriminatedUnion<T extends { type: string }>(
  schema: ZodSchema<T>,
  cases: Array<{
    type: string;
    validInput: unknown;
    invalidInput?: unknown;
  }>,
): void {
  for (const { type, validInput, invalidInput } of cases) {
    // Test valid input
    expectSchemaToAccept(schema, validInput, `Should accept ${type} variant`);

    // Test invalid input if provided
    if (invalidInput) {
      expectSchemaToReject(schema, invalidInput, undefined, `Should reject invalid ${type} variant`);
    }
  }
}

/**
 * Test schema refinements
 */
export function testSchemaRefinements(
  schema: ZodSchema,
  refinementCases: Array<{
    input: unknown;
    shouldPass: boolean;
    description: string;
    expectedError?: string;
  }>,
): void {
  for (const { input, shouldPass, description, expectedError } of refinementCases) {
    if (shouldPass) {
      expectSchemaToAccept(schema, input, description);
    } else {
      expectSchemaToReject(schema, input, expectedError, description);
    }
  }
}

/**
 * Test optional fields with various undefined/null combinations
 */
export function testOptionalFields<T>(
  schema: ZodSchema<T>,
  requiredFields: Record<string, unknown>,
  optionalFields: string[],
): void {
  // Test with only required fields
  expectSchemaToAccept(schema, requiredFields, 'Should accept with only required fields');

  // Test with each optional field set to undefined
  for (const field of optionalFields) {
    const input = { ...requiredFields, [field]: undefined };
    expectSchemaToAccept(schema, input, `Should accept with ${field} as undefined`);
  }

  // Test with all optional fields present
  const allFields = { ...requiredFields };
  for (const field of optionalFields) {
    allFields[field] = 'test-value';
  }
  expectSchemaToAccept(schema, allFields, 'Should accept with all optional fields');
}

// ============================================================================
// ERROR MESSAGE TESTING
// ============================================================================

/**
 * Test that schema produces specific error messages
 */
export function testSchemaErrorMessages(
  schema: ZodSchema,
  errorCases: Array<{
    input: unknown;
    expectedPath: (string | number)[];
    expectedMessage: string | RegExp;
  }>,
): void {
  for (const { input, expectedPath, expectedMessage } of errorCases) {
    try {
      schema.parse(input);
      throw new Error('Schema should have rejected input');
    } catch (error) {
      if (!(error instanceof ZodError)) {
        throw error;
      }

      const matchingError = error.errors.find((e) => JSON.stringify(e.path) === JSON.stringify(expectedPath));

      if (!matchingError) {
        throw new Error(`No error found at path ${JSON.stringify(expectedPath)}`);
      }

      if (typeof expectedMessage === 'string') {
        expect(matchingError.message).toBe(expectedMessage);
      } else {
        expect(matchingError.message).toMatch(expectedMessage);
      }
    }
  }
}

// ============================================================================
// PERFORMANCE TESTING
// ============================================================================

/**
 * Test schema parsing performance
 */
export function testSchemaPerformance(schema: ZodSchema, input: unknown, maxDurationMs = 100): void {
  const startTime = performance.now();

  // Run multiple iterations to get a stable measurement
  const iterations = 1000;
  for (let i = 0; i < iterations; i++) {
    schema.parse(input);
  }

  const endTime = performance.now();
  const averageDuration = (endTime - startTime) / iterations;

  expect(averageDuration).toBeLessThan(maxDurationMs);
}
