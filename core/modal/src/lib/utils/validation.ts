/**
 * Shared message validation utilities
 */
export const messageValidation = {
  /**
   * Checks if a message is valid for transport
   */
  isValidMessage(message: unknown): boolean {
    if (!message || typeof message !== 'object') {
      return false;
    }
    return true;
  },

  /**
   * Validates message origin against allowed origin
   */
  isValidOrigin(messageOrigin: string, allowedOrigin?: string): boolean {
    if (!allowedOrigin) return true;
    return messageOrigin === allowedOrigin;
  },
};

/**
 * Shared error messages
 */
export const errorMessages = {
  notConnected: 'Transport not connected',
  invalidMessage: 'Invalid message format',
  invalidOrigin: 'Invalid message origin',
};
