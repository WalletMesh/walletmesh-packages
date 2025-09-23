/**
 * StrictMode-aware logger that prevents duplicate log entries in React development mode
 */

interface LogEntry {
  message: string;
  data: unknown;
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
}

class StrictModeLogger {
  private logHistory = new Map<string, LogEntry>();
  private readonly DEDUP_WINDOW_MS = 100; // Consider logs within 100ms as duplicates

  private createLogKey(level: string, message: string, data: unknown): string {
    return `${level}:${message}:${JSON.stringify(data)}`;
  }

  private shouldLog(key: string, level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const now = Date.now();
    const existing = this.logHistory.get(key);

    if (!existing) {
      this.logHistory.set(key, { message: '', data: null, timestamp: now, level });
      return true;
    }

    // If the log is within the deduplication window, skip it
    if (now - existing.timestamp < this.DEDUP_WINDOW_MS) {
      return false;
    }

    // Update timestamp and allow logging
    existing.timestamp = now;
    return true;
  }

  debug(message: string, data?: unknown): void {
    if (process.env['NODE_ENV'] !== 'development') {
      console.debug(message, data);
      return;
    }

    const key = this.createLogKey('debug', message, data);
    if (this.shouldLog(key, 'debug')) {
      console.debug(message, data);
    }
  }

  info(message: string, data?: unknown): void {
    if (process.env['NODE_ENV'] !== 'development') {
      console.info(message, data);
      return;
    }

    const key = this.createLogKey('info', message, data);
    if (this.shouldLog(key, 'info')) {
      console.info(message, data);
    }
  }

  warn(message: string, data?: unknown): void {
    if (process.env['NODE_ENV'] !== 'development') {
      console.warn(message, data);
      return;
    }

    const key = this.createLogKey('warn', message, data);
    if (this.shouldLog(key, 'warn')) {
      console.warn(message, data);
    }
  }

  error(message: string, data?: unknown): void {
    if (process.env['NODE_ENV'] !== 'development') {
      console.error(message, data);
      return;
    }

    const key = this.createLogKey('error', message, data);
    if (this.shouldLog(key, 'error')) {
      console.error(message, data);
    }
  }

  // Standard console.log that always logs (for important messages)
  log(message: string, data?: unknown): void {
    console.log(message, data);
  }

  // Clean up old entries periodically
  private cleanup(): void {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 5000; // 5 seconds

    for (const [key, entry] of this.logHistory.entries()) {
      if (now - entry.timestamp > CLEANUP_THRESHOLD) {
        this.logHistory.delete(key);
      }
    }
  }

  // Start periodic cleanup
  constructor() {
    if (typeof window !== 'undefined' && process.env['NODE_ENV'] === 'development') {
      setInterval(() => this.cleanup(), 10000); // Cleanup every 10 seconds
    }
  }
}

// Export a singleton instance
export const strictModeLogger = new StrictModeLogger();

// Export a hook for React components
export function useStrictModeLogger(componentName: string) {
  const logger = {
    debug: (message: string, data?: unknown) => strictModeLogger.debug(`[${componentName}] ${message}`, data),
    info: (message: string, data?: unknown) => strictModeLogger.info(`[${componentName}] ${message}`, data),
    warn: (message: string, data?: unknown) => strictModeLogger.warn(`[${componentName}] ${message}`, data),
    error: (message: string, data?: unknown) => strictModeLogger.error(`[${componentName}] ${message}`, data),
    log: (message: string, data?: unknown) => strictModeLogger.log(`[${componentName}] ${message}`, data),
  };

  return logger;
}
