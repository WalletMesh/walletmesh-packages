[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletPreferenceService

# Class: WalletPreferenceService

Re-export core services

## Constructors

### Constructor

> **new WalletPreferenceService**(`dependencies`): `WalletPreferenceService`

#### Parameters

##### dependencies

[`WalletPreferenceServiceDependencies`](../interfaces/WalletPreferenceServiceDependencies.md)

#### Returns

`WalletPreferenceService`

## Methods

### addToHistory()

> **addToHistory**(`walletId`, `walletInfo?`): `void`

Add wallet to selection history

Records a wallet selection in the usage history. Updates usage count and
last used timestamp if the wallet already exists in history. Maintains
the history size according to the configured maxHistoryEntries.

#### Parameters

##### walletId

`string`

The ID of the wallet to add to history

##### walletInfo?

[`WalletInfo`](../interfaces/WalletInfo.md)

Optional wallet information to store with the history entry

#### Returns

`void`

#### Remarks

Emits the `history-updated` event when a wallet is added to history

#### Example

```typescript
// Add to history when user selects a wallet
prefService.addToHistory('metamask', {
  id: 'metamask',
  name: 'MetaMask',
  icon: 'metamask-icon.svg',
  chains: ['1', '137', '42161']
});
```

***

### cleanup()

> **cleanup**(): `void`

Clean up resources

Saves current state to storage (if persistence is enabled) and clears all
in-memory preferences and history. Should be called when the service is
no longer needed.

#### Returns

`void`

#### Example

```typescript
// On application shutdown
prefService.cleanup();
```

***

### clearAllPreferences()

> **clearAllPreferences**(): `void`

Clear all preferences

Removes all stored wallet preferences. This is a destructive operation that
clears all auto-connect settings and custom preference data for all wallets.

#### Returns

`void`

#### Example

```typescript
// Reset all preferences
if (confirm('Clear all wallet preferences?')) {
  prefService.clearAllPreferences();
}
```

***

### clearHistory()

> **clearHistory**(): `void`

Clear all history

Removes all wallet usage history. This does not affect stored preferences,
only the history tracking.

#### Returns

`void`

#### Example

```typescript
// Clear history for privacy
prefService.clearHistory();
console.log('Wallet history cleared');
```

***

### clearWalletPreference()

> **clearWalletPreference**(`walletId`): `void`

Clear preferences for a wallet

Removes all stored preferences for a specific wallet. This includes auto-connect
settings and any custom preference data.

#### Parameters

##### walletId

`string`

The ID of the wallet to clear preferences for

#### Returns

`void`

#### Example

```typescript
// Clear preferences when user removes a wallet
prefService.clearWalletPreference('metamask');
```

***

### configure()

> **configure**(`config?`): `void`

Configure the service with custom settings

Sets up the preference service with custom configuration options. This method
automatically loads existing preferences from storage if persistence is enabled.

#### Parameters

##### config?

[`WalletPreferenceConfig`](../interfaces/WalletPreferenceConfig.md)

Optional configuration object

#### Returns

`void`

#### Example

```typescript
prefService.configure({
  maxHistoryEntries: 10,
  enablePersistence: true,
  storageKeyPrefix: 'myapp-wallets',
  enableAutoConnect: true
});
```

***

### exportPreferences()

> **exportPreferences**(): [`WalletPreferences`](../interfaces/WalletPreferences.md)

Export preferences for backup/migration

Returns a copy of all current preferences suitable for backup or migration.
The returned object can be serialized to JSON for storage.

#### Returns

[`WalletPreferences`](../interfaces/WalletPreferences.md)

Complete preferences object

#### Example

```typescript
// Create backup of preferences
const preferences = prefService.exportPreferences();
const backup = {
  version: '1.0',
  timestamp: Date.now(),
  preferences
};
localStorage.setItem('wallet-backup', JSON.stringify(backup));
```

***

### getAllPreferences()

> **getAllPreferences**(): [`WalletPreferences`](../interfaces/WalletPreferences.md)

Get all wallet preferences

Returns a copy of all stored wallet preferences. The returned object can be
safely modified without affecting the service's internal state.

#### Returns

[`WalletPreferences`](../interfaces/WalletPreferences.md)

Object containing all wallet preferences indexed by wallet ID

#### Example

```typescript
const allPrefs = prefService.getAllPreferences();
console.log('Total wallets with preferences:', Object.keys(allPrefs).length);

// Check which wallets have auto-connect enabled
Object.entries(allPrefs).forEach(([walletId, pref]) => {
  if (pref.autoConnect) {
    console.log(`${walletId} has auto-connect enabled`);
  }
});
```

***

### getMostUsedWallet()

> **getMostUsedWallet**(): `null` \| `string`

Get most frequently used wallet

Returns the wallet ID with the highest usage count. Useful for suggesting
a default wallet based on user behavior.

#### Returns

`null` \| `string`

The most frequently used wallet ID, or null if no history exists

#### Example

```typescript
const mostUsed = prefService.getMostUsedWallet();
if (mostUsed) {
  console.log(`Your most used wallet is ${mostUsed}`);
  // Suggest this wallet as default
}
```

***

### getPreferredWallet()

> **getPreferredWallet**(): `null` \| `string`

Get the preferred wallet for auto-connect

Returns the ID of the wallet that has auto-connect enabled. Only one wallet
can be preferred at a time. Returns null if no wallet has auto-connect enabled
or if auto-connect is disabled globally.

#### Returns

`null` \| `string`

The wallet ID with auto-connect enabled, or null if none

#### Example

```typescript
const preferredWallet = prefService.getPreferredWallet();
if (preferredWallet) {
  console.log(`Auto-connecting to ${preferredWallet}`);
  await wallet.connect(preferredWallet);
}
```

***

### getRecentWalletIds()

> **getRecentWalletIds**(`limit?`): `string`[]

Get recent wallet IDs in order

Returns an array of wallet IDs ordered by most recently used. Useful for
displaying a "recent wallets" list in the UI.

#### Parameters

##### limit?

`number`

Maximum number of wallet IDs to return (defaults to maxHistoryEntries)

#### Returns

`string`[]

Array of wallet IDs ordered by most recent usage

#### Example

```typescript
// Get 3 most recent wallets for quick access menu
const recentWallets = prefService.getRecentWalletIds(3);
console.log('Recent wallets:', recentWallets);
// Output: ['metamask', 'walletconnect', 'coinbase']
```

***

### getStorageStats()

> **getStorageStats**(): `object`

Get storage statistics

Returns statistics about stored preferences and history. Useful for debugging
and displaying storage usage information to users.

#### Returns

`object`

Object containing storage statistics

##### autoConnectWallets

> **autoConnectWallets**: `string`[]

##### historyCount

> **historyCount**: `number`

##### preferencesCount

> **preferencesCount**: `number`

##### totalUsage

> **totalUsage**: `number`

#### Example

```typescript
const stats = prefService.getStorageStats();
console.log(`Preferences stored for ${stats.preferencesCount} wallets`);
console.log(`History contains ${stats.historyCount} wallets`);
console.log(`Auto-connect enabled for: ${stats.autoConnectWallets.join(', ')}`);
console.log(`Total wallet connections: ${stats.totalUsage}`);
```

***

### getWalletHistory()

> **getWalletHistory**(): [`WalletHistoryEntry`](../interfaces/WalletHistoryEntry.md)[]

Get wallet selection history

Returns the complete wallet usage history, ordered by most recently used.
Each entry includes usage count and last used timestamp.

#### Returns

[`WalletHistoryEntry`](../interfaces/WalletHistoryEntry.md)[]

Array of wallet history entries

#### Example

```typescript
const history = prefService.getWalletHistory();
history.forEach(entry => {
  console.log(`${entry.walletId}: used ${entry.usageCount} times`);
  console.log(`Last used: ${new Date(entry.lastUsed).toLocaleString()}`);
});
```

***

### getWalletPreference()

> **getWalletPreference**(`walletId`): [`WalletPreference`](../interfaces/WalletPreference.md)

Get preference for a specific wallet

Returns the stored preferences for a specific wallet. Returns an empty object
if no preferences exist for the wallet.

#### Parameters

##### walletId

`string`

The ID of the wallet to get preferences for

#### Returns

[`WalletPreference`](../interfaces/WalletPreference.md)

Wallet preference object or empty object if none exists

#### Example

```typescript
const metamaskPrefs = prefService.getWalletPreference('metamask');
if (metamaskPrefs.autoConnect) {
  console.log('MetaMask is set to auto-connect');
}
```

***

### importPreferences()

> **importPreferences**(`preferences`): `void`

Import preferences from external source

Replaces all current preferences with the provided preferences object.
Useful for restoring preferences from a backup or migrating from another system.

#### Parameters

##### preferences

[`WalletPreferences`](../interfaces/WalletPreferences.md)

Complete preferences object to import

#### Returns

`void`

#### Example

```typescript
// Import preferences from backup
const backup = JSON.parse(backupData);
prefService.importPreferences(backup.preferences);
console.log('Preferences restored from backup');
```

***

### isAutoConnectEnabled()

> **isAutoConnectEnabled**(`walletId`): `boolean`

Check if auto-connect is enabled for a wallet

Returns whether auto-connect is enabled for a specific wallet. Returns false
if auto-connect is disabled globally or for the specific wallet.

#### Parameters

##### walletId

`string`

The ID of the wallet to check

#### Returns

`boolean`

True if auto-connect is enabled for the wallet

#### Example

```typescript
if (prefService.isAutoConnectEnabled('metamask')) {
  console.log('MetaMask will auto-connect on startup');
}
```

***

### removeFromHistory()

> **removeFromHistory**(`walletId`): `void`

Remove wallet from history

Removes a wallet from the usage history. This does not affect stored preferences,
only the history tracking.

#### Parameters

##### walletId

`string`

The ID of the wallet to remove from history

#### Returns

`void`

#### Example

```typescript
// Remove wallet from history when it's uninstalled
prefService.removeFromHistory('metamask');
```

***

### setAutoConnect()

> **setAutoConnect**(`walletId`, `enabled`): `void`

Set auto-connect preference for a wallet

Enables or disables auto-connect for a specific wallet. When enabled, the wallet
will be automatically connected on application startup. Only one wallet can have
auto-connect enabled at a time.

#### Parameters

##### walletId

`string`

The ID of the wallet to set auto-connect for

##### enabled

`boolean`

Whether to enable or disable auto-connect

#### Returns

`void`

#### Example

```typescript
// Enable auto-connect for MetaMask
prefService.setAutoConnect('metamask', true);

// Disable auto-connect
prefService.setAutoConnect('metamask', false);
```

***

### updateWalletPreference()

> **updateWalletPreference**(`walletId`, `preference`): `void`

Update wallet preference

Updates the preferences for a specific wallet. Merges the provided preferences
with existing ones. Creates a new preference entry if none exists.

#### Parameters

##### walletId

`string`

The ID of the wallet to update preferences for

##### preference

`Partial`\<[`WalletPreference`](../interfaces/WalletPreference.md)\>

Partial preference object to merge with existing preferences

#### Returns

`void`

#### Example

```typescript
// Update multiple preferences at once
prefService.updateWalletPreference('metamask', {
  autoConnect: true,
  lastConnected: Date.now(),
  customData: { theme: 'dark' }
});
```
