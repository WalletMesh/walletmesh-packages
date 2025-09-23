/**
 * @fileoverview Adapter configuration schemas for runtime validation
 */

import { z } from 'zod';
import { modalStateSchema } from './connection.js';

/**
 * Base adapter configuration schema
 */
export const adapterConfigSchema = z.object({
  /**
   * Target element for rendering (string selector, HTMLElement, or undefined for default)
   */
  target: z.union([z.string(), z.instanceof(HTMLElement), z.undefined()]),
});

/**
 * View properties schema for framework adapters
 */
export const viewPropsSchema = z.object({
  /**
   * Current view identifier
   */
  view: z.string(),

  /**
   * Current modal state
   */
  state: modalStateSchema,

  /**
   * Action handler function
   */
  onAction: z.function().args(z.string(), z.unknown().optional()).returns(z.void()),
});

/**
 * Base framework adapter options
 */
export const baseFrameworkAdapterConfigSchema = adapterConfigSchema.extend({
  /**
   * Debug mode flag
   */
  debug: z.boolean().optional(),
});

/**
 * React adapter specific options
 */
export const reactAdapterConfigSchema = baseFrameworkAdapterConfigSchema.extend({
  /**
   * React-specific configuration
   */
  reactOptions: z
    .object({
      /**
       * Strict mode flag
       */
      strictMode: z.boolean().optional(),

      /**
       * Concurrent features flag
       */
      concurrent: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Vue adapter specific options
 */
export const vueAdapterConfigSchema = baseFrameworkAdapterConfigSchema.extend({
  /**
   * Vue-specific configuration
   */
  vueOptions: z
    .object({
      /**
       * Vue app instance options
       */
      appOptions: z.record(z.unknown()).optional(),
    })
    .optional(),
});

/**
 * Svelte adapter specific options
 */
export const svelteAdapterConfigSchema = baseFrameworkAdapterConfigSchema.extend({
  /**
   * Svelte-specific configuration
   */
  svelteOptions: z
    .object({
      /**
       * Svelte compiler options
       */
      compilerOptions: z.record(z.unknown()).optional(),
    })
    .optional(),
});

/**
 * Framework adapter options discriminated union
 */
export const frameworkAdapterConfigSchema = z.discriminatedUnion('framework', [
  z.object({
    framework: z.literal('react'),
    options: reactAdapterConfigSchema,
  }),
  z.object({
    framework: z.literal('vue'),
    options: vueAdapterConfigSchema,
  }),
  z.object({
    framework: z.literal('svelte'),
    options: svelteAdapterConfigSchema,
  }),
]);

// Type exports
export type AdapterConfig = z.infer<typeof adapterConfigSchema>;
export type ViewProps = z.infer<typeof viewPropsSchema>;
export type BaseFrameworkAdapterConfig = z.infer<typeof baseFrameworkAdapterConfigSchema>;
export type ReactAdapterConfig = z.infer<typeof reactAdapterConfigSchema>;
export type VueAdapterConfig = z.infer<typeof vueAdapterConfigSchema>;
export type SvelteAdapterConfig = z.infer<typeof svelteAdapterConfigSchema>;
