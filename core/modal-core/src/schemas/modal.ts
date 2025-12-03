/**
 * @fileoverview Modal-specific validation schemas
 */

import { z } from 'zod';
import { caip2Schema } from './caip2.js';
import { walletIdSchema } from './actions.js';

// ============================================================================
// MODAL UI SCHEMAS
// ============================================================================

/**
 * Modal theme configuration
 */
export const modalThemeSchema = z.object({
  /** Theme mode */
  mode: z.enum(['light', 'dark', 'auto']).default('auto'),
  /** Primary color */
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  /** Background color */
  backgroundColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  /** Text color */
  textColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  /** Border radius in pixels */
  borderRadius: z.number().int().min(0).max(50).optional(),
  /** Font family */
  fontFamily: z.string().optional(),
  /** Custom CSS variables */
  cssVariables: z.record(z.string()).optional(),
});

/**
 * Modal size configuration
 */
export const modalSizeSchema = z.object({
  /** Modal width */
  width: z
    .union([z.number().int().min(300).max(800), z.string().regex(/^\d+(\.\d+)?(%|px|em|rem|vw)$/)])
    .default(400),
  /** Modal height */
  height: z
    .union([
      z.number().int().min(400).max(900),
      z.string().regex(/^\d+(\.\d+)?(%|px|em|rem|vh)$/),
      z.literal('auto'),
    ])
    .default('auto'),
  /** Maximum width */
  maxWidth: z.union([z.number().int().min(300), z.string().regex(/^\d+(%|px|em|rem|vw)$/)]).optional(),
  /** Maximum height */
  maxHeight: z.union([z.number().int().min(400), z.string().regex(/^\d+(%|px|em|rem|vh)$/)]).optional(),
});

/**
 * Modal position configuration
 */
export const modalPositionSchema = z.object({
  /** Horizontal position */
  horizontal: z.enum(['left', 'center', 'right']).default('center'),
  /** Vertical position */
  vertical: z.enum(['top', 'center', 'bottom']).default('center'),
  /** Custom offset */
  offset: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
    })
    .optional(),
});

/**
 * Modal animation configuration
 */
export const modalAnimationSchema = z.object({
  /** Enable animations */
  enabled: z.boolean().default(true),
  /** Animation duration in milliseconds */
  duration: z.number().int().min(0).max(1000).default(300),
  /** Animation easing function */
  easing: z
    .enum(['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier'])
    .default('ease-out'),
  /** Custom cubic bezier values */
  cubicBezier: z
    .tuple([
      z.number().min(0).max(1),
      z.number().min(0).max(1),
      z.number().min(0).max(1),
      z.number().min(0).max(1),
    ])
    .optional(),
});

/**
 * Modal backdrop configuration
 */
export const modalBackdropSchema = z.object({
  /** Show backdrop */
  enabled: z.boolean().default(true),
  /** Backdrop color */
  color: z.string().default('rgba(0, 0, 0, 0.5)'),
  /** Blur background */
  blur: z.number().int().min(0).max(20).optional(),
  /** Close on backdrop click */
  closeOnClick: z.boolean().default(true),
});

// ============================================================================
// MODAL CONTENT SCHEMAS
// ============================================================================

/**
 * Wallet display configuration
 */
export const walletDisplayConfigSchema = z.object({
  /** Show wallet name */
  showName: z.boolean().default(true),
  /** Show wallet icon */
  showIcon: z.boolean().default(true),
  /** Show wallet description */
  showDescription: z.boolean().default(false),
  /** Show supported chains */
  showChains: z.boolean().default(false),
  /** Show install button for uninstalled wallets */
  showInstallButton: z.boolean().default(true),
  /** Group wallets by category */
  groupByCategory: z.boolean().default(false),
  /** Sort order */
  sortBy: z.enum(['name', 'popularity', 'recent', 'recommended']).default('recommended'),
});

/**
 * QR code display configuration
 */
export const qrCodeConfigSchema = z.object({
  /** Enable QR code display */
  enabled: z.boolean().default(true),
  /** QR code size in pixels */
  size: z.number().int().min(128).max(512).default(256),
  /** Error correction level */
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  /** Include logo in QR code */
  includeLogo: z.boolean().default(true),
  /** Logo size as percentage of QR code */
  logoSize: z.number().min(10).max(30).default(20),
});

/**
 * Modal content sections configuration
 */
export const modalSectionsSchema = z.object({
  /** Show header section */
  header: z.boolean().default(true),
  /** Show search bar */
  search: z.boolean().default(true),
  /** Show wallet list */
  walletList: z.boolean().default(true),
  /** Show QR code section */
  qrCode: z.boolean().default(true),
  /** Show help section */
  help: z.boolean().default(true),
  /** Show terms of service */
  terms: z.boolean().default(false),
  /** Custom sections */
  custom: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        position: z.enum(['before-wallets', 'after-wallets', 'footer']),
      }),
    )
    .optional(),
});

// ============================================================================
// MODAL STATE SCHEMAS
// ============================================================================

/**
 * Modal view state
 */
export const modalViewSchema = z.enum([
  'wallet-selection',
  'connecting',
  'connected',
  'error',
  'qr-code',
  'help',
  'terms',
  'custom',
]);

/**
 * Modal state
 */
export const modalStateSchema = z.object({
  /** Whether modal is open */
  isOpen: z.boolean(),
  /** Current view */
  currentView: modalViewSchema,
  /** Selected wallet ID */
  selectedWalletId: walletIdSchema.optional(),
  /** Target chain ID */
  targetChainId: caip2Schema.optional(),
  /** Connection progress */
  connectionProgress: z.number().int().min(0).max(100).optional(),
  /** Error state */
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.unknown(),
    })
    .optional(),
  /** Loading state */
  isLoading: z.boolean(),
  /** Custom view ID */
  customViewId: z.string().optional(),
});

// ============================================================================
// MODAL CONFIGURATION SCHEMAS
// ============================================================================

/**
 * Complete modal configuration
 */
export const modalConfigSchema = z.object({
  /** Theme configuration */
  theme: modalThemeSchema.optional(),
  /** Size configuration */
  size: modalSizeSchema.optional(),
  /** Position configuration */
  position: modalPositionSchema.optional(),
  /** Animation configuration */
  animation: modalAnimationSchema.optional(),
  /** Backdrop configuration */
  backdrop: modalBackdropSchema.optional(),
  /** Wallet display configuration */
  walletDisplay: walletDisplayConfigSchema.optional(),
  /** QR code configuration */
  qrCode: qrCodeConfigSchema.optional(),
  /** Section visibility */
  sections: modalSectionsSchema.optional(),
  /** Auto-close on successful connection */
  autoClose: z.boolean().default(true),
  /** Close timeout after connection */
  closeDelay: z.number().int().min(0).max(10000).default(1500),
  /** Enable keyboard navigation */
  keyboardNavigation: z.boolean().default(true),
  /** Enable escape key to close */
  escapeClose: z.boolean().default(true),
  /** Z-index for modal */
  zIndex: z.number().int().min(1).max(999999).default(9999),
  /** Container element or selector */
  container: z
    .union([
      z.string(), // CSS selector
      z
        .instanceof(HTMLElement)
        .optional(), // Can't validate in Node
    ])
    .optional(),
});

// ============================================================================
// MODAL EVENT SCHEMAS
// ============================================================================

/**
 * Modal event types
 */
export const modalEventTypeSchema = z.enum([
  'open',
  'close',
  'view-change',
  'wallet-select',
  'connection-start',
  'connection-success',
  'connection-error',
  'cancel',
  'help-click',
  'terms-click',
  'qr-scan',
]);

/**
 * Modal event data
 */
export const modalEventSchema = z.object({
  /** Event type */
  type: modalEventTypeSchema,
  /** Event timestamp */
  timestamp: z.number(),
  /** Event data */
  data: z.record(z.unknown()).optional(),
  /** Source view */
  sourceView: modalViewSchema.optional(),
  /** Target view (for view changes) */
  targetView: modalViewSchema.optional(),
});

// ============================================================================
// MODAL ACTION SCHEMAS
// ============================================================================

/**
 * Modal action types
 */
export const modalActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('open'),
    config: modalConfigSchema.optional(),
  }),
  z.object({
    type: z.literal('close'),
    reason: z.string().optional(),
  }),
  z.object({
    type: z.literal('setView'),
    view: modalViewSchema,
    data: z.record(z.unknown()).optional(),
  }),
  z.object({
    type: z.literal('selectWallet'),
    walletId: walletIdSchema,
  }),
  z.object({
    type: z.literal('setError'),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown(),
    }),
  }),
  z.object({
    type: z.literal('clearError'),
  }),
  z.object({
    type: z.literal('updateProgress'),
    progress: z.number().int().min(0).max(100),
  }),
  z.object({
    type: z.literal('updateConfig'),
    config: modalConfigSchema.partial(),
  }),
]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ModalTheme = z.infer<typeof modalThemeSchema>;
export type ModalSize = z.infer<typeof modalSizeSchema>;
export type ModalPosition = z.infer<typeof modalPositionSchema>;
export type ModalAnimation = z.infer<typeof modalAnimationSchema>;
export type ModalBackdrop = z.infer<typeof modalBackdropSchema>;
export type WalletDisplayConfig = z.infer<typeof walletDisplayConfigSchema>;
export type QRCodeConfig = z.infer<typeof qrCodeConfigSchema>;
export type ModalSections = z.infer<typeof modalSectionsSchema>;
export type ModalView = z.infer<typeof modalViewSchema>;
export type ModalState = z.infer<typeof modalStateSchema>;
export type ModalConfig = z.infer<typeof modalConfigSchema>;
export type ModalEventType = z.infer<typeof modalEventTypeSchema>;
export type ModalEvent = z.infer<typeof modalEventSchema>;
export type ModalAction = z.infer<typeof modalActionSchema>;
