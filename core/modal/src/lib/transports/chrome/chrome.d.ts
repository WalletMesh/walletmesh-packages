/**
 * @file chrome.d.ts
 * @packageDocumentation
 * Type definitions for Chrome extension APIs used in transport.
 */

import type { ChromeMessage } from './types.js';

declare namespace chrome {
  namespace runtime {
    interface Port {
      name: string;
      disconnect(): void;
      error?: Error;
      onDisconnect: EventChannel;
      onMessage: EventChannel;
      postMessage(message: ChromeMessage): void;
      sender?: MessageSender;
    }

    interface MessageSender {
      id?: string;
      url?: string;
      tab?: chrome.tabs.Tab;
      frameId?: number;
      origin?: string;
    }

    interface EventChannel {
      addListener(callback: (message: ChromeMessage, sender?: MessageSender) => void): void;
      removeListener(callback: (message: ChromeMessage, sender?: MessageSender) => void): void;
    }

    function connect(extensionId?: string, connectInfo?: { name?: string }): Port;

    const lastError: Error | undefined;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
    }
  }
}
