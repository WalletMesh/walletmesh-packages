import { type ThemeMode, useAccount, useTheme, WalletMeshConnectButton } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useId, useState } from 'react';
import styles from '../../styles/DemoCard.module.css';

/**
 * Comprehensive theme demonstration component
 *
 * Showcases all aspects of the WalletMesh theme system including:
 * - Theme mode switching (light/dark/system)
 * - CSS variable customization
 * - System preference detection
 * - Theme persistence
 * - Component theming examples
 */
export function ThemeDemo() {
  const { theme, resolvedTheme, systemTheme, setTheme, toggleTheme, isMounted } = useTheme();
  const { isConnected, address } = useAccount();
  const id = useId();
  // const { connect } = useConnect();

  const [logs, setLogs] = useState<string[]>([]);
  const [customColors, setCustomColors] = useState({
    primary: '#4f46e5',
    background: '#ffffff',
    textPrimary: '#1f2937',
  });

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // Log theme changes
  useEffect(() => {
    if (isMounted) {
      addLog(`Theme changed: ${theme} (resolved: ${resolvedTheme})`);
    }
  }, [theme, resolvedTheme, isMounted, addLog]);

  // Log system theme changes
  useEffect(() => {
    if (isMounted) {
      addLog(`System theme detected: ${systemTheme}`);
    }
  }, [systemTheme, isMounted, addLog]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    addLog(`Manual theme change to: ${newTheme}`);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    addLog('Theme toggled');
  };

  const applyCustomColors = () => {
    // Apply custom colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--wm-color-primary', customColors.primary);
    root.style.setProperty('--wm-color-background', customColors.background);
    root.style.setProperty('--wm-color-text-primary', customColors.textPrimary);
    addLog('Custom colors applied');
  };

  const resetCustomColors = () => {
    // Remove custom CSS variable overrides
    const root = document.documentElement;
    root.style.removeProperty('--wm-color-primary');
    root.style.removeProperty('--wm-color-background');
    root.style.removeProperty('--wm-color-text-primary');
    addLog('Custom colors reset to theme defaults');
  };

  const detectSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    addLog(`System preference detection: ${systemTheme}`);
    return systemTheme;
  };

  if (!isMounted) {
    return (
      <div className={styles.card}>
        <h3>🎨 Theme System Demo</h3>
        <p>Loading theme system...</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h3>🎨 Theme System Demo</h3>
      <p>Demonstrates theme switching, customization, and component theming</p>

      {/* Current Theme Status */}
      <div className={styles.section}>
        <h4>📊 Current Theme Status</h4>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <strong>Theme Mode:</strong> {theme}
          </div>
          <div className={styles.infoItem}>
            <strong>Resolved Theme:</strong> {resolvedTheme}
          </div>
          <div className={styles.infoItem}>
            <strong>System Theme:</strong> {systemTheme}
          </div>
          <div className={styles.infoItem}>
            <strong>Mounted:</strong> {isMounted ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Theme Controls */}
      <div className={styles.section}>
        <h4>🎛️ Theme Controls</h4>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.button} ${theme === 'light' ? styles.buttonActive : ''}`}
            onClick={() => handleThemeChange('light')}
          >
            ☀️ Light
          </button>
          <button
            type="button"
            className={`${styles.button} ${theme === 'dark' ? styles.buttonActive : ''}`}
            onClick={() => handleThemeChange('dark')}
          >
            🌙 Dark
          </button>
          <button
            type="button"
            className={`${styles.button} ${theme === 'system' ? styles.buttonActive : ''}`}
            onClick={() => handleThemeChange('system')}
          >
            🖥️ System
          </button>
          <button type="button" className={styles.button} onClick={handleToggleTheme}>
            🔄 Toggle
          </button>
        </div>
      </div>

      {/* Component Theme Examples */}
      <div className={styles.section}>
        <h4>🧩 Themed Component Examples</h4>
        <div className={styles.componentShowcase}>
          <div className={styles.showcaseItem}>
            <h5>Connect Button Variants</h5>
            <div className={styles.buttonGroup}>
              <WalletMeshConnectButton variant="primary" size="sm" />
              <WalletMeshConnectButton variant="secondary" size="md" />
              <WalletMeshConnectButton variant="outline" size="lg" />
            </div>
          </div>

          <div className={styles.showcaseItem}>
            <h5>Theme-Aware Elements</h5>
            <div
              style={{
                padding: 'var(--wm-space-md)',
                backgroundColor: 'var(--wm-color-surface)',
                border: '1px solid var(--wm-color-border)',
                borderRadius: 'var(--wm-radius-md)',
                color: 'var(--wm-color-text-primary)',
              }}
            >
              <p style={{ margin: 0, fontSize: 'var(--wm-text-base)' }}>
                This element uses CSS variables and automatically adapts to theme changes.
              </p>
              <small style={{ color: 'var(--wm-color-text-secondary)' }}>
                Current theme: {resolvedTheme}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Color Customization */}
      <div className={styles.section}>
        <h4>🎨 Custom Color Override</h4>
        <div className={styles.customizationPanel}>
          <div className={styles.colorInputs}>
            <div className={styles.colorInput}>
              <label htmlFor={`${id}-primary-color`}>Primary Color:</label>
              <input
                id={`${id}-primary-color`}
                type="color"
                value={customColors.primary}
                onChange={(e) => setCustomColors((prev) => ({ ...prev, primary: e.target.value }))}
              />
              <span>{customColors.primary}</span>
            </div>
            <div className={styles.colorInput}>
              <label htmlFor={`${id}-background-color`}>Background Color:</label>
              <input
                id={`${id}-background-color`}
                type="color"
                value={customColors.background}
                onChange={(e) => setCustomColors((prev) => ({ ...prev, background: e.target.value }))}
              />
              <span>{customColors.background}</span>
            </div>
            <div className={styles.colorInput}>
              <label htmlFor={`${id}-text-color`}>Text Color:</label>
              <input
                id={`${id}-text-color`}
                type="color"
                value={customColors.textPrimary}
                onChange={(e) => setCustomColors((prev) => ({ ...prev, textPrimary: e.target.value }))}
              />
              <span>{customColors.textPrimary}</span>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" className={styles.button} onClick={applyCustomColors}>
              Apply Custom Colors
            </button>
            <button type="button" className={styles.button} onClick={resetCustomColors}>
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* System Detection */}
      <div className={styles.section}>
        <h4>🔍 System Detection</h4>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.button} onClick={detectSystemTheme}>
            Detect System Theme
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              const stored = localStorage.getItem('walletmesh-theme');
              addLog(`Stored theme preference: ${stored || 'none'}`);
            }}
          >
            Check Stored Preference
          </button>
        </div>
      </div>

      {/* Connection Status with Theme Context */}
      <div className={styles.section}>
        <h4>🔗 Connection Status (Themed)</h4>
        <div
          style={{
            padding: 'var(--wm-space-md)',
            backgroundColor: isConnected ? 'var(--wm-color-success)' : 'var(--wm-color-surface)',
            color: isConnected ? 'var(--wm-color-text-on-primary)' : 'var(--wm-color-text-primary)',
            borderRadius: 'var(--wm-radius-md)',
            border: `1px solid ${isConnected ? 'var(--wm-color-success)' : 'var(--wm-color-border)'}`,
          }}
        >
          <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
          {isConnected && address && (
            <div style={{ marginTop: 'var(--wm-space-xs)' }}>
              <small>
                Address: {address.slice(0, 6)}...{address.slice(-4)}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className={styles.section}>
        <h4>📝 Theme Activity Log</h4>
        <div className={styles.logContainer}>
          {logs.length === 0 ? (
            <p className={styles.emptyState}>No theme activities yet...</p>
          ) : (
            logs.map((log, index) => (
              <div key={`theme-log-${Date.now()}-${index}`} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={() => {
            setLogs([]);
            addLog('Activity log cleared');
          }}
        >
          Clear Log
        </button>
      </div>
    </div>
  );
}
