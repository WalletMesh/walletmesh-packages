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
 * Safe default icon SVG as data URI - a simple generic wallet icon
 * Exported for consistency across the codebase when a fallback icon is needed
 * @public
 */
export const SAFE_DEFAULT_ICON =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="2" y="5" width="20" height="14" rx="2" ry="2" fill="#f3f4f6" stroke="#6b7280"/>' +
      '<path d="M16 12h2" stroke="#6b7280"/>' +
      '<circle cx="17.5" cy="12" r="1.5" fill="#6b7280"/>' +
      '</svg>',
  );

/**
 * Malicious patterns to detect in icon data URIs
 * @internal
 */
const MALICIOUS_PATTERNS = [
  /<script/i, // Script tags
  /javascript:/i, // JavaScript protocol
  /on\w+\s*=/i, // Event handlers (onclick, onload, etc.) - but we need to be careful not to match our own
  /eval\(/i, // eval() calls
  /expression\(/i, // CSS expressions (IE)
  /<iframe/i, // Iframe injection
  /<embed/i, // Embed injection
  /<object/i, // Object injection
] as const;

/**
 * Escapes HTML attribute content to prevent injection attacks
 * Encodes characters that could break out of attribute context: & " < > '
 * @internal
 */
function escapeHtmlAttribute(value: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#x27;',
    '<': '&lt;',
    '>': '&gt;',
  };

  return value.replace(/[&"'<>]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Detects malicious patterns in icon data URI
 * @internal
 * @returns Object with isMalicious flag and detected patterns
 */
function detectMaliciousContent(iconDataUri: string): {
  isMalicious: boolean;
  detectedPatterns: string[];
} {
  const detectedPatterns: string[] = [];

  // Decode the data URI content to check for malicious patterns
  try {
    const decodedContent = decodeURIComponent(iconDataUri);

    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(decodedContent)) {
        detectedPatterns.push(pattern.source);
      }
    }
  } catch {
    // If decoding fails, treat as potentially malicious
    detectedPatterns.push('decode_error');
  }

  return {
    isMalicious: detectedPatterns.length > 0,
    detectedPatterns,
  };
}

/**
 * Validates an icon data URI for basic constraints and security
 * @internal
 */
function validateIcon(iconDataUri: string): void {
  // Debug logging to verify new code is running
  console.log('[IconSandbox DEBUG] Validating icon:', {
    preview: iconDataUri.substring(0, 100) + '...',
    length: iconDataUri.length,
  });

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

  // Check for malicious patterns
  const { isMalicious, detectedPatterns } = detectMaliciousContent(iconDataUri);
  if (isMalicious) {
    // Log to console for dApp developers to be aware
    console.warn(
      '[WalletMesh Security] Malicious content detected in wallet icon. Using safe default icon instead.',
      {
        detectedPatterns,
        iconPreview: iconDataUri.substring(0, 100) + '...',
      },
    );
    modalLogger.warn('Malicious icon content detected', {
      detectedPatterns,
      iconLength: iconDataUri.length,
    });

    throw ErrorFactory.iconValidationFailed(
      `Malicious content detected in icon: ${detectedPatterns.join(', ')}`,
    );
  }
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
    // Note: This intentionally omits 'allow-scripts' for security.
    // Browser console may show "Blocked script execution" warnings during iframe initialization,
    // which are expected and benign - they indicate the security sandbox is working correctly.
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

    // Temporarily mount to DOM for content initialization
    // Position off-screen and hidden so it doesn't flash or affect layout
    const tempStyle = iframe.style.cssText;
    iframe.style.cssText += '; position: absolute; left: -9999px; visibility: hidden;';

    console.log('[IconSandbox DEBUG] Mounting iframe to document.body for initialization');
    document.body.appendChild(iframe);

    // Generate disabled styling if needed
    const disabledFilter = generateDisabledFilter(disabled, disabledStyle);
    const cursorStyle = disabled ? 'cursor: not-allowed;' : '';

    // Escape the icon data URI to prevent HTML injection
    const escapedIconDataUri = escapeHtmlAttribute(iconDataUri);

    // Create secure HTML content with CSP (no inline scripts)
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
    <img src="${escapedIconDataUri}" alt="Icon">
  </body>
</html>`;

    let resolved = false;
    // biome-ignore lint/style/useConst: timeoutId is assigned later and used in cleanup function
    let timeoutId: number | undefined;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      // Remove from temporary mount point if still there
      if (iframe.parentNode === document.body) {
        document.body.removeChild(iframe);
        // Restore original styling
        iframe.style.cssText = tempStyle;
      }
      resolved = true;
    };

    const handleLoad = () => {
      if (!resolved) {
        // Icon loaded successfully
        console.log('[IconSandbox DEBUG] Icon loaded successfully, removing from temporary mount');
        cleanup();
        resolve(iframe);
      }
    };

    const handleError = () => {
      if (!resolved) {
        cleanup();
        const error = ErrorFactory.renderFailed('Iframe failed to load', 'iconSandbox');
        if (onCspError) {
          onCspError(error);
        }
        reject(error);
      }
    };

    // Set up event listeners
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
    // Check if malicious content was detected
    const isMaliciousError =
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string' &&
      error.message.includes('Malicious content detected');

    if (isMaliciousError) {
      // Don't try fallback for malicious content - use safe default immediately
      modalLogger.info('Using safe default icon due to malicious content detection');
      const safeIframe = await createIframeWithCspDetection({
        iconDataUri: SAFE_DEFAULT_ICON,
        size,
        timeout,
        ...(disabled !== undefined && { disabled }),
        ...(disabledStyle && { disabledStyle }),
      });
      return safeIframe;
    }

    // For non-malicious errors, try fallback icon if provided
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
        // Check if fallback also has malicious content
        const isFallbackMalicious =
          fallbackError &&
          typeof fallbackError === 'object' &&
          'message' in fallbackError &&
          typeof fallbackError.message === 'string' &&
          fallbackError.message.includes('Malicious content detected');

        if (isFallbackMalicious) {
          // Use safe default if fallback is also malicious
          modalLogger.info('Fallback icon also malicious, using safe default');
          const safeIframe = await createIframeWithCspDetection({
            iconDataUri: SAFE_DEFAULT_ICON,
            size,
            timeout,
            ...(disabled !== undefined && { disabled }),
            ...(disabledStyle && { disabledStyle }),
          });
          return safeIframe;
        }

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
