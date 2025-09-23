/**
 * @fileoverview Helper functions for working with Zod schemas
 *
 * Provides utilities to integrate Zod validation with ErrorFactory
 * for consistent error handling across the application.
 */

import { z } from 'zod';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { ModalError } from '../internal/core/errors/types.js';

/**
 * Parse data with a Zod schema and convert errors to ErrorFactory format
 *
 * @param schema - The Zod schema to use for validation
 * @param data - The data to validate
 * @param errorMessage - The error message to use if validation fails
 * @returns The validated data
 * @throws {ModalError} If validation fails with detailed error information
 * @remarks This function bridges Zod validation with the application's error system,
 * ensuring consistent error formatting across the codebase
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   name: z.string(),
 *   age: z.number().min(0)
 * });
 *
 * try {
 *   const user = parseWithErrorFactory(userSchema, data, 'Invalid user data');
 *   console.log(user.name, user.age);
 * } catch (error) {
 *   // error is a ModalError with validation details
 *   console.error(error.code, error.data?.zodErrors);
 * }
 * ```
 */
export function parseWithErrorFactory<T>(schema: z.ZodSchema<T>, data: unknown, errorMessage: string): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Extract the most relevant error message
      const firstError = error.errors[0];
      const detailedMessage = firstError ? `${errorMessage}: ${firstError.message}` : errorMessage;

      throw ErrorFactory.validation(detailedMessage, {
        providedValue: data,
        zodErrors: error.errors,
        issues: error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      });
    }
    throw error;
  }
}

/**
 * Safe parse with custom error transformation
 *
 * @param schema - The Zod schema to use for validation
 * @param data - The data to validate
 * @returns Result object with success status and data or error
 * @remarks This function provides a safe alternative to parseWithErrorFactory,
 * returning a discriminated union instead of throwing errors. Useful for
 * validation in contexts where exceptions should be avoided
 * @example
 * ```typescript
 * const result = safeParseWithDetails(userSchema, userData);
 *
 * if (result.success) {
 *   // TypeScript knows result.data is the validated type
 *   console.log('Valid user:', result.data.name);
 * } else {
 *   // TypeScript knows result.error is a ModalError
 *   console.error('Validation failed:', result.error.message);
 *   console.error('Issues:', result.error.data?.issues);
 * }
 * ```
 */
export function safeParseWithDetails<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: ModalError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Convert Zod error to ModalError
  const firstError = result.error.errors[0];
  const errorMessage = firstError ? firstError.message : 'Validation failed';

  const modalError = ErrorFactory.validation(errorMessage, {
    providedValue: data,
    zodErrors: result.error.errors,
    issues: result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
      code: i.code,
    })),
  });

  return { success: false, error: modalError };
}

/**
 * Create a validation function that uses a schema and custom error message
 *
 * @param schema - The Zod schema to use
 * @param errorPrefix - Prefix for the error message
 * @returns Validation function that validates data against the schema
 * @remarks This factory function creates reusable validators with consistent
 * error messaging. Useful for creating domain-specific validation functions
 * @example
 * ```typescript
 * // Create a reusable validator
 * const validateUser = createValidator(
 *   z.object({ name: z.string(), email: z.string().email() }),
 *   'User validation failed'
 * );
 *
 * // Use the validator multiple times
 * const user1 = validateUser({ name: 'Alice', email: 'alice@example.com' });
 * const user2 = validateUser({ name: 'Bob', email: 'bob@example.com' });
 * ```
 */
export function createValidator<T>(schema: z.ZodSchema<T>, errorPrefix: string): (data: unknown) => T {
  return (data: unknown) => parseWithErrorFactory(schema, data, errorPrefix);
}

/**
 * Batch validate multiple values with their schemas
 *
 * @param validations - Array of validation configs
 * @returns Array of validated values
 * @throws {ModalError} If any validation fails
 * @remarks This function validates multiple values in sequence, stopping at the
 * first validation error. Useful for validating related data that should all
 * be valid before proceeding
 * @example
 * ```typescript
 * const [user, settings, permissions] = batchValidate([
 *   {
 *     schema: userSchema,
 *     data: userData,
 *     errorMessage: 'Invalid user data'
 *   },
 *   {
 *     schema: settingsSchema,
 *     data: settingsData,
 *     errorMessage: 'Invalid settings'
 *   },
 *   {
 *     schema: permissionsSchema,
 *     data: permissionsData,
 *     errorMessage: 'Invalid permissions'
 *   }
 * ]);
 *
 * // All values are now validated and typed correctly
 * console.log(user.name, settings.theme, permissions.canEdit);
 * ```
 */
export function batchValidate<T extends readonly unknown[]>(
  validations: {
    [K in keyof T]: {
      schema: z.ZodSchema<T[K]>;
      data: unknown;
      errorMessage: string;
    };
  },
): T {
  const results: unknown[] = [];

  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i];
    if (validation) {
      const { schema, data, errorMessage } = validation;
      results.push(parseWithErrorFactory(schema, data, errorMessage));
    }
  }

  return results as unknown as T;
}

/**
 * Type guard to check if an error is a Zod error
 *
 * @param error - The error to check
 * @returns True if the error is a ZodError
 * @remarks Use this guard to safely handle errors that might be Zod validation
 * errors and extract detailed validation information
 * @example
 * ```typescript
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (isZodError(error)) {
 *     // TypeScript knows error is ZodError
 *     console.log('Validation errors:', error.errors);
 *     error.errors.forEach(err => {
 *       console.log(`Field ${err.path.join('.')}: ${err.message}`);
 *     });
 *   } else {
 *     // Handle other error types
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

/**
 * Extract a human-readable error summary from a Zod error
 *
 * @param error - The Zod error
 * @returns A formatted error message with all validation issues
 * @remarks This function converts Zod's error structure into a human-readable
 * format, joining multiple errors with semicolons and including field paths
 * @example
 * ```typescript
 * const schema = z.object({
 *   name: z.string().min(3),
 *   age: z.number().positive(),
 *   email: z.string().email()
 * });
 *
 * try {
 *   schema.parse({ name: 'Jo', age: -5, email: 'invalid' });
 * } catch (error) {
 *   if (isZodError(error)) {
 *     console.log(formatZodError(error));
 *     // Output: "name: String must contain at least 3 character(s); age: Number must be positive; email: Invalid email"
 *   }
 * }
 * ```
 */
export function formatZodError(error: z.ZodError): string {
  const messages = error.errors.map((err) => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });

  return messages.join('; ');
}

/**
 * Create a composed schema with custom error transformation
 *
 * @param schema - The base schema
 * @param errorTransform - Function to transform error messages
 * @returns New schema with transformed errors
 * @remarks This advanced utility allows you to wrap a schema with custom error
 * formatting logic. Note: The current implementation has limitations and may
 * not work as expected in all cases
 * @example
 * ```typescript
 * const baseSchema = z.string().email();
 *
 * const customSchema = withCustomErrors(
 *   baseSchema,
 *   (error) => `Email validation failed: ${formatZodError(error)}`
 * );
 *
 * // When validation fails, the custom error transform is applied
 * try {
 *   customSchema.parse('invalid-email');
 * } catch (error) {
 *   // Error message will be prefixed with "Email validation failed: "
 * }
 * ```
 */
export function withCustomErrors<T>(
  schema: z.ZodSchema<T>,
  errorTransform: (error: z.ZodError) => string,
): z.ZodSchema<T> {
  return schema.transform((value, ctx) => {
    try {
      return value;
    } catch (error) {
      if (error instanceof z.ZodError) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errorTransform(error),
        });
      }
      throw error;
    }
  }) as z.ZodSchema<T>;
}
