/// <reference types="chrome"/>

/**
 * Chrome extension API type definitions
 * These types augment the standard Chrome extension types with additional specificity
 * for our use cases and improved type safety
 */
declare namespace chrome {
  namespace runtime {
    /**
     * Chrome runtime port for long-lived connections
     * @interface Port
     */
    interface Port {
      /** Name of the connection */
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
     * Information about the sender of a message
     * @interface MessageSender
     */
    interface MessageSender {
      /** Extension ID of the sender */
      id?: string;
      /** Tab that sent the message */
      tab?: chrome.tabs.Tab;
      /** Frame ID that sent the message */
      frameId?: number;
      /** URL of the sender */
      url?: string;
      /** Origin of the sender */
      origin?: string;
    }

    /**
     * Chrome runtime API interface
     * @interface RuntimeStatic
     */
    interface RuntimeStatic {
      /** Create a connection to an extension */
      connect: (extensionId: string, connectInfo?: { name?: string }) => Port;
      /** Current extension ID */
      id: string;
      /** Last error that occurred */
      lastError: { message: string } | null;
      /** Handle incoming connections */
      onConnect: {
        addListener(callback: (port: Port) => void): void;
        removeListener(callback: (port: Port) => void): void;
      };
      /** Handle incoming external connections */
      onConnectExternal: {
        addListener(callback: (port: Port) => void): void;
        removeListener(callback: (port: Port) => void): void;
      };
      /** Handle incoming messages */
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
      /** Handle incoming external messages */
      onMessageExternal: {
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

    /** Runtime API instance */
    const runtime: RuntimeStatic;
  }
}

/**
 * Global window augmentation
 * Adds Chrome runtime API to the window object type
 */
declare global {
  interface Window {
    /** Chrome extension API */
    chrome?: {
      /** Runtime API */
      runtime: chrome.runtime.RuntimeStatic;
    };
  }
}

export {};
