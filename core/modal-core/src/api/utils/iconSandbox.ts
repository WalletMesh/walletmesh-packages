/**
 * @fileoverview Icon sandbox utilities for secure rendering of untrusted SVG icons
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { modalLogger } from '../../internal/core/logger/globalLogger.js';

/**
 * Security policy for icon sandboxes
 * @internal
 */
const SANDBOX_SECURITY_POLICY = {
  /** Content Security Policy preventing script execution */
  csp: "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
  /** Maximum icon size in bytes (100KB) */
  maxSize: 100 * 1024,
  /** Allowed MIME types for icons */
  allowedMimeTypes: ['image/svg+xml'] as const,
  /** Timeout for CSP error detection (ms) */
  timeout: 3000,
} as const;

/**
 * Validates an icon data URI for basic constraints
 * @internal
 */
function validateIcon(iconDataUri: string): void {
  // Check if it's a data URI with allowed MIME type
  const validPrefix = SANDBOX_SECURITY_POLICY.allowedMimeTypes.some((mimeType) =>
    iconDataUri.startsWith(`data:${mimeType}`),
  );

  if (!validPrefix) {
    throw ErrorFactory.iconValidationFailed('Only SVG data URIs are allowed');
  }

  // Check size limit
  if (iconDataUri.length > SANDBOX_SECURITY_POLICY.maxSize) {
    throw ErrorFactory.iconValidationFailed('Icon exceeds maximum size limit');
  }

  // Note: Security is handled by CSP, not pattern matching
}

/**
 * Internal options for iframe creation with CSP detection
 * @internal
 */
interface IframeCreationOptions {
  iconDataUri: string;
  size: number;
  timeout: number;
  onCspError?: ((error: Error | { code: string; message: string; category: string }) => void) | undefined;
  disabled?: boolean;
  disabledStyle?: DisabledIconStyle;
}

/**
 * Generates CSS filter string for disabled icon styling
 * @internal
 */
function generateDisabledFilter(disabled?: boolean, disabledStyle?: DisabledIconStyle): string {
  if (!disabled) return '';

  const { grayscale = 100, opacity = 0.5, blur = 0, brightness = 1 } = disabledStyle || {};

  const filters: string[] = [];

  if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (brightness !== 1) filters.push(`brightness(${brightness})`);
  if (opacity !== 1) filters.push(`opacity(${opacity})`);

  return filters.length > 0 ? `filter: ${filters.join(' ')};` : '';
}

/**
 * Creates an iframe with CSP error detection
 * @internal
 */
async function createIframeWithCspDetection(options: IframeCreationOptions): Promise<HTMLIFrameElement> {
  const { iconDataUri, size, timeout, onCspError, disabled, disabledStyle } = options;

  return new Promise((resolve, reject) => {
    // Create iframe with strict security settings
    const iframe = document.createElement('iframe');

    // Apply sandbox restrictions (allow-same-origin needed for srcdoc)
    iframe.sandbox = 'allow-same-origin';

    // Set size and styling
    iframe.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border: none;
      background: transparent;
      display: block;
    `;

    // Set accessibility attributes
    iframe.title = 'Sandboxed icon';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.loading = 'lazy';

    // Generate disabled styling if needed
    const disabledFilter = generateDisabledFilter(disabled, disabledStyle);
    const cursorStyle = disabled ? 'cursor: not-allowed;' : '';

    // Create secure HTML content with CSP
    const secureHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Security-Policy" content="${SANDBOX_SECURITY_POLICY.csp}">
    <meta charset="utf-8">
    <style>
      body { 
        margin: 0; 
        padding: 0; 
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
        ${cursorStyle}
      }
      img { 
        width: 100%; 
        height: 100%; 
        object-fit: contain;
        max-width: 100%;
        max-height: 100%;
        ${disabledFilter}
      }
    </style>
  </head>
  <body>
    <img src="${iconDataUri}" alt="Icon" onerror="parent.postMessage({type:'csp-error', error:'Image load failed'}, '*')">
  </body>
</html>`;

    let resolved = false;
    // biome-ignore lint/style/useConst: timeoutId is assigned later and used in cleanup function
    let timeoutId: number | undefined;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('message', handleMessage);
      resolved = true;
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source === iframe.contentWindow && event.data?.type === 'csp-error') {
        cleanup();
        const error = ErrorFactory.renderFailed(
          `CSP blocked icon content: ${event.data.error || 'Unknown error'}`,
          'iconSandbox',
        );
        if (onCspError) {
          onCspError(error);
        }
        reject(error);
      }
    };

    const handleLoad = () => {
      if (!resolved) {
        cleanup();
        resolve(iframe);
      }
    };

    const handleError = () => {
      if (!resolved) {
        cleanup();
        reject(ErrorFactory.renderFailed('Iframe failed to load', 'iconSandbox'));
      }
    };

    // Set up event listeners
    window.addEventListener('message', handleMessage);
    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Set up timeout for CSP detection
    timeoutId = window.setTimeout(() => {
      if (!resolved) {
        cleanup();
        // Assume success if no error within timeout
        resolve(iframe);
      }
    }, timeout);

    // Set the secure content
    iframe.srcdoc = secureHtml;
  });
}

/**
 * Styling options for disabled icons
 * @public
 */
export interface DisabledIconStyle {
  /** Grayscale filter percentage (0-100, default: 100) */
  grayscale?: number;
  /** Opacity level (0-1, default: 0.5) */
  opacity?: number;
  /** Blur filter in pixels (default: 0) */
  blur?: number;
  /** Brightness filter (0-2, default: 1) */
  brightness?: number;
}

/**
 * Options for creating a sandboxed icon
 * @public
 */
export interface CreateSandboxedIconOptions {
  /** Icon data URI */
  iconDataUri: string;
  /** Size of the icon in pixels (default: 24) */
  size?: number;
  /** Fallback icon data URI to use if CSP blocks the main icon */
  fallbackIcon?: string;
  /** Timeout in ms to detect CSP violations (default: 3000) */
  timeout?: number;
  /** Callback when CSP error is detected */
  onCspError?: (error: Error | { code: string; message: string; category: string }) => void;
  /** Whether the icon should appear disabled/greyed out */
  disabled?: boolean;
  /** Custom styling for disabled state */
  disabledStyle?: DisabledIconStyle;
}

/**
 * Creates a sandboxed iframe for displaying an SVG icon safely
 *
 * This function relies on Content Security Policy (CSP) for security rather than
 * pattern-based validation. If the CSP blocks the icon, it will automatically
 * fall back to the provided fallback icon or throw an error.
 *
 * @param options - Configuration options for the sandboxed icon
 * @returns Promise<HTMLIFrameElement> configured with security restrictions
 *
 * @throws {ModalError} When icon validation fails or CSP blocks without fallback
 *
 * @example
 * ```typescript
 * // Basic usage
 * const iframe = await createSandboxedIcon({
 *   iconDataUri: 'data:image/svg+xml,...',
 *   size: 24,
 *   fallbackIcon: 'data:image/svg+xml,...',
 *   onCspError: (error) => console.warn('Icon blocked by CSP:', error)
 * });
 *
 * // Disabled/greyed out icon (e.g., for unsupported wallets)
 * const disabledIframe = await createSandboxedIcon({
 *   iconDataUri: 'data:image/svg+xml,...',
 *   size: 32,
 *   disabled: true, // Icon will appear greyed out
 *   disabledStyle: {
 *     grayscale: 100,    // Fully greyscale
 *     opacity: 0.5,      // Semi-transparent
 *     blur: 1           // Slight blur effect
 *   }
 * });
 * ```
 *
 * @public
 */
export async function createSandboxedIcon(options: CreateSandboxedIconOptions): Promise<HTMLIFrameElement> {
  const {
    iconDataUri,
    size = 24,
    fallbackIcon,
    timeout = SANDBOX_SECURITY_POLICY.timeout,
    onCspError,
    disabled,
    disabledStyle,
  } = options;

  try {
    // Validate the icon before processing
    validateIcon(iconDataUri);

    // Create the iframe and attempt to load the icon
    const iframe = await createIframeWithCspDetection({
      iconDataUri,
      size,
      timeout,
      ...(onCspError && { onCspError }),
      ...(disabled !== undefined && { disabled }),
      ...(disabledStyle && { disabledStyle }),
    });

    return iframe;
  } catch (error) {
    // If we have a fallback icon, try it
    if (fallbackIcon && fallbackIcon !== iconDataUri) {
      modalLogger.warn('Primary icon failed, attempting fallback', error);

      if (onCspError && error instanceof Error) {
        onCspError(error);
      }

      try {
        validateIcon(fallbackIcon);
        const fallbackIframe = await createIframeWithCspDetection({
          iconDataUri: fallbackIcon,
          size,
          timeout,
          // No onCspError for fallback
          ...(disabled !== undefined && { disabled }),
          ...(disabledStyle && { disabledStyle }),
        });
        return fallbackIframe;
      } catch (fallbackError) {
        modalLogger.warn('Fallback icon also failed', fallbackError);
        // Fall through to throw the original error
      }
    }

    // Check if it's a ModalError (from our validation)
    if (error && typeof error === 'object' && 'code' in error) {
      // Re-throw ModalError from validation as-is
      throw error;
    }
    // Wrap other errors
    throw ErrorFactory.sandboxCreationFailed('Failed to create icon sandbox', {
      originalError: error instanceof Error ? error.message : String(error),
      hasFallback: !!fallbackIcon,
    });
  }
}

/**
 * Creates multiple sandboxed icons efficiently
 *
 * @param icons - Array of icon configurations
 * @returns Promise<Array<HTMLIFrameElement>> instances
 *
 * @example
 * ```typescript
 * const iframes = await createSandboxedIcons([
 *   { iconDataUri: 'data:image/svg+xml,...', size: 24 },
 *   { iconDataUri: 'data:image/svg+xml,...', size: 32 }
 * ]);
 * ```
 *
 * @public
 */
export async function createSandboxedIcons(
  icons: CreateSandboxedIconOptions[],
): Promise<HTMLIFrameElement[]> {
  return Promise.all(icons.map((icon) => createSandboxedIcon(icon)));
}

/**
 * Checks if the current environment supports iframe sandboxing
 *
 * @returns True if sandboxed iframes are supported
 *
 * @public
 */
export function isSandboxSupported(): boolean {
  try {
    const iframe = document.createElement('iframe');
    return 'sandbox' in iframe && 'srcdoc' in iframe;
  } catch {
    return false;
  }
}
