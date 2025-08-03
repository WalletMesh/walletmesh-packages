[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryInitiator

# Class: DiscoveryInitiator

Defined in: [initiator/DiscoveryInitiator.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L68)

Discovery listener for initiators to discover and connect to qualified responders.

Implements the capability-first discovery model where initiators broadcast their
capability requirements and only responders that can fulfill ALL requirements
respond. This preserves responder privacy by avoiding enumeration.

Features:
- Privacy-preserving: Only qualified responders respond
- Secure: Origin validation and session management
- Efficient: Timeout-based discovery with configurable limits
- Type-safe: Comprehensive TypeScript support

## Examples

```typescript
const listener = new DiscoveryInitiator({
  requirements: {
    chains: ['eip155:1'],
    features: ['account-management', 'transaction-signing'],
    interfaces: ['eip-1193']
  },
  initiatorInfo: {
    name: 'My DeFi App',
    url: 'https://myapp.com',
    icon: 'data:image/svg+xml;base64,...'
  },
  timeout: 5000
});

const responders = await listener.startDiscovery();
console.log(`Found ${responders.length} qualified responders`);
```

```typescript
const listener = new DiscoveryInitiator({
  requirements: {
    chains: ['eip155:1'],
    features: ['account-management'],
    interfaces: ['eip-1193']
  },
  preferences: {
    features: ['hardware-wallet', 'batch-transactions']
  },
  dappInfo: { } // dApp info
});
```

## Since

0.1.0

## See

 - [DiscoveryResponder](DiscoveryResponder.md) for wallet-side implementation
 - Connection handling is done by higher-level libraries (modal-core, modal-react)

## Constructors

### Constructor

> **new DiscoveryInitiator**(`config`): `DiscoveryInitiator`

Defined in: [initiator/DiscoveryInitiator.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L81)

#### Parameters

##### config

[`DiscoveryInitiatorConfig`](../interfaces/DiscoveryInitiatorConfig.md)

#### Returns

`DiscoveryInitiator`

## Discovery

### getQualifiedResponders()

> **getQualifiedResponders**(): [`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

Defined in: [initiator/DiscoveryInitiator.ts:288](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L288)

Get the list of qualified wallets from the last discovery.

Returns a defensive copy of the qualified wallets array.
Results are preserved until the next discovery starts.

#### Returns

[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

Array of qualified wallets (defensive copy)

#### Example

```typescript
await listener.startDiscovery();

const wallets = listener.getQualifiedResponders();
wallets.forEach(wallet => {
  logger.info(`${wallet.name}: ${wallet.matched.required.chains}`);
});
```

#### Since

0.1.0

***

### isDiscoveryInProgress()

> **isDiscoveryInProgress**(): `boolean`

Defined in: [initiator/DiscoveryInitiator.ts:325](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L325)

Check if discovery is currently in progress.

Returns true between startDiscovery() call and completion/termination.
Useful for UI state management and preventing concurrent discoveries.

#### Returns

`boolean`

True if discovery is active, false otherwise

#### Example

```typescript
if (!listener.isDiscoveryInProgress()) {
  await listener.startDiscovery();
} else {
  logger.info('Discovery already in progress...');
}
```

#### Since

0.1.0

***

### startDiscovery()

> **startDiscovery**(): `Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Defined in: [initiator/DiscoveryInitiator.ts:126](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L126)

Start discovery process by broadcasting capability requirements.

Initiates the capability-first discovery process:
1. Generates unique session ID for replay protection
2. Broadcasts discovery request to all listening wallets
3. Collects responses from qualified wallets
4. Returns list of wallets that can fulfill ALL requirements

#### Returns

`Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Promise that resolves to array of qualified wallets

#### Throws

If discovery is already in progress

#### Throws

If origin validation fails (in secure environments)

#### Example

```typescript
try {
  const wallets = await listener.startDiscovery();

  if (wallets.length === 0) {
    console.log('No qualified wallets found');
  } else {
    console.log('Available wallets:', wallets.map(w => w.name));
  }
} catch (error) {
  logger.error('Discovery failed:', error.message);
}
```

#### Since

0.1.0

***

### stopDiscovery()

> **stopDiscovery**(): `void`

Defined in: [initiator/DiscoveryInitiator.ts:238](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L238)

Stop the current discovery process.

Immediately terminates discovery, clears timeouts, and returns
any wallets found so far. Safe to call multiple times.

#### Returns

`void`

#### Example

```typescript
// Start discovery with timeout
const discoveryPromise = listener.startDiscovery();

// Stop early if needed
setTimeout(() => {
  listener.stopDiscovery();
}, 2000);

const wallets = await discoveryPromise;
```

#### Since

0.1.0

## Other

### dispose()

> **dispose**(): `void`

Defined in: [initiator/DiscoveryInitiator.ts:700](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L700)

Cleanup resources on disposal.

#### Returns

`void`

***

### getCurrentSessionId()

> **getCurrentSessionId**(): `null` \| `string`

Defined in: [initiator/DiscoveryInitiator.ts:332](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L332)

Get the current session ID.

#### Returns

`null` \| `string`

***

### getQualifiedResponder()

> **getQualifiedResponder**(`responderId`): `undefined` \| [`QualifiedResponder`](../interfaces/QualifiedResponder.md)

Defined in: [initiator/DiscoveryInitiator.ts:301](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L301)

Get a specific qualified responder by its ID.

Retrieves a responder from the last discovery results using its
ephemeral responder ID. Returns undefined if not found.

#### Parameters

##### responderId

`string`

The responder ID to look up

#### Returns

`undefined` \| [`QualifiedResponder`](../interfaces/QualifiedResponder.md)

The qualified responder if found, undefined otherwise

***

### getState()

> **getState**(): [`ProtocolState`](../type-aliases/ProtocolState.md)

Defined in: [initiator/DiscoveryInitiator.ts:378](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L378)

Get the current protocol state.

#### Returns

[`ProtocolState`](../type-aliases/ProtocolState.md)

***

### getStats()

> **getStats**(): `object`

Defined in: [initiator/DiscoveryInitiator.ts:346](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L346)

Get discovery statistics.

#### Returns

`object`

##### config

> **config**: `object`

###### config.preferencesCount

> **preferencesCount**: `null` \| \{ `chains`: `number`; `features`: `number`; \}

###### config.requirementsCount

> **requirementsCount**: `object`

###### config.requirementsCount.chains

> **chains**: `number`

###### config.requirementsCount.features

> **features**: `number`

###### config.requirementsCount.interfaces

> **interfaces**: `number`

###### config.timeout

> **timeout**: `number`

##### currentState

> **currentState**: [`ProtocolState`](../type-aliases/ProtocolState.md)

##### qualifiedWallets

> **qualifiedWallets**: [`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]

##### qualifiedWalletsCount

> **qualifiedWalletsCount**: `number`

##### securityStats

> **securityStats**: `object`

###### securityStats.duplicateResponses

> **duplicateResponses**: `object`[]

###### securityStats.seenRespondersCount

> **seenRespondersCount**: `number`

##### sessionId

> **sessionId**: `null` \| `string`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [initiator/DiscoveryInitiator.ts:339](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/initiator/DiscoveryInitiator.ts#L339)

Update the discovery configuration.

#### Parameters

##### config

`Partial`\<[`DiscoveryInitiatorConfig`](../interfaces/DiscoveryInitiatorConfig.md)\>

#### Returns

`void`
