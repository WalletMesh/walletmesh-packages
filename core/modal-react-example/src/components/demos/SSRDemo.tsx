import { useSSR } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/DemoCard.module.css';

interface StateCardProps {
  title: string;
  value: string | boolean;
  type?: 'success' | 'warning' | 'error' | 'default';
}

function StateCard({ title, value, type = 'default' }: StateCardProps) {
  const getValueClass = () => {
    switch (type) {
      case 'success':
        return styles.valueSuccess;
      case 'warning':
        return styles.valueWarning;
      case 'error':
        return styles.valueError;
      default:
        return styles.valueDefault;
    }
  };

  return (
    <div className={styles.statusItem}>
      <span className={styles.label}>{title}:</span>
      <span className={getValueClass()}>
        {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}
      </span>
    </div>
  );
}

/**
 * Demonstrates SSR (Server-Side Rendering) utilities with useSSR hook
 */
export function SSRDemo() {
  const { isServer, isBrowser, isMounted, isHydrated } = useSSR();
  const [serverValue] = useState('Initial Server Value');
  const [clientValue, setClientValue] = useState('Initial Client Value');

  // Client-safe values using useSSR
  const [safeClientValue, setSafeClientValue] = useState('Loading...');
  const [currentTime, setCurrentTime] = useState('SSR placeholder');

  // Progressive enhancement state
  const [enhancedContent, setEnhancedContent] = useState(false);

  // Deferred rendering state
  const [shouldRenderExpensive, setShouldRenderExpensive] = useState(false);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // Set up client-only values after hydration
  useEffect(() => {
    if (isHydrated) {
      setSafeClientValue(`Client-only value: ${Date.now()}`);
      setCurrentTime(new Date().toLocaleTimeString());
      addLog('Hydration complete - client values initialized');
    }
  }, [isHydrated, addLog]);

  // Progressive enhancement
  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        setEnhancedContent(true);
        addLog('Progressive enhancement activated');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isMounted, addLog]);

  // Deferred expensive rendering
  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        setShouldRenderExpensive(true);
        addLog('Expensive component ready to render');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, addLog]);

  // Animation after hydration
  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        addLog('Animations enabled');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, addLog]);

  // Update time periodically
  useEffect(() => {
    if (!isHydrated) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, [isHydrated]);

  // Client-only actions
  const handleClientAction = () => {
    if (isHydrated) {
      const timestamp = Date.now();
      setClientValue(`Client action at ${timestamp}`);
      addLog(`Client action performed: ${timestamp}`);

      // Example of safe browser API usage
      if (typeof window !== 'undefined') {
        const userAgent = window.navigator.userAgent;
        addLog(`User Agent: ${userAgent.substring(0, 50)}...`);
      }
    }
  };

  const testWindowApi = () => {
    if (isHydrated && typeof window !== 'undefined') {
      const screenInfo = {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
      };
      addLog(`Screen: ${screenInfo.width}x${screenInfo.height}, ${screenInfo.colorDepth}-bit color`);
    }
  };

  const testLocalStorage = () => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        const key = 'ssr-demo-test';
        const value = `Test value ${Date.now()}`;
        localStorage.setItem(key, value);
        const retrieved = localStorage.getItem(key);
        addLog(`LocalStorage test: ${retrieved === value ? 'Success' : 'Failed'}`);
        localStorage.removeItem(key);
      } catch (error) {
        addLog(`LocalStorage error: ${(error as Error).message}`);
      }
    }
  };

  return (
    <div className={`${styles.demoCard} ${isAnimating ? styles.fadeIn : ''}`}>
      <h3 className={styles.demoTitle}>🌐 SSR (Server-Side Rendering) Demo</h3>

      <div className={styles.section}>
        <h4>SSR Detection States</h4>
        <div className={styles.statusGrid}>
          <StateCard title="Is Server" value={isServer} type={isServer ? 'warning' : 'success'} />
          <StateCard title="Is Browser" value={isBrowser} type={isBrowser ? 'success' : 'warning'} />
          <StateCard title="Is Mounted" value={isMounted} type={isMounted ? 'success' : 'warning'} />
          <StateCard title="Is Hydrated" value={isHydrated} type={isHydrated ? 'success' : 'warning'} />
        </div>
      </div>

      <div className={styles.section}>
        <h4>Safe Value Rendering</h4>
        <div className={styles.statusGrid}>
          <StateCard title="Server Value" value={serverValue} />
          <StateCard title="Client Value" value={clientValue} />
          <StateCard
            title="Safe Client Value"
            value={safeClientValue}
            type={isHydrated ? 'success' : 'default'}
          />
          <StateCard title="Current Time" value={currentTime} type={isHydrated ? 'success' : 'default'} />
        </div>
      </div>

      <div className={styles.section}>
        <h4>Progressive Enhancement</h4>
        <div className={styles.infoBox}>
          {!enhancedContent ? (
            <p>🔄 Loading basic content (server-safe)...</p>
          ) : (
            <div>
              <p>✨ Enhanced content loaded!</p>
              <p>This content includes client-side features and interactions.</p>
              {shouldRenderExpensive && (
                <div className={styles.expensiveContent}>
                  <strong>Expensive Component:</strong> This was deferred for performance
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h4>Client-Only Actions</h4>
        <div className={styles.actions}>
          <button type="button" onClick={handleClientAction} className={styles.button} disabled={!isHydrated}>
            Perform Client Action
          </button>
          <button type="button" onClick={testWindowApi} className={styles.button} disabled={!isHydrated}>
            Test Window API
          </button>
          <button type="button" onClick={testLocalStorage} className={styles.button} disabled={!isHydrated}>
            Test LocalStorage
          </button>
        </div>
        {!isHydrated && <p className={styles.warning}>⚠️ Client actions are disabled during SSR/hydration</p>}
      </div>

      <div className={styles.logsSection}>
        <h4>SSR Event Logs</h4>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <div className={styles.logEmpty}>No SSR events yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={`ssr-log-${Date.now()}-${i}`} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.codeExample}>
        <h4>useSSR Hook Usage</h4>
        <pre className={styles.code}>
          {`// Primary SSR detection hook
const { isServer, isBrowser, isMounted, isHydrated } = useSSR();

// Safe client-side rendering
if (isHydrated) {
  // Safe to use browser APIs
  const width = window.innerWidth;
  localStorage.setItem('key', 'value');
}

// Progressive enhancement pattern
const [enhanced, setEnhanced] = useState(false);
useEffect(() => {
  if (isMounted) {
    // Add client-side enhancements
    setEnhanced(true);
  }
}, [isMounted]);

// Defer expensive operations
const [showExpensive, setShowExpensive] = useState(false);
useEffect(() => {
  if (isHydrated) {
    const timer = setTimeout(() => {
      setShowExpensive(true);
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [isHydrated]);

// Conditional rendering
return (
  <div>
    {isServer && <p>Server-side content</p>}
    {isHydrated && <ClientOnlyComponent />}
    {showExpensive && <ExpensiveComponent />}
  </div>
);`}
        </pre>
      </div>
    </div>
  );
}
