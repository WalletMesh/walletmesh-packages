/**
 * Protocol message types for wallet communication.
 */

const MessageTypes = {
  HANDSHAKE: 'HANDSHAKE',
  HANDSHAKE_COMPLETE: 'HANDSHAKE_COMPLETE',
  HANDSHAKE_FAILED: 'HANDSHAKE_FAILED',
  GET_PROVIDER: 'GET_PROVIDER',
  PROVIDER_READY: 'PROVIDER_READY',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
} as const;

// Message type discriminator type
export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes];

// Base message interface
export interface WalletMessage {
  type: MessageType;
}

// Protocol handshake messages
export interface HandshakeMessage extends WalletMessage {
  type: typeof MessageTypes.HANDSHAKE;
  version: string;
  wallet: string;
}

export interface HandshakeCompleteMessage extends WalletMessage {
  type: typeof MessageTypes.HANDSHAKE_COMPLETE;
}

export interface HandshakeFailedMessage extends WalletMessage {
  type: typeof MessageTypes.HANDSHAKE_FAILED;
  error: string;
}

// Provider messages
export interface GetProviderMessage extends WalletMessage {
  type: typeof MessageTypes.GET_PROVIDER;
}

export interface ProviderReadyMessage extends WalletMessage {
  type: typeof MessageTypes.PROVIDER_READY;
  provider: unknown;
}

export interface ProviderErrorMessage extends WalletMessage {
  type: typeof MessageTypes.PROVIDER_ERROR;
  error: string;
}

// Union type of all possible messages
export type WalletProtocolMessage =
  | HandshakeMessage
  | HandshakeCompleteMessage
  | HandshakeFailedMessage
  | GetProviderMessage
  | ProviderReadyMessage
  | ProviderErrorMessage;

// Type guard to check if an unknown value is a WalletProtocolMessage
export function isWalletMessage(data: unknown): data is WalletProtocolMessage {
  if (!data || typeof data !== 'object') return false;

  const msg = data as Partial<WalletMessage>;
  if (typeof msg.type !== 'string') return false;

  return Object.values(MessageTypes).includes(msg.type as MessageType);
}

export { MessageTypes };
