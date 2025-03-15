/**
 * Chrome Type Definitions
 * Provides type definitions for Chrome extension APIs used by the wallet client
 * These types augment the standard Chrome types with additional type safety
 *
 * @module chrome-types
 */
declare namespace ChromeTypes {
  export namespace Runtime {
    /**
     * Port interface for long-lived connections
     * Used for communication between extension and web page
     */
    interface Port {
      /** Connection name */
      name: string;
      /** Disconnect the port */
      disconnect(): void;
      /** Handler for port disconnection */
      onDisconnect: {
        addListener(callback: () => void): void;
        removeListener(callback: () => void): void;
      };
      /** Handler for incoming messages */
      onMessage: {
        addListener(callback: (message: unknown) => void): void;
        removeListener(callback: (message: unknown) => void): void;
      };
      /** Send message through the port */
      postMessage: (message: unknown) => void;
    }

    /**
     * Message sender information
     * Contains details about the origin of a message
     */
    interface MessageSender {
      /** Extension ID */
      id?: string;
      /** Tab that sent the message */
      tab?: ChromeTypes.Tabs.Tab;
      /** Frame ID that sent the message */
      frameId?: number;
      /** URL of sender */
      url?: string;
      /** Origin of sender */
      origin?: string;
    }

    /**
     * Chrome runtime API interface
     * Core functionality for extension communication
     */
    interface RuntimeStatic {
      /** Create a connection to an extension */
      connect(extensionId: string, connectInfo?: { name?: string }): Port;
      /** Extension ID */
      id: string;
      /** Last error that occurred */
      lastError: { message: string } | null;
      /** Handler for incoming connections */
      onConnect: {
        addListener(callback: (port: Port) => void): void;
        removeListener(callback: (port: Port) => void): void;
      };
      /** Handler for one-time messages */
      onMessage: {
        addListener(
          callback: (
            message: unknown,
            sender: MessageSender,
            sendResponse: (response: unknown) => void,
          ) => true | undefined,
        ): void;
        removeListener(
          callback: (
            message: unknown,
            sender: MessageSender,
            sendResponse: (response: unknown) => void,
          ) => true | undefined,
        ): void;
      };
    }
  }

  export namespace Tabs {
    /**
     * Chrome tab information
     * Contains details about a browser tab
     */
    interface Tab {
      /** Tab ID */
      id?: number;
      /** Tab URL */
      url?: string;
    }
  }
}

/**
 * Global window augmentation
 * Adds Chrome APIs to the window object type
 */
declare global {
  interface Window {
    /** Chrome extension APIs */
    chrome?: {
      /** Runtime API */
      runtime: ChromeTypes.Runtime.RuntimeStatic;
      /** Tabs API */
      tabs: ChromeTypes.Tabs.Tab;
    };
  }
}

/**
 * Global Chrome object definition
 * Available in extension context
 */
declare const chrome: {
  /** Runtime API */
  runtime: ChromeTypes.Runtime.RuntimeStatic;
  /** Tabs API */
  tabs: ChromeTypes.Tabs.Tab;
};

/** Export Chrome types */
export type Chrome = typeof ChromeTypes;
export default ChromeTypes;
