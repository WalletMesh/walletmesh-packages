/**
 * Tests for HeartbeatManager
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HealthState,
  type HeartbeatConfig,
  type HeartbeatHandlers,
  HeartbeatManager,
  createHeartbeatManager,
} from './HeartbeatManager.js';
import { ControlType, type PingPayload, type PongPayload } from './protocol.js';

describe('HeartbeatManager', () => {
  let heartbeatManager: HeartbeatManager;
  let mockHandlers: HeartbeatHandlers;
  let config: HeartbeatConfig;

  beforeEach(() => {
    vi.useFakeTimers();

    mockHandlers = {
      onSendPing: vi.fn(),
      onHealthy: vi.fn(),
      onDegraded: vi.fn(),
      onDead: vi.fn(),
      onMetricsUpdate: vi.fn(),
    };

    config = {
      interval: 1000, // 1 second for testing
      timeout: 500, // 500ms timeout
      maxMissed: 3,
      includeMetrics: true,
      autoStart: false, // Don't auto-start for testing
    };
  });

  afterEach(() => {
    heartbeatManager?.dispose();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create heartbeat manager with default config', () => {
      heartbeatManager = new HeartbeatManager({}, mockHandlers);

      const metrics = heartbeatManager.getMetrics();
      expect(metrics.pingsSent).toBe(0);
      expect(metrics.pongsReceived).toBe(0);
      expect(metrics.healthScore).toBe(100);
      expect(heartbeatManager.getHealthState()).toBe(HealthState.Healthy);
    });

    it('should use custom config values', () => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);

      // Start and check first ping is sent after configured interval
      heartbeatManager.start('session_123');

      vi.advanceTimersByTime(999);
      expect(mockHandlers.onSendPing).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);
    });

    it('should auto-start if configured', () => {
      config.autoStart = true;
      heartbeatManager = new HeartbeatManager(config, mockHandlers);

      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);
    });
  });

  describe('Heartbeat Cycle', () => {
    beforeEach(() => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
    });

    it('should send PING messages at configured interval', () => {
      heartbeatManager.start('session_123');

      // First ping
      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);

      // Second ping
      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(2);

      // Third ping
      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(3);
    });

    it('should include correct payload in PING message', () => {
      heartbeatManager.updateMessageStats(10, 8);
      heartbeatManager.start('session_123');

      vi.advanceTimersByTime(1000);

      expect(mockHandlers.onSendPing).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'control',
          type: ControlType.Ping,
          sessionId: 'session_123',
          payload: expect.objectContaining({
            pingTime: expect.any(Number),
            metrics: expect.objectContaining({
              messagesSent: 10,
              messagesReceived: 8,
              lastActivity: expect.any(Number),
            }),
          }),
        }),
      );
    });

    it('should handle PONG response correctly', () => {
      heartbeatManager.start();

      // Send ping
      vi.advanceTimersByTime(1000);
      const pingCall = mockHandlers.onSendPing.mock.calls[0][0];
      const pingPayload = pingCall.payload as PingPayload;

      // Simulate PONG response
      const pongPayload: PongPayload = {
        pingTime: pingPayload.pingTime,
        pongTime: pingPayload.pingTime + 50, // 50ms latency
        metrics: {
          messagesSent: 5,
          messagesReceived: 10,
          latency: 50,
        },
      };

      heartbeatManager.handlePong(pongPayload);

      const metrics = heartbeatManager.getMetrics();
      expect(metrics.pongsReceived).toBe(1);
      expect(metrics.avgLatency).toBe(50);
      expect(metrics.minLatency).toBe(50);
      expect(metrics.maxLatency).toBe(50);
      expect(metrics.consecutiveMissed).toBe(0);
      expect(mockHandlers.onMetricsUpdate).toHaveBeenCalled();
    });

    it('should handle missed PONG', () => {
      heartbeatManager.start();

      // Send ping
      vi.advanceTimersByTime(1000);

      // Wait for timeout (no PONG received)
      vi.advanceTimersByTime(500);

      const metrics = heartbeatManager.getMetrics();
      expect(metrics.missedPongs).toBe(1);
      expect(metrics.consecutiveMissed).toBe(1);
      expect(mockHandlers.onMetricsUpdate).toHaveBeenCalled();
    });

    it('should track multiple PINGs in flight', () => {
      config.interval = 100; // Fast interval for testing
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
      heartbeatManager.start();

      // Send multiple pings before receiving pongs
      vi.advanceTimersByTime(100); // First ping
      vi.advanceTimersByTime(100); // Second ping
      vi.advanceTimersByTime(100); // Third ping

      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(3);

      // Respond to second ping only
      const secondPing = mockHandlers.onSendPing.mock.calls[1][0];
      const pongPayload: PongPayload = {
        pingTime: (secondPing.payload as PingPayload).pingTime,
        pongTime: (secondPing.payload as PingPayload).pingTime + 30,
      };

      heartbeatManager.handlePong(pongPayload);

      const metrics = heartbeatManager.getMetrics();
      expect(metrics.pongsReceived).toBe(1);
      expect(metrics.avgLatency).toBe(30);
    });
  });

  describe('Health State Management', () => {
    beforeEach(() => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
    });

    it('should start in healthy state', () => {
      expect(heartbeatManager.getHealthState()).toBe(HealthState.Healthy);
      expect(heartbeatManager.isHealthy()).toBe(true);
    });

    it('should transition to degraded state on missed pong', () => {
      heartbeatManager.start();

      // Send ping and timeout
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(500); // Timeout

      expect(heartbeatManager.getHealthState()).toBe(HealthState.Degraded);
      expect(mockHandlers.onDegraded).toHaveBeenCalled();
    });

    it('should transition to dead state after max missed pongs', () => {
      heartbeatManager.start();

      // Miss 3 consecutive pongs
      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(1000); // Send ping
        vi.advanceTimersByTime(500); // Timeout
      }

      expect(heartbeatManager.getHealthState()).toBe(HealthState.Dead);
      expect(mockHandlers.onDead).toHaveBeenCalled();

      // Should stop sending pings
      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(3);
    });

    it('should recover from degraded state on successful pong', () => {
      heartbeatManager.start();

      // Miss first pong
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(500);
      expect(heartbeatManager.getHealthState()).toBe(HealthState.Degraded);

      // Second ping succeeds
      vi.advanceTimersByTime(500); // Complete interval
      const secondPing = mockHandlers.onSendPing.mock.calls[1][0];
      const pongPayload: PongPayload = {
        pingTime: (secondPing.payload as PingPayload).pingTime,
        pongTime: (secondPing.payload as PingPayload).pingTime + 50,
      };

      heartbeatManager.handlePong(pongPayload);

      expect(heartbeatManager.getHealthState()).toBe(HealthState.Healthy);
      expect(mockHandlers.onHealthy).toHaveBeenCalled();
    });

    it('should calculate health score based on latency and missed pongs', () => {
      heartbeatManager.start();

      // Good latency pong
      vi.advanceTimersByTime(1000);
      const firstPing = mockHandlers.onSendPing.mock.calls[0][0];
      heartbeatManager.handlePong({
        pingTime: (firstPing.payload as PingPayload).pingTime,
        pongTime: (firstPing.payload as PingPayload).pingTime + 30, // 30ms - excellent
      });

      let metrics = heartbeatManager.getMetrics();
      expect(metrics.healthScore).toBe(100);

      // High latency pong
      vi.advanceTimersByTime(1000);
      const secondPing = mockHandlers.onSendPing.mock.calls[1][0];
      heartbeatManager.handlePong({
        pingTime: (secondPing.payload as PingPayload).pingTime,
        pongTime: (secondPing.payload as PingPayload).pingTime + 600, // 600ms - fair
      });

      metrics = heartbeatManager.getMetrics();
      expect(metrics.healthScore).toBeLessThan(100);
      expect(metrics.healthScore).toBeGreaterThan(50);
    });
  });

  describe('Latency Tracking', () => {
    beforeEach(() => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
    });

    it('should track latency history', () => {
      heartbeatManager.start();

      const latencies = [50, 100, 75, 60, 80];

      for (let i = 0; i < latencies.length; i++) {
        vi.advanceTimersByTime(1000);
        const ping = mockHandlers.onSendPing.mock.calls[i][0];
        heartbeatManager.handlePong({
          pingTime: (ping.payload as PingPayload).pingTime,
          pongTime: (ping.payload as PingPayload).pingTime + latencies[i],
        });
      }

      const metrics = heartbeatManager.getMetrics();
      expect(metrics.minLatency).toBe(50);
      expect(metrics.maxLatency).toBe(100);
      expect(metrics.avgLatency).toBe(73); // Average of latencies
    });

    it('should limit latency history size', () => {
      heartbeatManager.start();

      // Send more than maxHistorySize (10) pings
      for (let i = 0; i < 15; i++) {
        vi.advanceTimersByTime(1000);
        const ping = mockHandlers.onSendPing.mock.calls[i][0];
        heartbeatManager.handlePong({
          pingTime: (ping.payload as PingPayload).pingTime,
          pongTime: (ping.payload as PingPayload).pingTime + i * 10, // Increasing latency
        });
      }

      const metrics = heartbeatManager.getMetrics();
      // Average should be of last 10 values (50, 60, 70, 80, 90, 100, 110, 120, 130, 140)
      expect(metrics.avgLatency).toBe(95);
    });
  });

  describe('Message Statistics', () => {
    beforeEach(() => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
    });

    it('should include message stats in ping', () => {
      heartbeatManager.updateMessageStats(100, 95);
      heartbeatManager.start();

      vi.advanceTimersByTime(1000);

      const ping = mockHandlers.onSendPing.mock.calls[0][0];
      expect((ping.payload as PingPayload).metrics?.messagesSent).toBe(100);
      expect((ping.payload as PingPayload).metrics?.messagesReceived).toBe(95);
    });

    it('should update received stats from pong', () => {
      heartbeatManager.start();

      vi.advanceTimersByTime(1000);
      const ping = mockHandlers.onSendPing.mock.calls[0][0];

      heartbeatManager.handlePong({
        pingTime: (ping.payload as PingPayload).pingTime,
        pongTime: (ping.payload as PingPayload).pingTime + 50,
        metrics: {
          messagesReceived: 200,
          messagesSent: 195,
          latency: 50,
        },
      });

      // Next ping should reflect updated stats
      vi.advanceTimersByTime(1000);
      const nextPing = mockHandlers.onSendPing.mock.calls[1][0];
      // The received count from remote becomes our sent count perspective
      expect((nextPing.payload as PingPayload).metrics?.messagesReceived).toBe(200);
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
    });

    it('should stop sending pings when stopped', () => {
      heartbeatManager.start();

      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);

      heartbeatManager.stop();

      vi.advanceTimersByTime(2000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1); // No new pings
    });

    it('should clear pending pings when stopped', () => {
      heartbeatManager.start();

      vi.advanceTimersByTime(1000); // Send ping
      heartbeatManager.stop();

      // Try to send pong after stop - should be ignored
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      heartbeatManager.handlePong({
        pingTime: Date.now(),
        pongTime: Date.now() + 50,
      });

      expect(consoleSpy).toHaveBeenCalledWith('[HeartbeatManager] Received unexpected PONG');
      consoleSpy.mockRestore();
    });

    it('should restart cleanly', () => {
      heartbeatManager.start('session_1');

      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);

      heartbeatManager.stop();
      heartbeatManager.start('session_2');

      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(2);

      // Check session ID is updated
      const secondPing = mockHandlers.onSendPing.mock.calls[1][0];
      expect(secondPing.sessionId).toBe('session_2');
    });

    it('should reset metrics', () => {
      heartbeatManager.start();

      // Generate some metrics
      vi.advanceTimersByTime(1000);
      const ping = mockHandlers.onSendPing.mock.calls[0][0];
      heartbeatManager.handlePong({
        pingTime: (ping.payload as PingPayload).pingTime,
        pongTime: (ping.payload as PingPayload).pingTime + 50,
      });

      let metrics = heartbeatManager.getMetrics();
      expect(metrics.pingsSent).toBe(1);
      expect(metrics.pongsReceived).toBe(1);

      heartbeatManager.resetMetrics();

      metrics = heartbeatManager.getMetrics();
      expect(metrics.pingsSent).toBe(0);
      expect(metrics.pongsReceived).toBe(0);
      expect(metrics.avgLatency).toBe(0);
      expect(metrics.minLatency).toBe(Number.POSITIVE_INFINITY);
      expect(metrics.maxLatency).toBe(0);
    });

    it('should dispose properly', () => {
      heartbeatManager.start();

      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);

      heartbeatManager.dispose();

      vi.advanceTimersByTime(2000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1); // No new pings

      // Should be able to get metrics after dispose
      const metrics = heartbeatManager.getMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      heartbeatManager = new HeartbeatManager(config, mockHandlers);
    });

    it('should handle unexpected PONG', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      heartbeatManager.handlePong({
        pingTime: Date.now(),
        pongTime: Date.now() + 50,
      });

      expect(consoleSpy).toHaveBeenCalledWith('[HeartbeatManager] Received unexpected PONG');
      consoleSpy.mockRestore();
    });

    it('should handle duplicate PONG', () => {
      heartbeatManager.start();

      vi.advanceTimersByTime(1000);
      const ping = mockHandlers.onSendPing.mock.calls[0][0];
      const pongPayload: PongPayload = {
        pingTime: (ping.payload as PingPayload).pingTime,
        pongTime: (ping.payload as PingPayload).pingTime + 50,
      };

      // First pong - should succeed
      heartbeatManager.handlePong(pongPayload);
      expect(heartbeatManager.getMetrics().pongsReceived).toBe(1);

      // Duplicate pong - should be ignored
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      heartbeatManager.handlePong(pongPayload);
      expect(consoleSpy).toHaveBeenCalledWith('[HeartbeatManager] Received unexpected PONG');
      expect(heartbeatManager.getMetrics().pongsReceived).toBe(1);
      consoleSpy.mockRestore();
    });

    it('should handle PONG with missing metrics', () => {
      heartbeatManager.start();

      vi.advanceTimersByTime(1000);
      const ping = mockHandlers.onSendPing.mock.calls[0][0];

      heartbeatManager.handlePong({
        pingTime: (ping.payload as PingPayload).pingTime,
        pongTime: (ping.payload as PingPayload).pingTime + 50,
        // No metrics field
      });

      const metrics = heartbeatManager.getMetrics();
      expect(metrics.pongsReceived).toBe(1);
      expect(metrics.avgLatency).toBe(50);
    });

    it('should handle memory usage when not available', () => {
      // Mock performance.memory as undefined
      const originalPerformance = global.performance;
      Object.defineProperty(global, 'performance', {
        value: {},
        writable: true,
        configurable: true,
      });

      heartbeatManager.start();
      vi.advanceTimersByTime(1000);

      const ping = mockHandlers.onSendPing.mock.calls[0][0];
      expect((ping.payload as PingPayload).metrics?.memoryUsage).toBeUndefined();

      // Restore
      global.performance = originalPerformance;
    });
  });

  describe('Factory Function', () => {
    it('should create heartbeat manager with factory', () => {
      const manager = createHeartbeatManager(mockHandlers, config);
      expect(manager).toBeInstanceOf(HeartbeatManager);

      manager.start();
      vi.advanceTimersByTime(1000);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);

      manager.dispose();
    });

    it('should use default config when not provided', () => {
      const manager = createHeartbeatManager(mockHandlers);
      expect(manager).toBeInstanceOf(HeartbeatManager);

      // Default interval is 30 seconds
      manager.start();
      vi.advanceTimersByTime(29999);
      expect(mockHandlers.onSendPing).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockHandlers.onSendPing).toHaveBeenCalledTimes(1);

      manager.dispose();
    });
  });
});
