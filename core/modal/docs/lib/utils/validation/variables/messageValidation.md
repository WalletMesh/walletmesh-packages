[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/utils/validation](../README.md) / messageValidation

# Variable: messageValidation

> `const` **messageValidation**: `object`

Defined in: [core/modal/src/lib/utils/validation.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/utils/validation.ts#L23)

Collection of validation utilities for message handling and security.

Provides standardized validation functions used across transport
and adapter implementations to ensure message integrity and
enforce security policies.

## Type declaration

### isValidMessage()

Validates message structure and content.

#### Parameters

##### message

`unknown`

Message to validate

#### Returns

`boolean`

True if message is valid, false otherwise

#### Remarks

Performs basic validation:
- Ensures message is not null/undefined
- Verifies message is an object type
- Additional validation can be added as needed

#### Example

```typescript
const isValid = messageValidation.isValidMessage({
  type: 'request',
  data: { ... }
});
```

### isValidOrigin()

Validates message origin for security.

#### Parameters

##### messageOrigin

`string`

Origin of received message

##### allowedOrigin?

`string`

Permitted origin (optional)

#### Returns

`boolean`

True if origin is valid, false otherwise

#### Remarks

Security considerations:
- If allowedOrigin is not specified, all origins are accepted
- Exact string matching is used for origin comparison
- Origin validation is critical for cross-origin security

#### Example

```typescript
const isValid = messageValidation.isValidOrigin(
  'https://wallet.example.com',
  'https://wallet.example.com'
);
```

## Example

```typescript
import { messageValidation } from './validation';

// Validate message format
if (!messageValidation.isValidMessage(receivedData)) {
  throw new Error('Invalid message format');
}

// Check message origin
if (!messageValidation.isValidOrigin(event.origin, allowedOrigin)) {
  throw new Error('Invalid message origin');
}
```
