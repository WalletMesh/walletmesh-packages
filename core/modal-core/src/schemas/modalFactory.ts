/**
 * @fileoverview Modal factory configuration schemas for runtime validation
 * @module schemas/modalFactory
 */

import { z } from 'zod';
import { walletInfoSchema } from './wallet.js';
import { modalViewSchema } from './connection.js';
import { supportedChainsConfigSchema } from './chains.js';

/**
 * Base wallet client schema - validates the public interface
 * This is a minimal validation to ensure the object has the required methods
 */
export const walletClientSchema = z.object({
  initialize: z.function(),
  connect: z.function(),
  disconnect: z.function(),
  getConnectionInfo: z.function(),
  on: z.function(),
  off: z.function(),
});

/**
 * Framework adapter schema - validates the public interface
 */
export const frameworkAdapterSchema = z.object({
  render: z.function(),
  destroy: z.function(),
  getContainer: z.function(),
});

/**
 * Modal factory configuration schema
 */
export const modalFactoryConfigSchema = z.object({
  /** Available wallets - validated individually */
  wallets: z.array(walletInfoSchema),

  /** Wallet client for managing connections */
  client: walletClientSchema,

  /** Framework adapter for rendering UI */
  frameworkAdapter: frameworkAdapterSchema,

  /** Supported chains configuration */
  supportedChains: supportedChainsConfigSchema.optional(),

  /** Initial view to display */
  initialView: modalViewSchema.optional(),

  /** Auto close delay in milliseconds */
  autoCloseDelay: z.number().int().min(0).optional(),

  /** Whether to persist wallet selection */
  persistWalletSelection: z.boolean().optional(),

  /** Show provider selection view */
  showProviderSelection: z.boolean().optional(),

  /** Debug mode */
  debug: z.boolean().optional(),
});

/**
 * Test modal configuration schema
 */
export const testModalConfigSchema = z.object({
  wallets: z.array(walletInfoSchema).optional(),
  client: walletClientSchema.optional(),
  frameworkAdapter: frameworkAdapterSchema.optional(),
});

// Type exports
export type WalletClientSchema = z.infer<typeof walletClientSchema>;
export type FrameworkAdapterSchema = z.infer<typeof frameworkAdapterSchema>;
export type ModalFactoryConfig = z.infer<typeof modalFactoryConfigSchema>;
export type TestModalConfig = z.infer<typeof testModalConfigSchema>;
