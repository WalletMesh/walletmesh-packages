import { useErrorBoundary, useSSR } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/DemoCard.module.css';

interface StorageCardProps {
  title: string;
  value: string;
  onUpdate: () => void;
  type: 'local' | 'session';
}

function StorageCard({ title, value, onUpdate, type }: StorageCardProps) {
  return (
    <div className={styles.methodCard}>
      <h5>{title}</h5>
      <p>
        Current value: <strong>{value || 'Empty'}</strong>
      </p>
      <div className={styles.statusItem}>
        <span className={styles.label}>Storage Type:</span>
        <span className={styles.valueDefault}>{type === 'local' ? 'localStorage' : 'sessionStorage'}</span>
      </div>
      <button type="button" onClick={onUpdate} className={`${styles.button} ${styles.buttonSmall}`}>
        Update {title}
      </button>
    </div>
  );
}

interface MediaQueryCardProps {
  title: string;
  query: string;
  matches: boolean;
}

function MediaQueryCard({ title, query, matches }: MediaQueryCardProps) {
  return (
    <div className={styles.methodCard}>
      <h5>{title}</h5>
      <p>
        <code>{query}</code>
      </p>
      <div className={styles.statusItem}>
        <span className={styles.label}>Matches:</span>
        <span className={matches ? styles.valueSuccess : styles.valueError}>
          {matches ? '✅ Yes' : '❌ No'}
        </span>
      </div>
    </div>
  );
}

/**
 * Demonstrates browser utility hooks for storage, media queries, and error handling
 */
export function BrowserUtilitiesDemo() {
  const { isMounted: hasMounted, isHydrated } = useSSR();
  const { captureError, resetErrorBoundary } = useErrorBoundary();

  // Storage state (simplified without the internal hook)
  const [localStorageValue, setLocalStorageValue] = useState(() => {
    if (!isHydrated) return 'initial-local-value';
    try {
      return localStorage.getItem('walletmesh-demo-local') || 'initial-local-value';
    } catch {
      return 'initial-local-value';
    }
  });

  const [sessionStorageValue, setSessionStorageValue] = useState(() => {
    if (!isHydrated) return 'initial-session-value';
    try {
      return sessionStorage.getItem('walletmesh-demo-session') || 'initial-session-value';
    } catch {
      return 'initial-session-value';
    }
  });

  // Media query state (simplified without the internal hook)
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighDPI, setIsHighDPI] = useState(false);

  const [customValue, setCustomValue] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [hasError, setHasError] = useState(false);

  // Setup media query listeners
  useEffect(() => {
    if (!isHydrated) return;

    const queries = [
      { query: '(max-width: 768px)', setter: setIsMobile },
      { query: '(min-width: 769px) and (max-width: 1024px)', setter: setIsTablet },
      { query: '(min-width: 1025px)', setter: setIsDesktop },
      { query: '(prefers-color-scheme: dark)', setter: setIsDarkMode },
      { query: '(prefers-reduced-motion: reduce)', setter: setIsReducedMotion },
      { query: '(min-resolution: 2dppx)', setter: setIsHighDPI },
    ];

    const mediaQueries = queries.map(({ query, setter }) => {
      const mq = window.matchMedia(query);
      setter(mq.matches);
      const handler = (e: MediaQueryListEvent) => setter(e.matches);
      mq.addEventListener('change', handler);
      return { mq, handler };
    });

    return () => {
      for (const { mq, handler } of mediaQueries) {
        mq.removeEventListener('change', handler);
      }
    };
  }, [isHydrated]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      addLog('Browser utilities initialized');
      addLog(`Device type: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}`);
      addLog(`Color scheme: ${isDarkMode ? 'Dark' : 'Light'}`);
    }
  }, [hasMounted, isMobile, isTablet, isDarkMode, addLog]);

  // Monitor media query changes
  useEffect(() => {
    if (hasMounted) {
      addLog(`Screen size changed: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}`);
    }
  }, [isMobile, isTablet, hasMounted, addLog]);

  const updateLocalStorage = () => {
    const newValue = `Updated at ${new Date().toLocaleTimeString()}`;
    setLocalStorageValue(newValue);
    if (isHydrated) {
      try {
        localStorage.setItem('walletmesh-demo-local', newValue);
      } catch {}
    }
    addLog(`Local storage updated: ${newValue}`);
  };

  const updateSessionStorage = () => {
    const newValue = `Session ${Math.floor(Math.random() * 1000)}`;
    setSessionStorageValue(newValue);
    if (isHydrated) {
      try {
        sessionStorage.setItem('walletmesh-demo-session', newValue);
      } catch {}
    }
    addLog(`Session storage updated: ${newValue}`);
  };

  const clearAllStorage = () => {
    setLocalStorageValue('');
    setSessionStorageValue('');
    if (isHydrated) {
      try {
        localStorage.removeItem('walletmesh-demo-local');
        sessionStorage.removeItem('walletmesh-demo-session');
      } catch {}
    }
    addLog('All storage cleared');
  };

  const testCustomStorage = () => {
    if (!customValue.trim()) {
      addLog('Please enter a custom value first');
      return;
    }

    try {
      localStorage.setItem('walletmesh-custom', customValue);
      addLog(`Custom value stored: ${customValue}`);
      setCustomValue('');
    } catch (error) {
      addLog(`Storage error: ${(error as Error).message}`);
    }
  };

  const simulateError = () => {
    try {
      setHasError(true);
      throw new Error('Simulated error for testing error boundary');
    } catch (error) {
      captureError(error as Error);
      addLog(`Error captured: ${(error as Error).message}`);
    }
  };

  const resetError = () => {
    setHasError(false);
    resetErrorBoundary();
    addLog('Error boundary reset');
  };

  const testMediaQueryAPI = () => {
    if (window?.matchMedia) {
      const query = '(orientation: landscape)';
      const mediaQuery = window.matchMedia(query);
      addLog(`Media query "${query}": ${mediaQuery.matches ? 'matches' : 'does not match'}`);
    } else {
      addLog('Media query API not available');
    }
  };

  return (
    <div className={styles.demoCard}>
      <h3 className={styles.demoTitle}>🌐 Browser Utilities</h3>

      <div className={styles.section}>
        <h4>Device & Environment Detection</h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Has Mounted:</span>
            <span className={hasMounted ? styles.valueSuccess : styles.valueWarning}>
              {hasMounted ? 'Yes' : 'No'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Device Type:</span>
            <span className={styles.valueDefault}>
              {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Color Scheme:</span>
            <span className={styles.valueDefault}>{isDarkMode ? 'Dark' : 'Light'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Reduced Motion:</span>
            <span className={isReducedMotion ? styles.valueWarning : styles.valueSuccess}>
              {isReducedMotion ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Browser Storage</h4>
        <div className={styles.disconnectMethods}>
          <StorageCard
            title="Local Storage"
            value={localStorageValue}
            onUpdate={updateLocalStorage}
            type="local"
          />
          <StorageCard
            title="Session Storage"
            value={sessionStorageValue}
            onUpdate={updateSessionStorage}
            type="session"
          />
        </div>

        <div className={styles.actions}>
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Enter custom value..."
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              marginRight: '8px',
              flex: 1,
            }}
          />
          <button type="button" onClick={testCustomStorage} className={styles.button}>
            Store Custom Value
          </button>
          <button
            type="button"
            onClick={clearAllStorage}
            className={`${styles.button} ${styles.buttonDanger}`}
          >
            Clear All Storage
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Media Queries</h4>
        <div className={styles.disconnectMethods}>
          <MediaQueryCard title="Mobile Device" query="(max-width: 768px)" matches={isMobile} />
          <MediaQueryCard
            title="Tablet Device"
            query="(min-width: 769px) and (max-width: 1024px)"
            matches={isTablet}
          />
          <MediaQueryCard title="Desktop Device" query="(min-width: 1025px)" matches={isDesktop} />
          <MediaQueryCard title="Dark Mode" query="(prefers-color-scheme: dark)" matches={isDarkMode} />
          <MediaQueryCard title="High DPI" query="(min-resolution: 2dppx)" matches={isHighDPI} />
          <MediaQueryCard
            title="Reduced Motion"
            query="(prefers-reduced-motion: reduce)"
            matches={isReducedMotion}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4>Error Handling</h4>
        <div className={styles.infoBox}>
          <strong>Error Boundary:</strong> This demo shows how to capture and handle errors gracefully.
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={simulateError}
            className={`${styles.button} ${styles.buttonWarning}`}
          >
            Simulate Error
          </button>
          <button type="button" onClick={resetError} className={styles.button} disabled={!hasError}>
            Reset Error Boundary
          </button>
          <button type="button" onClick={testMediaQueryAPI} className={styles.button}>
            Test Media Query API
          </button>
        </div>
        {hasError && (
          <div className={styles.errorBox}>
            ⚠️ An error has been captured by the error boundary. Use "Reset Error Boundary" to clear it.
          </div>
        )}
      </div>

      <div className={styles.logsSection}>
        <h4>Browser Utility Logs</h4>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <div className={styles.logEmpty}>No browser events yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={`browser-log-${Date.now()}-${i}`} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.codeExample}>
        <h4>Hook Usage Examples</h4>
        <pre className={styles.code}>
          {`// SSR-safe browser detection
const { isMounted, isHydrated, isServer, isBrowser } = useSSR();

// Manual storage management (internal utilities no longer exposed)
const [value, setValue] = useState(() => {
  if (!isHydrated) return 'default';
  return localStorage.getItem('key') || 'default';
});

// Manual media query handling
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  if (!isHydrated) return;
  const mq = window.matchMedia('(max-width: 768px)');
  setIsMobile(mq.matches);
  const handler = (e) => setIsMobile(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, [isHydrated]);

// Error boundary utilities
const { captureError, resetErrorBoundary } = useErrorBoundary();

// Usage examples
if (isHydrated) {
  // Safe to use browser APIs
  if (isMobile) {
    // Mobile-specific logic
  }
}

// Storage updates
setValue('new value');
if (isHydrated) {
  localStorage.setItem('key', 'new value');
}

// Error handling
try {
  riskyOperation();
} catch (error) {
  captureError(error);
}`}
        </pre>
      </div>
    </div>
  );
}
