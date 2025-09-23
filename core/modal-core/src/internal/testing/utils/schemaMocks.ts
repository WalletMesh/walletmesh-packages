/**
 * Schema validation mock utilities for modal-core testing
 *
 * Provides standardized mock implementations for Zod schema validation
 * across test files. Eliminates repetitive schema mock setup and ensures
 * consistent validation testing patterns.
 *
 * @packageDocumentation
 * @internal
 */

import { type Mock, vi } from 'vitest';

/**
 * Configuration for schema validation behavior
 * @interface SchemaMockConfig
 */
export interface SchemaMockConfig {
  /** Whether validation should pass by default */
  shouldPass?: boolean;
  /** Custom validation logic */
  customValidator?: (input: unknown) => boolean;
  /** Error message for validation failures */
  errorMessage?: string;
  /** Fields that should trigger validation failure */
  failureFields?: string[];
  /** Values that should trigger validation failure */
  failureValues?: unknown[];
}

/**
 * Creates a mock schema with configurable validation behavior
 *
 * Provides a standardized way to mock Zod schema validation with
 * predictable success/failure patterns.
 *
 * @param {SchemaMockConfig} config - Configuration for validation behavior
 * @returns Mock schema object with parse method
 *
 * @example
 * ```typescript
 * const mockSchema = createMockSchema({
 *   shouldPass: false,
 *   errorMessage: 'Validation failed: invalid field',
 *   failureFields: ['invalid']
 * });
 *
 * // Usage in test
 * vi.mocked(schemas.walletInfoSchema).parse = mockSchema.parse;
 * ```
 */
export function createMockSchema<T = unknown>(config: SchemaMockConfig = {}) {
  const {
    shouldPass = true,
    customValidator,
    errorMessage = 'Validation failed',
    failureFields = ['invalid'],
    failureValues = [true],
  } = config;

  return {
    parse: vi.fn().mockImplementation((input: unknown): T => {
      // Custom validation logic takes precedence
      if (customValidator) {
        if (!customValidator(input)) {
          throw new Error(errorMessage);
        }
        return input as T;
      }

      // Default failure behavior
      if (!shouldPass) {
        throw new Error(errorMessage);
      }

      // Check for failure fields/values
      if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
        const obj = input as Record<string, unknown>;

        for (const field of failureFields) {
          if (field in obj && failureValues.includes(obj[field as keyof typeof obj])) {
            throw new Error(`Validation failed: ${field} field`);
          }
        }
      }

      // Default success
      return input as T;
    }),
  };
}

/**
 * Helper to check if config is per-schema
 * @param {SchemaMockConfig | Record<string, SchemaMockConfig>} config - Configuration to check
 * @returns {boolean} True if config is per-schema mapping, false if single config
 */
function isPerSchemaConfig(
  config: SchemaMockConfig | Record<string, SchemaMockConfig>,
): config is Record<string, SchemaMockConfig> {
  // If it has schema mock config properties, it's a single config
  if (
    'shouldPass' in config ||
    'customValidator' in config ||
    'errorMessage' in config ||
    'failureFields' in config ||
    'failureValues' in config
  ) {
    return false;
  }
  return true;
}

/**
 * Standard schema mock configurations for common validation patterns
 */
export const SCHEMA_MOCK_CONFIGS = {
  /** Always passes validation */
  ALWAYS_PASS: { shouldPass: true } as SchemaMockConfig,

  /** Always fails validation */
  ALWAYS_FAIL: { shouldPass: false, errorMessage: 'Schema validation failed' } as SchemaMockConfig,

  /** Fails when 'invalid' field is true */
  FAIL_ON_INVALID: {
    shouldPass: true,
    failureFields: ['invalid'] as string[],
    failureValues: [true] as unknown[],
    errorMessage: 'Validation failed: invalid field',
  } as SchemaMockConfig,

  /** Fails when 'error' field is present */
  FAIL_ON_ERROR: {
    shouldPass: true,
    failureFields: ['error'] as string[],
    failureValues: [true, 'error', new Error()] as unknown[],
    errorMessage: 'Validation failed: error field',
  } as SchemaMockConfig,

  /** Configuration schema validation */
  CONFIG_VALIDATION: {
    shouldPass: true,
    customValidator: (input: unknown) => {
      if (typeof input !== 'object' || input === null) return false;
      const obj = input as Record<string, unknown>;
      return !('invalidConfig' in obj);
    },
    errorMessage: 'Invalid configuration',
  } as SchemaMockConfig,

  /** Wallet info validation */
  WALLET_INFO_VALIDATION: {
    shouldPass: true,
    customValidator: (input: unknown) => {
      if (typeof input !== 'object' || input === null) return false;
      const obj = input as Record<string, unknown>;
      return obj['id'] !== 'invalid-wallet' && obj['name'] !== '';
    },
    errorMessage: 'Invalid wallet info',
  } as SchemaMockConfig,

  /** Connection validation */
  CONNECTION_VALIDATION: {
    shouldPass: true,
    customValidator: (input: unknown) => {
      if (typeof input !== 'object' || input === null) return false;
      const obj = input as Record<string, unknown>;
      return obj['state'] !== 'invalid' && obj['result'] !== false;
    },
    errorMessage: 'Invalid connection data',
  } as SchemaMockConfig,
} as const satisfies Record<string, SchemaMockConfig>;

/**
 * Setup function for common schema mocks
 *
 * Configures multiple schemas with standardized mock implementations.
 * Reduces boilerplate in test setup.
 *
 * @param {Record<string, { parse: Mock }>} schemas - Schema objects with parse methods to mock
 * @param {SchemaMockConfig | Record<string, SchemaMockConfig>} config - Mock configuration for all schemas or per-schema configs
 *
 * @example
 * ```typescript
 * beforeEach(async () => {
 *   const schemas = await import('../schemas/index.js');
 *   setupSchemaMocks(schemas, SCHEMA_MOCK_CONFIGS.FAIL_ON_INVALID);
 * });
 * ```
 */
export function setupSchemaMocks(
  schemas: Record<string, { parse: Mock }>,
  config: SchemaMockConfig | Record<string, SchemaMockConfig> = SCHEMA_MOCK_CONFIGS.FAIL_ON_INVALID,
) {
  // If config is a single configuration, apply to all schemas
  if (!isPerSchemaConfig(config)) {
    const mockSchema = createMockSchema(config);

    for (const schema of Object.values(schemas)) {
      if (schema && typeof schema.parse === 'function') {
        vi.mocked(schema.parse).mockImplementation(mockSchema.parse);
      }
    }
    return;
  }

  // Apply per-schema configurations
  const perSchemaConfig = config as Record<string, SchemaMockConfig>;

  for (const [schemaName, schema] of Object.entries(schemas)) {
    if (schema && typeof schema.parse === 'function') {
      const schemaConfig = perSchemaConfig[schemaName] || SCHEMA_MOCK_CONFIGS.FAIL_ON_INVALID;
      const mockSchema = createMockSchema(schemaConfig);
      vi.mocked(schema.parse).mockImplementation(mockSchema.parse);
    }
  }
}

/**
 * Advanced schema mock setup with specific schema targeting
 *
 * Allows fine-grained control over individual schema mocking.
 * Useful when different schemas need different validation behaviors.
 *
 * @param {Record<string, SchemaMockConfig>} schemaConfigs - Map of schema names to their specific mock configurations
 *
 * @example
 * ```typescript
 * setupAdvancedSchemaMocks({
 *   'walletInfoSchema': SCHEMA_MOCK_CONFIGS.WALLET_INFO_VALIDATION,
 *   'adapterConfigSchema': SCHEMA_MOCK_CONFIGS.CONFIG_VALIDATION,
 *   'transportConfigSchema': SCHEMA_MOCK_CONFIGS.ALWAYS_PASS
 * });
 * ```
 */
export async function setupAdvancedSchemaMocks(schemaConfigs: Record<string, SchemaMockConfig>) {
  const schemas = await import('../../../schemas/index.js');

  for (const [schemaName, config] of Object.entries(schemaConfigs)) {
    const schema = (schemas as Record<string, unknown>)[schemaName];
    if (schema && typeof schema === 'object' && 'parse' in schema && typeof schema.parse === 'function') {
      const mockSchema = createMockSchema(config);
      const parseFn = schema.parse as Mock;
      if (vi.isMockFunction(parseFn)) {
        parseFn.mockImplementation(mockSchema.parse);
      }
    }
  }
}

/**
 * Creates error test scenarios for schema validation
 *
 * Generates common error testing patterns for schema validation failures.
 * Useful for comprehensive error testing.
 *
 * @param {{ errorMessage: string }} baseConfig - Base configuration containing error message for failures
 * @returns {Array<{ name: string; input: unknown; expectedError: string; config: SchemaMockConfig }>} Array of test scenarios
 *
 * @example
 * ```typescript
 * const errorScenarios = createSchemaErrorScenarios({
 *   errorMessage: 'Validation failed'
 * });
 *
 * errorScenarios.forEach(({ name, input, expectedError }) => {
 *   it(`should handle ${name}`, () => {
 *     expect(() => mockSchema.parse(input)).toThrow(expectedError);
 *   });
 * });
 * ```
 */
export function createSchemaErrorScenarios(baseConfig: { errorMessage: string }) {
  return [
    {
      name: 'null input',
      input: null,
      expectedError: baseConfig.errorMessage,
      config: { shouldPass: false, errorMessage: baseConfig.errorMessage },
    },
    {
      name: 'undefined input',
      input: undefined,
      expectedError: baseConfig.errorMessage,
      config: { shouldPass: false, errorMessage: baseConfig.errorMessage },
    },
    {
      name: 'invalid object with error field',
      input: { error: true },
      expectedError: 'Validation failed: error field',
      config: SCHEMA_MOCK_CONFIGS.FAIL_ON_ERROR,
    },
    {
      name: 'invalid object with invalid field',
      input: { invalid: true },
      expectedError: 'Validation failed: invalid field',
      config: SCHEMA_MOCK_CONFIGS.FAIL_ON_INVALID,
    },
    {
      name: 'empty string',
      input: '',
      expectedError: baseConfig.errorMessage,
      config: { shouldPass: false, errorMessage: baseConfig.errorMessage },
    },
    {
      name: 'empty array',
      input: [],
      expectedError: baseConfig.errorMessage,
      config: { shouldPass: false, errorMessage: baseConfig.errorMessage },
    },
  ];
}

/**
 * Mock implementation factory for specific schema types
 *
 * Creates typed mock implementations for known schema types.
 * Provides better type safety and IntelliSense support.
 */
export const createTypedSchemaMocks = {
  /**
   * Creates a mock for wallet info schema validation
   */
  walletInfo: (config?: Partial<SchemaMockConfig>) =>
    createMockSchema({
      ...SCHEMA_MOCK_CONFIGS.WALLET_INFO_VALIDATION,
      ...config,
    }),

  /**
   * Creates a mock for adapter options schema validation
   */
  adapterOptions: (config?: Partial<SchemaMockConfig>) =>
    createMockSchema({
      ...SCHEMA_MOCK_CONFIGS.CONFIG_VALIDATION,
      ...config,
    }),

  /**
   * Creates a mock for transport config schema validation
   */
  transportConfig: (config?: Partial<SchemaMockConfig>) =>
    createMockSchema({
      ...SCHEMA_MOCK_CONFIGS.CONFIG_VALIDATION,
      ...config,
    }),

  /**
   * Creates a mock for connection data schema validation
   */
  connectionData: (config?: Partial<SchemaMockConfig>) =>
    createMockSchema({
      ...SCHEMA_MOCK_CONFIGS.CONNECTION_VALIDATION,
      ...config,
    }),

  /**
   * Creates a mock for error data schema validation
   */
  errorData: (config?: Partial<SchemaMockConfig>) =>
    createMockSchema({
      shouldPass: true,
      customValidator: (input: unknown) => {
        if (typeof input !== 'object' || input === null) return false;
        const obj = input as Record<string, unknown>;
        return typeof obj['code'] === 'string' && typeof obj['message'] === 'string';
      },
      errorMessage: 'Invalid error data',
      ...config,
    }),

  /**
   * Creates a mock for event data schema validation
   */
  eventData: (config?: Partial<SchemaMockConfig>) =>
    createMockSchema({
      shouldPass: true,
      customValidator: (input: unknown) => {
        if (typeof input !== 'object' || input === null) return false;
        const obj = input as Record<string, unknown>;
        return typeof obj['type'] === 'string';
      },
      errorMessage: 'Invalid event data',
      ...config,
    }),
};

/**
 * Utility function to reset all schema mocks
 *
 * Clears all mock calls and implementations for schema objects.
 * Should be called in test cleanup.
 *
 * @param {Record<string, { parse: Mock }>} schemas - Schema objects with parse methods to reset
 *
 * @example
 * ```typescript
 * afterEach(async () => {
 *   const schemas = await import('../schemas/index.js');
 *   resetSchemaMocks(schemas);
 * });
 * ```
 */
export function resetSchemaMocks(schemas: Record<string, { parse: Mock }>) {
  for (const schema of Object.values(schemas)) {
    if (schema && vi.isMockFunction(schema.parse)) {
      schema.parse.mockClear();
    }
  }
}

/**
 * Helper function to create schema validation test suites
 *
 * Generates complete test suites for schema validation with both
 * success and error cases.
 *
 * @param {string} schemaName - Name of the schema being tested
 * @param {unknown[]} validInputs - Array of valid inputs for the schema
 * @param {unknown[]} invalidInputs - Array of invalid inputs that should fail
 * @returns Test suite configuration
 *
 * @example
 * ```typescript
 * const { validTests, invalidTests } = createSchemaTestSuite(
 *   'walletInfoSchema',
 *   [{ id: 'metamask', name: 'MetaMask' }],
 *   [null, undefined, { invalid: true }]
 * );
 * ```
 */
export function createSchemaTestSuite(schemaName: string, validInputs: unknown[], invalidInputs: unknown[]) {
  return {
    validTests: validInputs.map((input, index) => ({
      name: `should validate valid input ${index + 1}`,
      input,
      expectation: 'success',
    })),

    invalidTests: invalidInputs.map((input, index) => ({
      name: `should reject invalid input ${index + 1}`,
      input,
      expectation: 'error',
    })),

    schemaName,
  };
}
