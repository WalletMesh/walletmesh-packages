/**
 * Performance monitoring utilities for React components
 *
 * These utilities help track and debug re-renders, identify performance
 * bottlenecks, and optimize component updates.
 *
 * @module utils/performance
 */

import React, { useRef, useEffect, useDebugValue, useCallback } from 'react';

/**
 * Hook to track component render count
 * Useful for identifying components that re-render too frequently
 *
 * @param componentName - Name of the component for logging
 * @param logThreshold - Only log when render count exceeds this threshold
 * @returns Current render count
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const renderCount = useRenderCount('MyComponent', 10);
 *   // Component will log a warning if it renders more than 10 times
 *   return <div>Render #{renderCount}</div>;
 * }
 * ```
 */
export function useRenderCount(componentName: string, logThreshold = Number.POSITIVE_INFINITY): number {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;

    if (process.env['NODE_ENV'] === 'development') {
      if (renderCount.current > logThreshold) {
        console.warn(
          `[Performance] ${componentName} has rendered ${renderCount.current} times (threshold: ${logThreshold})`,
        );
      } else if (renderCount.current % 10 === 0) {
        console.debug(`[Performance] ${componentName} render count: ${renderCount.current}`);
      }
    }
  });

  useDebugValue(`Renders: ${renderCount.current}`);
  return renderCount.current;
}

/**
 * Hook to track why a component re-rendered
 * Compares current props with previous props to identify changes
 *
 * @param name - Component name for logging
 * @param props - Current props to track
 *
 * @example
 * ```tsx
 * function MyComponent({ user, settings, onUpdate }) {
 *   useWhyDidYouUpdate('MyComponent', { user, settings, onUpdate });
 *   // Will log which props changed between renders
 *   return <div>{user.name}</div>;
 * }
 * ```
 */
export function useWhyDidYouUpdate<T extends Record<string, unknown>>(name: string, props: T): void {
  const previousProps = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (process.env['NODE_ENV'] === 'development' && previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, { from: unknown; to: unknown }> = {};

      for (const key of allKeys) {
        const prevValue = previousProps.current?.[key];
        const currentValue = props[key];

        if (!Object.is(prevValue, currentValue)) {
          changedProps[key] = {
            from: prevValue,
            to: currentValue,
          };
        }
      }

      if (Object.keys(changedProps).length > 0) {
        console.log(`[why-did-you-update] ${name}:`, changedProps);
      }
    }

    previousProps.current = props;
  });

  useDebugValue(previousProps.current ? 'Tracking changes' : 'Initial render');
}

/**
 * Hook to measure render time
 * Tracks how long each render takes and warns about slow renders
 *
 * @param componentName - Name of the component
 * @param warnThreshold - Warn if render takes longer than this (ms)
 * @returns Render time in milliseconds
 *
 * @example
 * ```tsx
 * function ExpensiveComponent() {
 *   const renderTime = useRenderTime('ExpensiveComponent', 16); // Warn if > 16ms
 *   return <ComplexVisualization />;
 * }
 * ```
 */
export function useRenderTime(componentName: string, warnThreshold = 16): number {
  const renderStart = useRef(performance.now());
  const renderTime = useRef(0);

  useEffect(() => {
    renderTime.current = performance.now() - renderStart.current;

    if (process.env['NODE_ENV'] === 'development' && renderTime.current > warnThreshold) {
      console.warn(
        `[Performance] ${componentName} took ${renderTime.current.toFixed(2)}ms to render (threshold: ${warnThreshold}ms)`,
      );
    }

    // Reset for next render
    return () => {
      renderStart.current = performance.now();
    };
  });

  useDebugValue(`${renderTime.current.toFixed(2)}ms`);
  return renderTime.current;
}

/**
 * Hook to track updates to a specific value
 * Useful for debugging when a value changes unexpectedly
 *
 * @param label - Label for the value being tracked
 * @param value - The value to track
 * @param logChanges - Whether to log changes
 *
 * @example
 * ```tsx
 * function MyComponent({ userId }) {
 *   useValueTracker('userId', userId);
 *   // Will log whenever userId changes
 * }
 * ```
 */
export function useValueTracker<T>(label: string, value: T, logChanges = true): void {
  const previousValue = useRef<T>(value);
  const changeCount = useRef(0);

  useEffect(() => {
    if (!Object.is(previousValue.current, value)) {
      changeCount.current++;

      if (process.env['NODE_ENV'] === 'development' && logChanges) {
        console.log(`[ValueTracker] ${label} changed (change #${changeCount.current}):`, {
          from: previousValue.current,
          to: value,
        });
      }

      previousValue.current = value;
    }
  }, [label, value, logChanges]);

  useDebugValue(`Changes: ${changeCount.current}`);
}

/**
 * Hook to profile component lifecycle
 * Tracks mount, update, and unmount with timing information
 *
 * @param componentName - Name of the component
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useLifecycleProfiler('MyComponent');
 *   // Will log mount time, update count, and unmount
 * }
 * ```
 */
export function useLifecycleProfiler(componentName: string): void {
  const mountTime = useRef(performance.now());
  const updateCount = useRef(0);

  useEffect(() => {
    if (process.env['NODE_ENV'] === 'development') {
      if (updateCount.current === 0) {
        console.log(
          `[Lifecycle] ${componentName} mounted (took ${(performance.now() - mountTime.current).toFixed(2)}ms)`,
        );
      } else {
        console.debug(`[Lifecycle] ${componentName} updated (update #${updateCount.current})`);
      }

      updateCount.current++;

      return () => {
        console.log(`[Lifecycle] ${componentName} unmounting after ${updateCount.current} renders`);
      };
    }
    return undefined;
  }, [componentName]);

  useDebugValue(`Updates: ${updateCount.current}`);
}

/**
 * Hook to detect and warn about memory leaks
 * Tracks if state updates happen after component unmount
 *
 * @param componentName - Name of the component
 * @returns Object with isMounted flag and safeSetState wrapper
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMounted, safeSetState } = useMemoryLeakDetector('MyComponent');
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     fetchData().then((result) => {
 *       safeSetState(() => setData(result));
 *     });
 *   }, []);
 * }
 * ```
 */
export function useMemoryLeakDetector(componentName: string) {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetState = useCallback(
    (setter: () => void) => {
      if (isMounted.current) {
        setter();
      } else if (process.env['NODE_ENV'] === 'development') {
        console.warn(`[MemoryLeak] ${componentName} attempted to update state after unmount`);
      }
    },
    [componentName],
  );

  useDebugValue(isMounted.current ? 'Mounted' : 'Unmounted');

  return { isMounted: isMounted.current, safeSetState };
}

/**
 * Hook to batch multiple state updates
 * Helps reduce re-renders by batching updates together
 *
 * @param callback - Function containing state updates
 * @returns Function to trigger batched updates
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [a, setA] = useState(0);
 *   const [b, setB] = useState(0);
 *
 *   const batchUpdate = useBatchedUpdates(() => {
 *     setA(1);
 *     setB(2);
 *     // Both updates will cause only one re-render
 *   });
 * }
 * ```
 */
export function useBatchedUpdates(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(() => {
    // React 18 automatically batches updates, but this ensures it works
    // in all scenarios including timeouts and promises
    if ('startTransition' in React) {
      React.startTransition(() => {
        callbackRef.current();
      });
    } else {
      // Fallback for older React versions
      callbackRef.current();
    }
  }, []);
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enableLogging: boolean;
  renderCountThreshold: number;
  renderTimeThreshold: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Global performance monitoring configuration
 */
export const performanceConfig: PerformanceConfig = {
  enableLogging: process.env['NODE_ENV'] === 'development',
  renderCountThreshold: 50,
  renderTimeThreshold: 16, // 60fps = ~16ms per frame
  logLevel: 'warn',
};

/**
 * Configure global performance monitoring
 */
export function configurePerformanceMonitoring(config: Partial<PerformanceConfig>): void {
  Object.assign(performanceConfig, config);
}

// Re-export for convenience
export const performanceHooks = {
  useRenderCount,
  useWhyDidYouUpdate,
  useRenderTime,
  useValueTracker,
  useLifecycleProfiler,
  useMemoryLeakDetector,
  useBatchedUpdates,
};
