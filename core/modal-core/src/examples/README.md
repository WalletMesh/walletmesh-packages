# Framework Examples

This directory contains example implementations demonstrating how to use the migrated modal-core icon utilities across different frameworks. These examples showcase the framework-agnostic nature of the utilities that were migrated from modal-react to modal-core.

## Overview

The migration successfully moved reusable, framework-agnostic utilities from `@walletmesh/modal-react` to `@walletmesh/modal-core`, enabling consistent icon handling across all supported frameworks. The examples in this directory demonstrate how these utilities can be used in various environments.

## Migrated Utilities

The following utilities were migrated from modal-react to modal-core:

### Core Utilities
- **`iconFallback.ts`** - Universal fallback system with framework-agnostic configuration
- **`iconContainer.ts`** - Container configuration utilities for consistent styling/attributes
- **`iconErrorRecovery.ts`** - Unified error recovery pipeline with multiple strategies
- **`iconHelpers.ts`** - Additional shared utilities for icon handling

### Key Features
- Framework-agnostic design patterns
- Consistent error handling across all implementations
- Unified fallback and recovery strategies
- Accessibility attribute management
- Performance optimization utilities

## Example Files

### 1. Vue 3 Component (`vue-icon-wrapper.vue`)

**Purpose**: Demonstrates Vue 3 Composition API integration with modal-core utilities.

**Key Features**:
- Reactive state management with Vue 3 refs and computed properties
- Lifecycle management with `onMounted` and `onDestroy`
- Event emission for click and CSP error events
- Uses all migrated utilities for consistency with React implementation

**Usage**:
```vue
<template>
  <VueIconWrapper 
    :src="iconDataUri"
    :size="32"
    :alt="walletName"
    @click="handleWalletClick"
    @csp-error="handleCspError"
  />
</template>
```

### 2. Svelte Component (`svelte-icon-wrapper.svelte`)

**Purpose**: Shows Svelte integration with reactive statements and lifecycle hooks.

**Key Features**:
- Svelte reactive statements (`$:`) for computed properties
- Event dispatching with `createEventDispatcher`
- Automatic reactivity to prop changes
- Clean component lifecycle management

**Usage**:
```svelte
<SvelteIconWrapper 
  src={iconDataUri}
  size={32}
  alt={walletName}
  on:click={handleWalletClick}
  on:csp-error={handleCspError}
/>
```

### 3. Vanilla JavaScript (`vanilla-icon-wrapper.js`)

**Purpose**: Demonstrates framework-free usage with plain JavaScript and DOM APIs.

**Key Features**:
- Direct DOM manipulation using modal-core utilities
- Event listener management
- Dynamic icon updates with `updateIcon()` method
- Proper cleanup with `destroy()` method
- Both generic and wallet-specific icon creation

**Usage**:
```javascript
import { createVanillaIconWrapper } from './vanilla-icon-wrapper.js';

const iconElement = createVanillaIconWrapper({
  src: iconDataUri,
  size: 32,
  alt: 'Wallet icon',
  onClick: () => console.log('Clicked!')
});

document.body.appendChild(iconElement);
```

## Common Patterns Across All Examples

### 1. Utility Usage
All examples use the same migrated utilities:
```javascript
import {
  createSandboxedIcon,
  createIconContainerConfig,
  createIconAccessibilityAttributes,
  normalizeIconOptions,
  createIconErrorRecovery,
  applyFallbackToElement,
  RECOVERY_PRESETS
} from '@walletmesh/modal-core';
```

### 2. Error Recovery
All implementations use the unified error recovery pipeline:
```javascript
const errorRecovery = createIconErrorRecovery(RECOVERY_PRESETS.conservative);

// In error handling
const recoveryResult = await errorRecovery.recover(error, originalOptions);
if (recoveryResult.success) {
  // Handle successful recovery
}
```

### 3. Container Configuration
All examples generate consistent container configuration:
```javascript
const containerConfig = createIconContainerConfig({
  size,
  disabled,
  clickable: !!onClick,
  loading: isLoading,
  className
});
```

### 4. Accessibility
All implementations use the same accessibility utilities:
```javascript
const a11yAttributes = createIconAccessibilityAttributes({
  alt,
  disabled,
  clickable: !!onClick,
  loading: isLoading
});
```

## Benefits of the Migration

### 1. Code Reusability
- **Before**: Duplicate implementations in React and DOM strategy
- **After**: Single implementation used across all frameworks

### 2. Consistency
- **Before**: Different error handling patterns across implementations
- **After**: Unified error recovery pipeline with consistent behavior

### 3. Maintainability
- **Before**: Changes required updates in multiple places
- **After**: Single source of truth for icon handling logic

### 4. Framework Support
- **Before**: React-specific implementation
- **After**: Framework-agnostic utilities usable in any environment

## Implementation Guidelines

### For New Framework Integrations

When creating a new framework integration:

1. **Import utilities** from `@walletmesh/modal-core`
2. **Use error recovery** with appropriate preset (conservative, aggressive, silent, development)
3. **Apply container config** for consistent styling and attributes
4. **Handle accessibility** using the provided utilities
5. **Manage lifecycle** according to framework patterns
6. **Normalize options** using the provided utility

### Error Recovery Presets

Choose the appropriate preset based on your use case:
- **`conservative`**: Only try fallback icon, then text fallback (recommended for production)
- **`aggressive`**: Try everything including retries (good for development)
- **`silent`**: No logging, graceful degradation (for performance-critical scenarios)
- **`development`**: Verbose logging, fail fast (for debugging)

### Testing Considerations

When testing framework integrations:
1. Test error recovery scenarios
2. Verify accessibility attributes are applied
3. Test loading and error states
4. Verify cleanup on component unmount
5. Test CSP blocking scenarios

## Migration Impact

### React Component Simplification

The React `SandboxedIcon` component was simplified from ~240 lines to ~120 lines by:
- Removing duplicate fallback creation logic
- Using unified error recovery pipeline
- Leveraging shared container configuration
- Applying common accessibility utilities

### DOM Strategy Consistency

The DOM render strategy now uses the same utilities as React:
- Consistent error handling across implementations
- Shared fallback creation and application
- Unified recovery strategies

### Performance Benefits

- Reduced bundle size through code deduplication
- Faster development through shared utilities
- Consistent behavior across all frameworks
- Better error handling and recovery

## Future Framework Support

These examples serve as templates for adding support for additional frameworks:
- Angular
- Lit
- Solid.js
- Vanilla Web Components
- Any other framework or library

The framework-agnostic design of the migrated utilities ensures that new integrations can be created quickly and consistently.

## Testing

To test these examples:
1. Set up a test environment for each framework
2. Import the utilities from `@walletmesh/modal-core`
3. Create test icons with various scenarios (valid, invalid, CSP-blocked)
4. Verify error recovery and fallback behavior
5. Test accessibility features

## Conclusion

The migration from modal-react to modal-core has successfully:
- ✅ Enabled framework-agnostic icon utilities
- ✅ Reduced code duplication across implementations
- ✅ Improved consistency and maintainability
- ✅ Provided a foundation for supporting additional frameworks
- ✅ Simplified existing implementations while maintaining functionality

These examples demonstrate that the migrated utilities work seamlessly across different frameworks while maintaining consistent behavior and error handling.