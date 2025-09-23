/**
 * @fileoverview View system schemas for runtime validation
 */

import { z } from 'zod';
import { modalStateSchema, modalViewSchema } from './connection.js';

/**
 * View hooks schema for lifecycle management
 */
export const viewHooksSchema = z.object({
  /**
   * Called when entering the view
   */
  onEnter: z
    .function()
    .args(z.void())
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),

  /**
   * Called when exiting the view
   */
  onExit: z
    .function()
    .args(z.void())
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),

  /**
   * Called before view transition starts
   */
  onBeforeTransition: z
    .function()
    .args(z.string()) // target view
    .returns(z.union([z.boolean(), z.promise(z.boolean())]))
    .optional(),

  /**
   * Called after view transition completes
   */
  onAfterTransition: z
    .function()
    .args(z.string()) // from view
    .returns(z.union([z.void(), z.promise(z.void())]))
    .optional(),
});

/**
 * View definition schema
 */
export const viewDefinitionSchema = viewHooksSchema.extend({
  /**
   * Unique view identifier - can be predefined or custom
   */
  id: z.union([modalViewSchema, z.string()]),

  /**
   * Views that can be transitioned to from this view
   */
  allowedTransitions: z.array(z.union([modalViewSchema, z.string()])),

  /**
   * Optional validation function for view state
   */
  validate: z.function().args(modalStateSchema).returns(z.boolean()).optional(),

  /**
   * Optional view-specific configuration
   */
  config: z.record(z.unknown()).optional(),

  /**
   * View priority for selection logic
   */
  priority: z.number().int().nonnegative().optional(),
});

/**
 * View system configuration schema
 */
export const viewSystemConfigSchema = z.object({
  /**
   * Initial view to show when modal opens
   */
  initialView: modalViewSchema.optional(),

  /**
   * Whether to validate transitions between views
   */
  validateTransitions: z.boolean().optional(),

  /**
   * Debug mode for view system
   */
  debug: z.boolean().optional(),

  /**
   * Animation configuration
   */
  animations: z
    .object({
      /**
       * Whether animations are enabled
       */
      enabled: z.boolean(),

      /**
       * Animation duration in milliseconds
       */
      duration: z.number().int().positive().optional(),

      /**
       * Animation easing function
       */
      easing: z.string().optional(),
    })
    .optional(),

  /**
   * View transition timeout in milliseconds
   */
  transitionTimeout: z.number().int().positive().optional(),
});

/**
 * View transition schema
 */
export const viewTransitionSchema = z.object({
  /**
   * Source view
   */
  from: modalViewSchema,

  /**
   * Target view
   */
  to: modalViewSchema,

  /**
   * Transition trigger reason
   */
  reason: z.string().optional(),

  /**
   * Transition metadata
   */
  metadata: z.record(z.unknown()).optional(),
});

/**
 * View state schema for individual view instances
 */
export const viewStateSchema = z.object({
  /**
   * Current view ID
   */
  currentView: modalViewSchema,

  /**
   * Previous view ID
   */
  previousView: modalViewSchema.nullable(),

  /**
   * Whether view is transitioning
   */
  isTransitioning: z.boolean(),

  /**
   * Transition start timestamp
   */
  transitionStarted: z.date().nullable(),

  /**
   * View-specific data
   */
  viewData: z.record(z.unknown()).optional(),

  /**
   * View history stack
   */
  history: z.array(modalViewSchema).optional(),
});

/**
 * View manager configuration schema
 */
export const viewManagerConfigSchema = z.object({
  /**
   * Maximum history length
   */
  maxHistoryLength: z.number().int().positive().optional(),

  /**
   * Whether to persist view state
   */
  persistState: z.boolean().optional(),

  /**
   * Storage key for persistence
   */
  storageKey: z.string().optional(),

  /**
   * Error recovery strategy
   */
  errorRecovery: z.enum(['retry', 'fallback', 'reset']).optional(),

  /**
   * Fallback view for error recovery
   */
  fallbackView: modalViewSchema.optional(),
});

// Type exports
export type ViewHooks = z.infer<typeof viewHooksSchema>;
export type ViewDefinition = z.infer<typeof viewDefinitionSchema>;
export type ViewSystemConfig = z.infer<typeof viewSystemConfigSchema>;
export type ViewTransition = z.infer<typeof viewTransitionSchema>;
export type ViewState = z.infer<typeof viewStateSchema>;
export type ViewManagerConfig = z.infer<typeof viewManagerConfigSchema>;
