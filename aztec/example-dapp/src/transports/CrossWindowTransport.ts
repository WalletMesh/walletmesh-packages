import type { JSONRPCTransport } from '@walletmesh/jsonrpc';

export type CrossWindowMessage = {
  type: 'walletmesh_message';
  origin: string;
  data: unknown;
  id: string;
};

export function createCrossWindowTransport(
  targetWindow: Window,
  targetOrigin: string,
  messageId: string
): JSONRPCTransport {
  const messageHandlers = new Set<(message: unknown) => void>();

  const transport: JSONRPCTransport = {
    send: async (message: unknown) => {
      const wrappedMessage: CrossWindowMessage = {
        type: 'walletmesh_message',
        origin: window.location.origin,
        data: message,
        id: messageId,
      };
      targetWindow.postMessage(wrappedMessage, targetOrigin);
    },
    onMessage: (handler: (message: unknown) => void) => {
      messageHandlers.add(handler);
      return () => {
        messageHandlers.delete(handler);
      };
    },
  };

  const handleMessage = (event: MessageEvent) => {
    // Verify origin if not wildcard
    if (targetOrigin !== '*' && event.origin !== targetOrigin) {
      return;
    }

    // Check if it's our message type
    if (event.data?.type !== 'walletmesh_message') {
      return;
    }

    // Check if it's for our message ID
    if (event.data?.id !== messageId) {
      return;
    }

    // Forward to all handlers
    for (const handler of messageHandlers) {
      handler(event.data.data);
    }
  };

  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return Object.assign(transport, {
    cleanup: () => {
      window.removeEventListener('message', handleMessage);
      messageHandlers.clear();
    },
  });
}

export function createDappToWalletTransport(walletWindow: Window, walletOrigin: string): JSONRPCTransport {
  return createCrossWindowTransport(walletWindow, walletOrigin, 'dapp_to_wallet');
}

export function createWalletToDappTransport(dappWindow: Window, dappOrigin: string): JSONRPCTransport {
  return createCrossWindowTransport(dappWindow, dappOrigin, 'wallet_to_dapp');
}
