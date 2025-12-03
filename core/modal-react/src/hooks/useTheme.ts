/**
 * useTheme hook for WalletMesh React theme management
 *
 * Provides a simple interface for accessing and controlling theme state
 * with SSR safety and automatic system preference detection.
 *
 * @module hooks/useTheme
 * @packageDocumentation
 */

import { useThemeContext } from '../theme/ThemeContext.js';
import type { UseThemeReturn } from '../theme/types.js';

export type { UseThemeReturn } from '../theme/types.js';

/**
 * Hook for accessing theme state and controls
 *
 * Provides access to current theme, theme configuration, and theme controls.
 * Automatically handles system preference detection and persistence.
 *
 * @example Basic usage
 * ```tsx
 * import { useTheme } from '@walletmesh/modal-react';
 *
 * function ThemeToggle() {
 *   const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <p>Resolved theme: {resolvedTheme}</p>
 *       <button onClick={toggleTheme}>
 *         Toggle Theme
 *       </button>
 *       <button onClick={() => setTheme('system')}>
 *         Use System Theme
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Theme-aware component
 * ```tsx
 * import { useTheme } from '@walletmesh/modal-react';
 *
 * function ThemedButton({ children }: { children: React.ReactNode }) {
 *   const { resolvedTheme, themeConfig } = useTheme();
 *
 *   const buttonStyle = {
 *     backgroundColor: themeConfig.colors.primary,
 *     color: themeConfig.colors.textOnPrimary,
 *     border: `1px solid ${themeConfig.colors.border}`,
 *     borderRadius: themeConfig.borderRadius.md,
 *     padding: `${themeConfig.spacing.sm} ${themeConfig.spacing.md}`,
 *   };
 *
 *   return (
 *     <button style={buttonStyle}>
 *       {children}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Conditional rendering based on theme
 * ```tsx
 * import { useTheme } from '@walletmesh/modal-react';
 *
 * function ConditionalIcon() {
 *   const { resolvedTheme } = useTheme();
 *
 *   return (
 *     <div>
 *       {resolvedTheme === 'dark' ? (
 *         <MoonIcon />
 *       ) : (
 *         <SunIcon />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example SSR-safe theme detection
 * ```tsx
 * import { useTheme } from '@walletmesh/modal-react';
 *
 * function SSRSafeComponent() {
 *   const { isMounted, resolvedTheme } = useTheme();
 *
 *   if (!isMounted) {
 *     // Render SSR-safe content
 *     return <div>Loading theme...</div>;
 *   }
 *
 *   return (
 *     <div data-theme={resolvedTheme}>
 *       Theme-dependent content
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {UseThemeReturn} Theme state and controls
 *
 * @throws {Error} If used outside of ThemeProvider or WalletMeshProvider with theme support
 */
export function useTheme(): UseThemeReturn {
  return useThemeContext();
}
