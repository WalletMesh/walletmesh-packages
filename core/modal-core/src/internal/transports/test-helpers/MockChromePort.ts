/**
 * Mock Chrome Port for testing
 * @internal
 */

import { type Mock, vi } from 'vitest';

/**
 * Mock implementation of Chrome extension port for testing
 * @class MockChromePort
 */
export class MockChromePort {
  public name = 'test-port';

  private messageListeners: Array<(message: unknown) => void> = [];
  private disconnectListeners: Array<() => void> = [];

  public onMessage = {
    addListener: (callback: (message: unknown) => void) => {
      this.messageListeners.push(callback);
    },
    removeListener: (callback: (message: unknown) => void) => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    },
  };

  public onDisconnect = {
    addListener: (callback: () => void) => {
      this.disconnectListeners.push(callback);
    },
    removeListener: (callback: () => void) => {
      const index = this.disconnectListeners.indexOf(callback);
      if (index > -1) {
        this.disconnectListeners.splice(index, 1);
      }
    },
  };

  public postMessage: Mock<(message: unknown) => void>;
  public disconnect: Mock<() => void>;

  constructor() {
    this.postMessage = vi.fn();
    this.disconnect = vi.fn();
  }

  /**
   * Test helper: Simulate receiving a message
   * @param {unknown} message - Message data to send to all registered listeners
   */
  public simulateMessage(message: unknown): void {
    for (const listener of this.messageListeners) {
      listener(message);
    }
  }

  /**
   * Test helper: Simulate disconnection
   */
  public simulateDisconnect(): void {
    for (const listener of this.disconnectListeners) {
      listener();
    }
  }
}
