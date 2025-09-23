/**
 * @fileoverview Wallet information schemas for runtime validation
 */

import { z } from 'zod';
import { ChainType } from '../types.js';

/**
 * Supported blockchain types
 */
export const chainTypeSchema = z.nativeEnum(ChainType);

/**
 * Basic wallet metadata schema
 */
export const walletMetadataSchema = z.object({
  /**
   * Wallet display name
   */
  name: z.string().min(1),

  /**
   * Wallet icon as data URI containing an image (SVG, PNG, JPEG, WebP, or GIF)
   */
  icon: z.string().refine(
    (val) => {
      // Must be a data URI
      if (!val.startsWith('data:image/')) {
        return false;
      }

      // Extract the MIME type (handle base64, direct, and URL-encoded formats)
      // Match patterns:
      // - data:image/svg+xml;base64,...  (base64 encoded)
      // - data:image/svg+xml,...         (direct/raw)
      // - data:image/svg+xml,%3Csvg...   (URL-encoded)
      const mimeMatch = val.match(/^data:image\/([^;,%]+)/);
      if (!mimeMatch) {
        return false;
      }

      // Allow safe image formats
      const allowedFormats = ['svg+xml', 'png', 'jpeg', 'jpg', 'webp', 'gif'];
      const format = mimeMatch[1]?.toLowerCase();

      return format ? allowedFormats.includes(format) : false;
    },
    {
      message: 'Icon must be a data URI with a safe image format (SVG, PNG, JPEG, WebP, or GIF)',
    },
  ),

  /**
   * Optional wallet description
   */
  description: z.string().optional(),
});

/**
 * Complete wallet information schema
 */
export const walletInfoSchema = walletMetadataSchema.extend({
  /**
   * Unique wallet identifier
   */
  id: z.string().min(1),

  /**
   * Supported blockchain types
   */
  chains: z.array(chainTypeSchema).min(1),
});

/**
 * Chain configuration schema
 */
export const chainConfigSchema = z.object({
  /**
   * Chain identifier (string or number)
   */
  chainId: z.union([z.string(), z.number()]),

  /**
   * Blockchain type
   */
  chainType: chainTypeSchema,

  /**
   * Chain display name
   */
  name: z.string().min(1),

  /**
   * Optional chain icon as data URI containing an image (SVG, PNG, JPEG, WebP, or GIF)
   */
  icon: z
    .string()
    .refine(
      (val) => {
        // Must be a data URI
        if (!val.startsWith('data:image/')) {
          return false;
        }

        // Extract the MIME type (handle base64, direct, and URL-encoded formats)
        // Match patterns:
        // - data:image/svg+xml;base64,...  (base64 encoded)
        // - data:image/svg+xml,...         (direct/raw)
        // - data:image/svg+xml,%3Csvg...   (URL-encoded)
        const mimeMatch = val.match(/^data:image\/([^;,%]+)/);
        if (!mimeMatch) {
          return false;
        }

        // Allow safe image formats
        const allowedFormats = ['svg+xml', 'png', 'jpeg', 'jpg', 'webp', 'gif'];
        const format = mimeMatch[1]?.toLowerCase();

        return format ? allowedFormats.includes(format) : false;
      },
      {
        message: 'Icon must be a data URI with a safe image format (SVG, PNG, JPEG, WebP, or GIF)',
      },
    )
    .optional(),
});

/**
 * Provider interface types
 */
export const providerInterfaceSchema = z.enum(['evm', 'solana', 'aztec']);

// Type exports (ChainType is imported from types.js, not inferred)
export type WalletMetadata = z.infer<typeof walletMetadataSchema>;
export type WalletInfo = z.infer<typeof walletInfoSchema>;
export type ChainConfig = z.infer<typeof chainConfigSchema>;
export type ProviderInterface = z.infer<typeof providerInterfaceSchema>;
