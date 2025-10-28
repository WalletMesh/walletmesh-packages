/**
 * WalletMesh Sandboxed Icon Components
 *
 * This module provides React components for rendering untrusted SVG icons safely
 * using sandboxed iframes. It prevents malicious SVG content from executing scripts
 * or accessing the parent document while providing a clean React interface.
 *
 * ## Security Architecture
 *
 * The component uses multiple layers of security:
 * 1. **Iframe Sandboxing**: Icons render in sandboxed iframes with minimal permissions
 * 2. **Content Security Policy**: Enforces strict CSP within the iframe
 * 3. **Data URI Validation**: Only data URIs are accepted, no external URLs
 * 4. **Script Blocking**: JavaScript execution is completely disabled
 *
 * ## Features
 *
 * - **Automatic CSP Detection**: Detects and handles CSP restrictions
 * - **Fallback Support**: Falls back to safe alternatives when sandboxing fails
 * - **Error Recovery**: Multiple recovery strategies for resilient rendering
 * - **Accessibility**: Full ARIA support and keyboard navigation
 * - **Loading States**: Built-in loading indicators
 * - **Disabled States**: Visual feedback for unavailable wallets
 *
 * ## Performance Considerations
 *
 * - Icons are rendered asynchronously to avoid blocking the UI
 * - Iframes are cleaned up properly to prevent memory leaks
 * - Error recovery is non-blocking and graceful
 *
 * ## CSP Compliance
 *
 * The components handle various Content Security Policy restrictions:
 * - **frame-src**: Falls back to inline SVG if iframes are blocked
 * - **img-src**: Uses data URIs which are typically allowed
 * - **style-src**: Inline styles use minimal CSP-safe properties
 * - **script-src**: No scripts are ever executed
 *
 * ## Usage Recommendations
 *
 * - Always provide fallback icons for critical UI elements
 * - Set appropriate timeouts based on your performance requirements
 * - Monitor CSP errors in production to optimize configurations
 * - Use disabled states to communicate wallet availability
 *
 * @module components/WalletMeshSandboxedIcon
 * @packageDocumentation
 */

import {
  type DisabledIconStyle,
  type FallbackIconConfig,
  RECOVERY_PRESETS,
  createIconAccessibilityAttributes,
  createIconContainerConfig,
  createIconErrorRecovery,
  createSandboxedIcon,
  normalizeIconOptions,
} from '@walletmesh/modal-core';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createComponentLogger } from '../utils/logger.js';

/**
 * Props for the WalletMeshSandboxedIcon component
 * @public
 */
export interface WalletMeshSandboxedIconProps {
  /** Data URI containing SVG content */
  src: string;
  /** Icon size in pixels */
  size?: number;
  /** CSS class name */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Alt text for accessibility */
  alt?: string;
  /** Style overrides */
  style?: React.CSSProperties;
  /** Fallback icon data URI to use if CSP blocks the main icon */
  fallbackIcon?: string;
  /** Timeout in ms for CSP detection (default: 3000) */
  cspTimeout?: number;
  /** Callback when CSP error is detected */
  onCspError?: (error: Error | { code: string; message: string; category: string }) => void;
  /** Whether the icon should appear disabled/greyed out */
  disabled?: boolean;
  /** Custom styling for disabled state */
  disabledStyle?: DisabledIconStyle;
}

/**
 * React component that renders SVG icons in a sandboxed iframe for security
 *
 * This component ensures that untrusted SVG content from wallets or dApps
 * cannot execute scripts or access the parent document.
 *
 * ## Rendering Process
 *
 * 1. **Validation**: Icon data URI is validated and normalized
 * 2. **Sandbox Creation**: Iframe is created with strict sandboxing
 * 3. **Content Injection**: SVG is safely injected into the iframe
 * 4. **Error Handling**: Failures trigger recovery strategies
 * 5. **Accessibility**: ARIA attributes are applied for screen readers
 *
 * ## Error Recovery Strategies
 *
 * When icon loading fails, the component attempts recovery in order:
 * 1. **Fallback Icon**: Use provided fallback if available
 * 2. **Generic Icon**: Show wallet-type generic icon
 * 3. **Text Fallback**: Display wallet initials
 * 4. **Error State**: Show error indicator
 *
 * @example
 * ```tsx
 * // Basic usage
 * <WalletMeshSandboxedIcon
 *   src="data:image/svg+xml,<svg>...</svg>"
 *   size={24}
 *   onClick={() => selectWallet('metamask')}
 *   alt="MetaMask icon"
 * />
 *
 * // With fallback and error handling
 * <WalletMeshSandboxedIcon
 *   src={wallet.icon}
 *   fallbackIcon={genericWalletIcon}
 *   size={32}
 *   onCspError={(error) => {
 *     analytics.track('icon_csp_blocked', { wallet: wallet.id });
 *   }}
 *   alt={`${wallet.name} icon`}
 * />
 *
 * // Disabled icon for unsupported wallet
 * <WalletMeshSandboxedIcon
 *   src="data:image/svg+xml,<svg>...</svg>"
 *   size={32}
 *   disabled={!walletSupportsRequiredFeatures}
 *   disabledStyle="grayscale" // or "opacity" or custom styles
 *   alt="Unsupported wallet"
 *   onClick={undefined} // No click handler for disabled state
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Advanced usage with custom styling
 * <WalletMeshSandboxedIcon
 *   src={wallet.icon}
 *   size={48}
 *   className="wallet-icon"
 *   style={{
 *     borderRadius: '8px',
 *     boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
 *   }}
 *   disabled={isConnecting}
 *   onClick={() => !isConnecting && connect(wallet.id)}
 *   alt={wallet.name}
 * />
 * ```
 *
 * @public
 */
export function WalletMeshSandboxedIcon({
  src,
  size = 24,
  className,
  onClick,
  alt,
  style,
  fallbackIcon,
  cspTimeout,
  onCspError,
  disabled,
  disabledStyle,
}: WalletMeshSandboxedIconProps): React.JSX.Element {
  const logger = useMemo(() => createComponentLogger('WalletMeshSandboxedIcon'), []);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const [fallbackContent, setFallbackContent] = useState<FallbackIconConfig | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create error recovery instance
  const errorRecovery = createIconErrorRecovery(RECOVERY_PRESETS.conservative);

  useEffect(() => {
    // Track if component is still mounted to prevent state updates after unmount
    let isMounted = true;
    const abortController = new AbortController();
    let currentIframe: HTMLIFrameElement | null = null;
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;

    setHasError(false);
    setIsLoading(true);
    setIframe(null);
    setFallbackContent(null);

    const loadIcon = async () => {
      try {
        // Check if cancelled before starting
        if (!isMounted || abortController.signal.aborted) {
          return;
        }

        // Validate icon data URI early - if empty/invalid, use fallback immediately
        const isValidDataUri = src && src.trim() !== '' && src.startsWith('data:');
        if (!isValidDataUri) {
          logger.debug('Invalid or empty icon data URI, using fallback immediately');

          // If we have a fallback, try to use it
          if (fallbackIcon && fallbackIcon.trim() !== '' && fallbackIcon.startsWith('data:')) {
            // Use fallback icon as the main icon
            const options = normalizeIconOptions({
              iconDataUri: fallbackIcon,
              size,
              ...(cspTimeout !== undefined && { timeout: cspTimeout }),
              ...(disabled !== undefined && { disabled }),
              ...(disabledStyle !== undefined && { disabledStyle }),
            });

            const createdIframe = await createSandboxedIcon(options);
            currentIframe = createdIframe;

            if (isMounted && !abortController.signal.aborted) {
              setIframe(createdIframe);
              setIsLoading(false);
            }
            return;
          } else {
            // No valid fallback either, show error state
            logger.warn('No valid icon or fallback icon available');
            if (isMounted && !abortController.signal.aborted) {
              setHasError(true);
              setIsLoading(false);
            }
            return;
          }
        }

        // Set a timeout to prevent infinite loading state (3 seconds)
        loadingTimeout = setTimeout(() => {
          if (isMounted && !abortController.signal.aborted) {
            logger.warn('Icon loading timed out, falling back');
            setHasError(true);
            setIsLoading(false);
          }
        }, 3000);

        // Normalize icon options using modal-core utility
        const options = normalizeIconOptions({
          iconDataUri: src,
          size,
          ...(fallbackIcon && { fallbackIcon }),
          ...(cspTimeout !== undefined && { timeout: cspTimeout }),
          ...(disabled !== undefined && { disabled }),
          ...(disabledStyle !== undefined && { disabledStyle }),
          ...(onCspError && {
            onCspError: (error: Error | { code: string; message: string; category: string }) => {
              if (isMounted && !abortController.signal.aborted) {
                logger.warn('CSP blocked icon:', error);
                onCspError(error);
              }
            },
          }),
        });

        const createdIframe = await createSandboxedIcon(options);

        // Clear the loading timeout since we succeeded
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        currentIframe = createdIframe;

        // Check if cancelled after async operation
        if (!isMounted || abortController.signal.aborted) {
          // Clean up the iframe if component was unmounted during creation
          if (createdIframe?.parentNode) {
            createdIframe.parentNode.removeChild(createdIframe);
          }
          return;
        }

        // Apply accessibility attributes using modal-core utility
        const a11yAttributes = createIconAccessibilityAttributes({
          ...(alt && { alt }),
          ...(disabled !== undefined && { disabled }),
          clickable: !!onClick,
          loading: false,
        });

        for (const [key, value] of Object.entries(a11yAttributes)) {
          createdIframe.setAttribute(key, value);
        }

        if (isMounted && !abortController.signal.aborted) {
          setIframe(createdIframe);
          setIsLoading(false);
        }
      } catch (error) {
        // Clear the loading timeout on error
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }

        // Check if cancelled before handling error
        if (!isMounted || abortController.signal.aborted) {
          return;
        }

        logger.warn('Failed to create sandboxed icon:', error);

        try {
          // Use error recovery pipeline
          const recoveryResult = await errorRecovery.recover(error as Error, {
            iconDataUri: src,
            size,
            ...(fallbackIcon && { fallbackIcon }),
            ...(cspTimeout !== undefined && { timeout: cspTimeout }),
            ...(disabled !== undefined && { disabled }),
            ...(disabledStyle !== undefined && { disabledStyle }),
          });

          // Check if cancelled after recovery
          if (!isMounted || abortController.signal.aborted) {
            // Clean up any iframe created during recovery
            if (recoveryResult.result instanceof HTMLIFrameElement) {
              const iframe = recoveryResult.result;
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }
            return;
          }

          if (recoveryResult.success && isMounted && !abortController.signal.aborted) {
            if (recoveryResult.result instanceof HTMLIFrameElement) {
              // Recovery returned an iframe (e.g., fallback icon worked)
              currentIframe = recoveryResult.result;
              setIframe(recoveryResult.result);
              setIsLoading(false);
            } else if (
              recoveryResult.result &&
              typeof recoveryResult.result === 'object' &&
              'content' in recoveryResult.result
            ) {
              // Recovery returned a fallback configuration
              const fallbackConfig = recoveryResult.result as FallbackIconConfig;
              setFallbackContent(fallbackConfig);
              setIsLoading(false);
            }
          } else if (isMounted && !abortController.signal.aborted) {
            // All recovery strategies failed
            setHasError(true);
            setIsLoading(false);
          }
        } catch (recoveryError) {
          if (isMounted && !abortController.signal.aborted) {
            logger.error('Error recovery failed:', recoveryError);
            setHasError(true);
            setIsLoading(false);
          }
        }
      }
    };

    loadIcon();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();

      // Clear loading timeout if it exists
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }

      // Clean up any iframe that was created
      if (currentIframe) {
        try {
          if (currentIframe.parentNode) {
            currentIframe.parentNode.removeChild(currentIframe);
          }
        } catch (error) {
          // Ignore cleanup errors
          logger.debug('Iframe cleanup error (likely harmless):', error);
        }
        currentIframe = null;
      }
    };
  }, [
    src,
    size,
    alt,
    fallbackIcon,
    cspTimeout,
    onCspError,
    disabled,
    disabledStyle,
    errorRecovery,
    onClick,
    logger,
  ]);

  // Effect to manage iframe DOM insertion/removal
  useEffect(() => {
    const container = iframeContainerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    if (iframe) {
      // Directly append the iframe element
      container.appendChild(iframe);
    }

    return () => {
      // Cleanup: remove iframe if it exists
      if (iframe && iframe.parentNode === container) {
        container.removeChild(iframe);
      }
    };
  }, [iframe]);

  // Generate container configuration using modal-core utility
  const containerConfig = createIconContainerConfig({
    size,
    ...(disabled !== undefined && { disabled }),
    clickable: !!onClick,
    loading: isLoading,
    ...(className && { className }),
  });

  const containerStyle: React.CSSProperties = {
    ...containerConfig.containerStyles,
    ...style, // Allow style overrides
  };

  const handleClick = (event: React.MouseEvent) => {
    if (onClick && !isLoading && !disabled) {
      event.preventDefault();
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && !isLoading && !disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  };

  // Generate accessibility attributes using modal-core utility
  const a11yAttributes = createIconAccessibilityAttributes({
    ...(alt && { alt }),
    ...(disabled !== undefined && { disabled }),
    clickable: !!onClick,
    loading: isLoading,
  });

  return (
    <div
      className={className}
      style={containerStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...a11yAttributes}
      {...containerConfig.attributes}
      data-has-error={hasError}
      data-testid="sandboxed-icon"
    >
      {isLoading && (
        <div style={containerConfig.loading.styles} {...containerConfig.loading.attributes}>
          {containerConfig.loading.content}
        </div>
      )}
      {!isLoading && !hasError && iframe && <div ref={iframeContainerRef} />}
      {!isLoading && !hasError && fallbackContent && (
        <div
          style={fallbackContent.styles}
          className={fallbackContent.className}
          {...fallbackContent.attributes}
        >
          {fallbackContent.content}
        </div>
      )}
      {!isLoading && hasError && (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontSize: `${size * 0.5}px`,
          }}
          title="Failed to load icon"
        >
          !
        </div>
      )}
    </div>
  );
}

/**
 * Props for the WalletMeshSandboxedWalletIcon component
 * @public
 */
export interface WalletMeshSandboxedWalletIconProps {
  /** Wallet information containing icon and name */
  wallet: {
    id: string;
    name: string;
    icon: string;
  };
  /** Icon size in pixels */
  size?: number;
  /** CSS class name */
  className?: string;
  /** Click handler that receives the wallet ID */
  onClick?: (walletId: string) => void;
  /** Style overrides */
  style?: React.CSSProperties;
  /** Fallback icon data URI to use if CSP blocks the main icon */
  fallbackIcon?: string;
  /** Timeout in ms for CSP detection (default: 3000) */
  cspTimeout?: number;
  /** Callback when CSP error is detected */
  onCspError?: (error: Error | { code: string; message: string; category: string }) => void;
  /** Whether the wallet should appear disabled/greyed out */
  disabled?: boolean;
  /** Custom styling for disabled state */
  disabledStyle?: DisabledIconStyle;
}

/**
 * Convenience component for rendering wallet icons with consistent props
 *
 * This component simplifies wallet icon rendering by accepting a wallet object
 * and automatically handling the wallet ID in click handlers.
 *
 * ## Use Cases
 *
 * - **Wallet Lists**: Render icons in wallet selection grids
 * - **Connection Status**: Show connected wallet icon
 * - **Multi-wallet**: Display multiple connected wallets
 * - **Feature Detection**: Disable unsupported wallets visually
 *
 * @example
 * ```tsx
 * // Basic usage in wallet list
 * {wallets.map(wallet => (
 *   <WalletMeshSandboxedWalletIcon
 *     key={wallet.id}
 *     wallet={wallet}
 *     size={32}
 *     onClick={(walletId) => selectWallet(walletId)}
 *   />
 * ))}
 * ```
 *
 * @example
 * ```tsx
 * // With feature detection
 * <WalletMeshSandboxedWalletIcon
 *   wallet={wallet}
 *   size={40}
 *   disabled={!wallet.supportsChain(currentChain)}
 *   disabledStyle="opacity"
 *   onClick={(walletId) => {
 *     if (wallet.supportsChain(currentChain)) {
 *       connect(walletId);
 *     } else {
 *       showChainSupportError(walletId);
 *     }
 *   }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Connected wallet indicator
 * function ConnectedWalletBadge({ wallet }: { wallet: WalletInfo }) {
 *   return (
 *     <div className="connected-badge">
 *       <WalletMeshSandboxedWalletIcon
 *         wallet={wallet}
 *         size={24}
 *         className="connected-icon"
 *       />
 *       <span>{wallet.name}</span>
 *       <span className="status-dot" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function WalletMeshSandboxedWalletIcon({
  wallet,
  size,
  className,
  onClick,
  style,
  fallbackIcon,
  cspTimeout,
  onCspError,
  disabled,
  disabledStyle,
}: WalletMeshSandboxedWalletIconProps): React.JSX.Element {
  const handleClick = onClick && !disabled ? () => onClick(wallet.id) : undefined;

  return (
    <WalletMeshSandboxedIcon
      src={wallet.icon}
      size={size ?? 24}
      {...(className && { className })}
      {...(handleClick && { onClick: handleClick })}
      alt={`${wallet.name} wallet icon${disabled ? ' (unsupported)' : ''}`}
      {...(style && { style })}
      {...(fallbackIcon && { fallbackIcon })}
      {...(cspTimeout && { cspTimeout })}
      {...(onCspError && { onCspError })}
      {...(disabled !== undefined && { disabled })}
      {...(disabledStyle && { disabledStyle })}
    />
  );
}
