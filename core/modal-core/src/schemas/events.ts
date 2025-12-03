/**
 * @fileoverview Event system schemas for runtime validation
 */

import { z } from 'zod';
import { modalErrorSchema } from './errors.js';

/**
 * Transport event schemas
 */

/**
 * Transport message event schema
 */
export const transportMessageEventSchema = z.object({
  type: z.literal('message'),
  data: z.unknown(),
});

/**
 * Transport connected event schema
 */
export const transportConnectedEventSchema = z.object({
  type: z.literal('connected'),
});

/**
 * Transport disconnected event schema
 */
export const transportDisconnectedEventSchema = z.object({
  type: z.literal('disconnected'),
  reason: z.string().optional(),
});

/**
 * Transport error event schema
 */
export const transportErrorEventSchema = z.object({
  type: z.literal('error'),
  error: modalErrorSchema,
});

/**
 * Discriminated union for all transport events
 */
export const transportEventSchema = z.discriminatedUnion('type', [
  transportMessageEventSchema,
  transportConnectedEventSchema,
  transportDisconnectedEventSchema,
  transportErrorEventSchema,
]);

/**
 * Wallet mesh event types enumeration
 * Uses the actual string values from WalletMeshEventType
 */
export const walletMeshEventTypeSchema = z.enum([
  'modal:opened',
  'modal:closed',
  'wallet:selected',
  'wallet:connecting',
  'wallet:connected',
  'wallet:disconnected',
  'accounts:changed',
  'chain:changed',
  'modal:error',
]);

/**
 * Modal opened event schema
 */
export const modalOpenedEventSchema = z.object({
  type: z.literal('modal:opened'),
});

/**
 * Modal closed event schema
 */
export const modalClosedEventSchema = z.object({
  type: z.literal('modal:closed'),
});

/**
 * Wallet selected event schema
 */
export const walletSelectedEventSchema = z.object({
  type: z.literal('wallet:selected'),
  walletId: z.string(),
});

/**
 * Wallet connecting event schema
 */
export const walletConnectingEventSchema = z.object({
  type: z.literal('wallet:connecting'),
  walletId: z.string(),
});

/**
 * Wallet connected event schema
 */
export const walletConnectedEventSchema = z.object({
  type: z.literal('wallet:connected'),
  walletId: z.string(),
  address: z.string(),
  chainId: z.union([z.string(), z.number()]).optional(),
});

/**
 * Wallet disconnected event schema
 */
export const walletDisconnectedEventSchema = z.object({
  type: z.literal('wallet:disconnected'),
});

/**
 * Chain changed event schema
 */
export const chainChangedEventSchema = z.object({
  type: z.literal('chain:changed'),
  chainId: z.union([z.string(), z.number()]),
});

/**
 * Accounts changed event schema
 */
export const accountsChangedEventSchema = z.object({
  type: z.literal('accounts:changed'),
  accounts: z.array(z.string()),
});

/**
 * Modal error event schema
 */
export const modalErrorEventSchema = z.object({
  type: z.literal('modal:error'),
  error: modalErrorSchema,
  operation: z.string().optional(),
});

/**
 * Discriminated union for all wallet mesh events
 */
export const walletMeshEventSchema = z.discriminatedUnion('type', [
  modalOpenedEventSchema,
  modalClosedEventSchema,
  walletSelectedEventSchema,
  walletConnectingEventSchema,
  walletConnectedEventSchema,
  walletDisconnectedEventSchema,
  chainChangedEventSchema,
  accountsChangedEventSchema,
  modalErrorEventSchema,
]);

// Type exports
export type TransportEvent = z.infer<typeof transportEventSchema>;
export type WalletMeshEventType = z.infer<typeof walletMeshEventTypeSchema>;
export type WalletMeshEvent = z.infer<typeof walletMeshEventSchema>;
