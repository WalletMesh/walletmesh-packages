# Cross-Window Transport Architecture

## Overview

This document describes the cross-window transport architecture used for secure communication between dApps and wallets in the WalletMesh ecosystem. The transport provides a clean, secure, and demonstrative implementation suitable for production use and as a reference for others.

## Key Design Principles

### 1. Unidirectional Message Acceptance
Each transport instance is configured with separate send and receive message IDs:
- **Send Message ID**: The ID attached to outgoing messages
- **Receive Message ID**: The ID that must match for incoming messages to be accepted

This prevents message loops where a transport might receive its own messages, which was a critical issue in earlier implementations.

### 2. Strict Origin Validation
- No wildcard origins allowed for security
- Origin must be explicitly provided and validated
- Messages from unexpected origins are rejected

### 3. Clean Separation of Concerns
- DApp transport sends with 'dapp_to_wallet', receives 'wallet_to_dapp'
- Wallet transport sends with 'wallet_to_dapp', receives 'dapp_to_wallet'
- Each side only processes messages intended for it

## Message Flow

```
DApp                                    Wallet
  |                                        |
  |-- [dapp_to_wallet] -->                 |
  |   (Request)                            |
  |                                        |
  |                  <-- [wallet_to_dapp] -|
  |                      (Response)        |
```

## Implementation

### DApp Side (modal-core)

```typescript
// In AztecExampleWalletAdapter.ts
this.transport = new CrossWindowTransport(
  {
    targetWindow: popupWindow,
    targetOrigin: walletOrigin,
    sendMessageId: 'dapp_to_wallet',     // DApp sends with this ID
    receiveMessageId: 'wallet_to_dapp',  // DApp receives with this ID
  },
  logger,
  errorHandler,
);
```

### Wallet Side (example-wallet)

```typescript
// Using createWalletSideTransport helper
const transport = createWalletSideTransport(
  window.opener,  // Target window (the dApp)
  dappOrigin      // Origin from URL parameter
);

// This internally creates:
createCrossWindowTransport(
  dappWindow,
  dappOrigin,
  'wallet_to_dapp',  // Send ID
  'dapp_to_wallet'   // Receive ID
);
```

## Security Features

### Origin Validation
1. **URL Parameter**: DApp passes its origin as URL parameter when opening wallet
2. **Validation**: Wallet validates the origin format and pins it
3. **Strict Checking**: Every message is checked against the pinned origin
4. **No Wildcards**: Wildcard origins are explicitly rejected

### Message Wrapping
All messages are wrapped in a standardized format:
```typescript
interface CrossWindowMessage {
  type: 'walletmesh_message';
  origin: string;        // Sender's origin for verification
  data: unknown;         // The actual JSON-RPC payload
  id: string;           // Message ID for routing
}
```

## Error Prevention

### Common Issues Prevented
1. **Message Loops**: Separate send/receive IDs prevent self-reception
2. **Cross-Talk**: Message IDs ensure only intended messages are processed
3. **Origin Spoofing**: Strict origin validation prevents unauthorized messages
4. **Window Reference Issues**: Origin-based validation works across all browsers

## Usage Example

### Complete Flow

1. **DApp Opens Wallet**:
```typescript
const walletUrl = 'http://127.0.0.1:5174';
const dappOrigin = window.location.origin;
const walletWindow = window.open(
  `${walletUrl}?dappOrigin=${encodeURIComponent(dappOrigin)}`,
  'walletMeshAztecWallet',
  'width=400,height=600'
);
```

2. **DApp Creates Transport**:
```typescript
const transport = new CrossWindowTransport({
  targetWindow: walletWindow,
  targetOrigin: walletUrl,
  sendMessageId: 'dapp_to_wallet',
  receiveMessageId: 'wallet_to_dapp'
});
```

3. **Wallet Receives Origin**:
```typescript
const urlParams = new URLSearchParams(window.location.search);
const dappOrigin = decodeURIComponent(urlParams.get('dappOrigin'));
```

4. **Wallet Creates Transport**:
```typescript
const transport = createWalletSideTransport(window.opener, dappOrigin);
```

5. **Bidirectional Communication**:
- DApp sends requests with 'dapp_to_wallet' ID
- Wallet receives only 'dapp_to_wallet' messages
- Wallet sends responses with 'wallet_to_dapp' ID
- DApp receives only 'wallet_to_dapp' messages

## Benefits

1. **No Message Loops**: Clean separation prevents self-reception
2. **Clear Architecture**: Easy to understand message flow
3. **Production Ready**: Secure defaults and validation
4. **Demo Value**: Clear example for others to follow
5. **Cross-Browser**: Works reliably across all modern browsers
6. **Debugging**: Comprehensive logging for troubleshooting

## Testing

To test the transport:

1. Start the example dApp: `pnpm dev` in `/aztec/example-dapp`
2. Start the example wallet: `pnpm preview` in `/aztec/example-wallet`
3. Connect from the dApp
4. Check console logs for message flow

Look for:
- `[CrossWindowTransport] SENDING wrapped message` with correct IDs
- `[CrossWindowTransport] Accepting message with ID` showing proper filtering
- No "Ignoring message from unexpected origin" errors
- No "Ignoring wrapped message with wrong ID" errors

## Troubleshooting

### Common Issues

1. **"Ignoring message from unexpected origin"**
   - Check that dApp passes correct origin in URL
   - Verify wallet extracts and validates origin correctly

2. **"Ignoring wrapped message with wrong ID"**
   - Ensure send/receive IDs are properly configured
   - DApp should send 'dapp_to_wallet', receive 'wallet_to_dapp'
   - Wallet should send 'wallet_to_dapp', receive 'dapp_to_wallet'

3. **Messages not arriving**
   - Check browser console for errors
   - Verify window references are valid
   - Ensure origins match exactly (including protocol and port)

## Future Improvements

1. **Message Encryption**: Add optional encryption for sensitive data
2. **Rate Limiting**: Implement rate limiting for DoS prevention
3. **Message Compression**: Compress large payloads
4. **Reconnection Logic**: Automatic reconnection on disconnect

## Conclusion

This transport architecture provides a secure, clean, and understandable implementation for cross-window communication. By using separate send and receive message IDs, strict origin validation, and clear separation of concerns, it prevents common issues while serving as an excellent reference implementation for others building similar systems.