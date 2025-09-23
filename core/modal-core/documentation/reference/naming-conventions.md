# WalletMesh Naming Conventions 2024

This document defines the comprehensive naming conventions for the WalletMesh project. These conventions are designed to create a consistent, maintainable, and intuitive codebase.

## Core Principles

1. **Clarity Over Brevity**: Use descriptive names that clearly convey purpose
2. **Consistency**: Follow established patterns throughout the codebase
3. **Modularity**: Keep related files together
4. **Simplicity**: Minimize directory nesting and complex file organization

## Directory Structure

### Directory Naming
- Use kebab-case for all directories (lowercase with hyphens)
- Be descriptive and clear about the directory's purpose
- Single-word directories remain lowercase without hyphens

```
src/
  adapters/         # ✓ Correct - single word lowercase
  connectors/       # ✓ Correct - single word lowercase
  transports/       # ✓ Correct - single word lowercase
  utils/            # ✓ Correct - single word lowercase
  chrome-extension/ # ✓ Correct - multi-word uses kebab-case
  popup-window/     # ✓ Correct - multi-word uses kebab-case
  
  # Incorrect examples:
  # Utils/          ✗ Wrong - starts with uppercase
  # dataModels/     ✗ Wrong - uses camelCase for multi-word
  # API_CLIENT/     ✗ Wrong - uses snake_case and uppercase
```

### Directory Organization
```
src/
  adapters/              # Public API directory (single word)
    BaseAdapter.ts      # Public interface/implementation (PascalCase)
    index.ts           # Re-exports
    types.ts          # Public types
  internal/             # Internal implementations
    adapters/          # Internal directory matching public structure
      BaseAdapter.ts   # Actual implementation
      types.ts        # Internal types
  implementations/      # Specific implementations
    SpecificAdapter.ts
  chrome-extension/     # Multi-word directory (kebab-case)
    index.ts
    types.ts
```

### API Organization

1. **Public vs Internal APIs**
- Public APIs are exposed in top-level directories
- Implementation details live in `internal/` directory
- Use re-export pattern for public APIs:
```typescript
// adapters/BaseAdapter.ts
export { BaseAdapter } from '../internal/adapters/BaseAdapter.js';

// internal/adapters/BaseAdapter.ts
export class BaseAdapter {
  // Actual implementation
}
```

2. **Type Co-location**
- Co-locate types with their primary implementation when closely related
- Use separate type files for shared types or complex type definitions
```typescript
// modal/types.ts - Co-located with modal implementation
export interface ModalController {
  open(): Promise<void>;
}
export type ModalConfig = {
  theme: string;
};

// types/shared.ts - Shared type definitions
export type ChainType = string;
export type NetworkId = number;
```

## File Naming Conventions

### Implementation Files

1. **Class Files**: Use PascalCase matching the exported class name
   - Files that export a single class should be named after that class
   - The filename must exactly match the exported class name
   ```
   // File: ModalController.ts
   export class ModalController { }
   
   // File: PopupWindowTransport.ts  
   export class PopupWindowTransport { }
   
   // File: AbstractTransport.ts
   export abstract class AbstractTransport { }
   
   // NOT: popupWindow.ts exporting PopupWindowTransport
   // NOT: abstractTransport.ts exporting AbstractTransport (abstract classes also use PascalCase)
   ```

2. **Mixed Export Files**: Use camelCase when exporting multiple items
   - Files that export classes along with interfaces, types, or functions
   - Files that export multiple classes
   ```
   modalController.ts    # Exports class + interfaces
   errorFactory.ts      # Exports class + factory functions
   ```

3. **Utility/Function Files**: Use camelCase
   ```
   utils.ts
   helpers.ts
   constants.ts
   types.ts         # Type definition collections
   interfaces.ts    # Interface collections
   ```

4. **Index Files**: Always use `index.ts`

### Test Files

Test files follow a consistent pattern with the implementation file's casing:

```
ComponentName.{type}.test.ts

Types:
- Basic tests:        Component.test.ts
- Core tests:         Component.core.test.ts
- Edge cases:         Component.edge.test.ts
- Consolidated:       Component.consolidated.test.ts
- Type tests:         Component.types.test.ts
```

#### Test Consolidation Guidelines

To maintain a clean and manageable test suite, follow these consolidation patterns established in the Modal Core package:

**When to Consolidate**:
- Multiple test files exist for the same component (e.g., `.test.ts`, `.coverage.test.ts`, `.edge.test.ts`)
- Tests are scattered across different files without clear organization
- Duplicate test setup or similar test patterns exist
- Coverage gaps between different test files

**Consolidation Pattern**:
1. **Primary Test File**: Keep or create a single `.test.ts` file containing all tests
2. **Section Markers**: Use clear section markers to organize consolidated content
3. **Preserve Functionality**: Maintain all existing test coverage and functionality
4. **Remove Duplicates**: Delete separate test files after successful consolidation

**File Structure for Consolidated Tests**:
```typescript
/**
 * ComponentName Tests
 *
 * Consolidated tests for ComponentName functionality
 * Merged from componentName.test.ts and componentName.coverage.test.ts
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Original core functionality tests
describe('ComponentName', () => {
  describe('Core Functionality', () => {
    // Original basic tests
  });

  // ==================================================================================
  // CONSOLIDATED COVERAGE TESTS
  // Originally from componentName.coverage.test.ts
  // Targeting specific uncovered lines and edge cases
  // ==================================================================================

  describe('Edge Cases and Coverage', () => {
    // Additional coverage tests
  });

  describe('Error Handling', () => {
    // Error condition tests
  });

  describe('Performance and Optimization', () => {
    // Performance-related tests
  });
});
```

**Consolidation Process**:
1. **Analysis**: Review all test files for the component to understand coverage
2. **Planning**: Identify which tests to keep, merge, or remove
3. **Implementation**: 
   - Update the primary test file header to indicate consolidation
   - Add clear section markers for consolidated content
   - Merge test suites with appropriate describe blocks
   - Ensure all test functionality is preserved
4. **Cleanup**: Remove the separate test files after successful consolidation
5. **Verification**: Run tests to ensure all functionality works correctly

**Examples of Successful Consolidations**:

- **PopupWindow Transport Tests**: Merged `popupWindow.final.test.ts` coverage tests into `popupWindow.test.ts`
  - Added 42 additional tests covering specific uncovered lines
  - Clear section markers indicating consolidated content
  - Comprehensive coverage of edge cases and error conditions

- **BaseConnector Component Tests**: Merged `baseConnector.coverage.test.ts` into `baseConnector.test.ts`
  - Added 18 coverage tests for default implementations and edge cases
  - Organized into logical describe blocks for different test areas
  - Maintained all original functionality while improving organization

**Benefits of Consolidation**:
- **Single Source of Truth**: All tests for a component in one place
- **Easier Maintenance**: Simpler to update tests when implementation changes
- **Better Organization**: Clear structure with logical groupings
- **Reduced Duplication**: Eliminates duplicate setup and similar test patterns
- **Improved Coverage**: Ensures comprehensive testing without gaps

**Anti-Patterns to Avoid**:
- ❌ Creating too many separate test files for one component
- ❌ Duplicating test setup across multiple files
- ❌ Having unclear test organization or purpose
- ❌ Losing test coverage during consolidation
- ❌ Having inconsistent naming between test files

**When NOT to Consolidate**:
- Tests serve fundamentally different purposes (unit vs integration)
- Tests require significantly different setup or dependencies
- Component is large enough to warrant logical separation
- Tests are performance-critical and need to run independently

### Mock Files

- Mock files must be co-located with their implementations
- Use camelCase for the component name followed by `.mock.ts`
- **Do NOT use `__mocks__` directories** - they make it harder to see which components have mocks
- Mock class names should start with `Mock` (e.g., `MockDomAdapter`)
- File should be named after the component being mocked, not the mock class

```
// Correct: Files in same directory
adapters/
  DomAdapter.ts          // Implementation
  domAdapter.mock.ts     // Mock (exports MockDomAdapter class)
  
// Incorrect: Using __mocks__ directory
adapters/
  DomAdapter.ts
  __mocks__/
    DomAdapter.ts        // ❌ Don't use __mocks__ directories
    
// Incorrect: Wrong naming
adapters/
  DomAdapter.ts
  mockDomAdapter.ts      // ❌ Should be domAdapter.mock.ts
```

**Benefits of co-location**:
1. **Discoverability**: Easy to see which components have mocks when viewing a directory
2. **Maintenance**: Mocks stay close to their implementations, reducing drift
3. **Clarity**: Clear relationship between implementation and mock
4. **Tooling**: Better IDE support for navigating between files

### Type Definition Files

- Use the same casing as the implementation file
- Add `.d.ts` suffix
```
Transport.d.ts
types.d.ts
```

## Code-Level Naming

### Type Definitions

| Element | Case Style | Examples |
|---------|------------|----------|
| Classes | PascalCase | `WalletConnector`, `ModalController` |
| Interfaces | PascalCase | `WalletInfo`, `ConnectionResult` |
| Type Aliases | PascalCase | `ChainType`, `ProviderInterface` |
| Enums | PascalCase | `ConnectionState`, `LogLevel` |

### Variables and Functions

| Element | Case Style | Examples |
|---------|------------|----------|
| Variables | camelCase | `accountAddress`, `providerInstance` |
| Functions | camelCase | `connect()`, `getAccounts()` |
| Methods | camelCase | `initialize()`, `detectWallet()` |
| Class Properties | camelCase | `supportedChains`, `currentProvider` |
| Private Properties | camelCase (use TypeScript's `private` keyword) | `initialized`, `state` |

### Constants

| Element | Case Style | Examples |
|---------|------------|----------|
| Primitive Constants | UPPER_SNAKE_CASE | `MAX_RETRIES = 3`, `API_KEY = 'abc123'` |
| Object Constants | camelCase | `defaultConfig = { timeout: 5000 }` |
| Frozen Enum-like Objects | PascalCase | `Status = Object.freeze({ ACTIVE: 1, INACTIVE: 0 })` |
| Configuration Objects | camelCase | `defaultTheme`, `apiSettings`, `validationRules` |
| Enum Values | PascalCase | `ConnectionState.Connected`, `LogLevel.Debug` |
| Magic Values | UPPER_SNAKE_CASE | `ERROR_CODES.UNAUTHORIZED` |

> **Note on Constants**: Use UPPER_SNAKE_CASE only for primitive values and magic numbers. Complex objects that happen to be const should use camelCase to distinguish between true constants and immutable data structures.

> **Enhanced Detection**: Our custom scripts use semantic analysis to distinguish true constants from configuration objects. Names ending with patterns like `config`, `options`, `settings`, `rules`, `messages`, `templates`, `colors`, `theme`, `styles`, or `schema` are recognized as configuration objects and can use camelCase even when they're primitive values.

### Classes
- Use PascalCase
- Be descriptive of the class's purpose
- No abbreviations unless widely understood
```typescript
class WalletConnector {}
class ModalController {}
class WebSocketTransport {}
```

### Interfaces
- Use PascalCase
- No 'I' prefix
- Descriptive of what they represent
```typescript
interface WalletInfo {}
interface ConnectionResult {}
interface TransportConfig {}
```

### Types
- Use PascalCase for type aliases
- Use lowercase for primitive types
```typescript
type ConnectionState = 'connected' | 'disconnected';
type Handler = (event: Event) => void;

// Primitive types
let name: string;
let count: number;
let isActive: boolean;
```

### Functions
- Use camelCase
- Start with verbs
- Be descriptive of the action
```typescript
function createConnector() {}
function handleConnection() {}
function validateInput() {}
```

### Variables
- Use camelCase (never PascalCase)
- Be descriptive of what they contain
- Use TypeScript's `private` keyword for private members (no underscore prefix)
```typescript
// Correct
const userAccount = {};
let connectionState = 'active';
const theme = getTheme();
private isInitialized = false;

// Incorrect
const UserAccount = {};  // ❌ PascalCase for variable
const Theme = getTheme(); // ❌ PascalCase for variable
```

### Constants
- Use UPPER_SNAKE_CASE for primitive constants and magic numbers
- Use camelCase for object constants and configuration objects
- The `const` keyword alone doesn't determine naming - consider the semantic meaning
```typescript
// Primitive constants - UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const API_VERSION = '1.0.0';

// Object constants - camelCase
const defaultTheme = { primary: '#000', secondary: '#fff' };
const errorMessages = { notFound: 'Resource not found' };

// Frozen objects - follow semantic meaning
const PERMISSIONS = Object.freeze({ READ: 1, WRITE: 2 }); // Acts like enum
const frozenConfig = Object.freeze({ timeout: 5000 }); // Configuration object
```

### Event Handlers and Events
- Use camelCase for handlers with 'handle' or 'on' prefix
- Use PascalCase with 'Event' suffix for event interfaces
- Use PascalCase with 'Type' suffix for event type enums
```typescript
// Event Handlers
function handleClick() {}
function onConnection() {}
const handleSubmit = () => {};

// Event Interfaces
interface AccountsChangedEvent {
  accounts: string[];
}
interface ChainChangedEvent {
  chainId: string;
}

// Event Types
enum ClientEventType {
  AccountsChanged = 'accountsChanged',
  ChainChanged = 'chainChanged'
}

// Event Emitters
emitConnectorEvent(event: ConnectorEvent): void;
emitClientEvent(event: ClientEvent): void;
```

> **Enhanced Detection**: Our custom scripts use semantic analysis beyond simple pattern matching to detect event handlers. They check:
> - Method parameters for Event-type objects
> - Method context (e.g., assigned to event properties)
> - Common event-related keywords in method names
> - Whether a method is actually handling events vs just having a name that starts with 'handle'

### Mappers and Transformers
- Use 'to' prefix for conversion functions between types
- Use 'from' prefix for reverse conversions
- Use descriptive names for the conversion direction
```typescript
// Type Conversion
toClient(event: ConnectorEvent): ClientEvent;
fromClient(event: ClientEvent): ConnectorEvent;

// Data Transformation
toJSON(data: unknown): string;
fromJSON(json: string): unknown;

// Format Conversion
toHex(number: number): string;
fromHex(hex: string): number;
```

## Component-Specific Patterns

### Connectors
```typescript
// File: ObsidianConnector.ts
export class ObsidianConnector implements WalletConnector {
  private connection: Connection;
  
  async connect(): Promise<void> {}
}
```

### Transports
```typescript
// File: WebSocketTransport.ts
export class WebSocketTransport extends AbstractTransport {
  private socket: WebSocket;
  
  async initialize(): Promise<void> {}
}
```

### Error Classes
```typescript
// File: ConnectionError.ts
export class ConnectionError extends Error {
  constructor(message: string) {
    super(`Connection failed: ${message}`);
  }
}
```

## Examples

### Good Examples
```typescript
// Class definition
class WalletConnector implements WalletInterface {
  private initialized = false;
  private connectionState = ConnectionState.Disconnected;

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  getProvider<T>(): T {
    return window.ethereum as T;
  }
}

// Constants and error codes
const DEFAULT_TIMEOUT = 30000;
const ERROR_CODES = {
  CONNECTION_FAILED: 'connection_failed',
  USER_REJECTED: 'user_rejected'
};

// React components and hooks
function WalletSelector({ wallets, onSelect }: Props) {
  const { isConnected } = useWalletState();
  
  const handleWalletClick = (wallet: Wallet) => {
    onSelect(wallet.id);
  };
  
  return <div />;
}

// Event handling
class EventProcessor {
  private eventQueue: Event[] = [];
  
  handleEvent(event: Event): void {
    this.eventQueue.push(event);
    this.processEvent(event);
  }
  
  onStateChange(): void {
    this.updateState();
  }
}
```

### Bad Examples
```typescript
// Bad: Inconsistent casing
class walletConnector {}  // Should be WalletConnector

// Bad: Abbreviated names
class Conn {}  // Should be Connection
interface Cfg {}  // Should be Config or Configuration

// Bad: Unclear purpose
function process() {}  // Should be processTransaction()
function handle() {}   // Should be handleSubmit()

// Bad: Inconsistent method naming
class DataProcessor {
  Process() {}      // Should be process()
  handle_data() {}  // Should be handleData()
  Get_state() {}    // Should be getState()
}

// Bad: Inconsistent private member naming
class Connection {
  private _initialized: boolean;     // Bad: Should not use underscore prefix
  private __state: string;          // Bad: Double underscore not needed
  private _connection: WebSocket;   // Bad: Should not use underscore prefix
}
```

## File Organization

Each file should follow this organization:

1. Imports
2. Types/Interfaces
3. Constants
4. Class/Function Implementations
5. Exports

```typescript
import { Something } from './something';

interface Config {}
type State = string;

const DEFAULT_VALUE = 'test';

export class Component {
  // Implementation
}

export { Config, State };
```

## Validation and Tooling

### ESLint Rules
```json
{
  "rules": {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "class",
        "format": ["PascalCase"]
      },
      {
        "selector": "interface",
        "format": ["PascalCase"]
      }
    ]
  }
}
```

### Scripts
```bash
# Check naming conventions
pnpm check:naming

# Check with verbose output
pnpm check:naming:verbose
```

## Migration Plan

1. New files must follow these conventions immediately
2. Existing files should be updated when they are modified
3. Bulk updates should be done in focused PRs
4. Test files should be consolidated during test updates

### Test Consolidation Implementation

The following test consolidations have been completed as part of the ongoing effort to improve test organization and maintainability:

**Completed Test Consolidations**:

1. **PopupWindow Transport Tests** (Phase 2.1):
   - **Files**: `popupWindow.test.ts` + `popupWindow.final.test.ts` → `popupWindow.test.ts`
   - **Result**: 43 total tests (consolidated from separate files)
   - **Coverage**: Added tests for lines 176-190, 200-201, 206-224, 228-246, 250-258, 268-295, 310-316, 370-373
   - **Organization**: Clear section markers, comprehensive edge case coverage
   - **Status**: ✅ Completed

2. **BaseConnector Component Tests** (Phase 2.2):
   - **Files**: `baseConnector.test.ts` + `baseConnector.coverage.test.ts` → `baseConnector.test.ts`
   - **Result**: 26 total tests (8 original + 18 coverage tests)
   - **Coverage**: Default implementations, protected methods, state edge cases, logger integration
   - **Organization**: Logical describe blocks for different test areas
   - **Status**: ✅ Completed

**Test Consolidation Benefits Achieved**:
- ✅ **Eliminated Duplicate Setup**: Removed redundant beforeEach blocks and test configurations
- ✅ **Improved Maintainability**: Single source of truth for each component's tests  
- ✅ **Better Organization**: Clear section markers and logical groupings
- ✅ **Enhanced Coverage**: Comprehensive testing without gaps or overlaps
- ✅ **Reduced File Count**: Fewer test files to maintain and navigate

**Future Test Consolidation Candidates**:
- Integration tests with multiple fragmented files
- Components with separate `.edge.test.ts` files that could be merged
- Tests with similar setup patterns that could be unified

**Test Consolidation Process** (for future work):
1. **Identify**: Find components with multiple test files
2. **Analyze**: Review test coverage and identify overlaps/gaps
3. **Consolidate**: Merge into primary `.test.ts` file with clear sections
4. **Verify**: Ensure all tests pass and coverage is maintained
5. **Document**: Update this section with completed consolidations

## References and Tools

### Style Guide References
- [TypeScript Coding Guidelines](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

### Automated Enforcement

We use a hybrid approach combining Biome linter and custom AST-based scripts to enforce naming conventions:

#### 1. **Biome Linter** (Real-time IDE Feedback)

Configured in `biome.json` at package level:
- **Variables, Functions, Classes**: Basic camelCase/PascalCase enforcement
- **File Names**: Allows camelCase, kebab-case, and PascalCase
- **Private Members**: Enforces camelCase (no underscore prefix)
- **Constants**: Allows both camelCase and CONSTANT_CASE
- **PascalCase Constants**: Special rule for frozen enum-like objects

**Limitations**:
- Cannot distinguish true constants from config objects
- Cannot detect event handlers semantically
- Cannot validate primitive type usage in type annotations
- Cannot enforce context-specific patterns

#### 2. **Custom AST Scripts** (Advanced Pattern Detection)

**Phase 1 Enhancements (Implemented)**:
- **Enhanced Event Handler Detection** (`codeNamingCheck.js`):
  - Semantic analysis beyond pattern matching
  - Checks method parameters for Event types
  - Validates method context (assigned to event properties)
  - Detects common event keywords (click, keydown, etc.)
  - Distinguishes real event handlers from methods that happen to start with 'handle'

- **Improved Constant Classification** (`codeNamingCheck.js`):
  - Pattern-based detection for configuration objects
  - Recognizes names ending with: config, options, settings, rules, messages, templates, colors, theme, styles, schema
  - Allows PascalCase for frozen enum-like objects (e.g., `Status = Object.freeze({...})`)
  - Distinguishes true constants (primitives) from configuration objects

- **Primitive Type Detection** (`primitiveTypeCheck.js`):
  - Detects `String`, `Number`, `Boolean` → `string`, `number`, `boolean`
  - Works only in type annotations (not runtime code)
  - Integrates with TypeScript AST for accurate detection

- **File Classification** (`fileNamingCheck.js`):
  - Detects mock implementations that should use `.mock.ts`
  - Validates file names match their primary export
  - Intelligent classification based on file content

- **Auto-fixing Capabilities** (`autoFix.js`):
  - Scope-aware renaming across entire files
  - Updates references in comments with `--include-comments`
  - Handles multiple fix types: private members, primitives, constants
  - Safe renaming that preserves functionality

#### 3. **Running Checks**

```bash
# Biome checks (fast, real-time)
pnpm lint                    # Run Biome linter
pnpm lint:fix               # Auto-fix Biome violations

# Custom naming checks (comprehensive)
pnpm check:naming           # Run all naming convention checks
pnpm check:naming:verbose   # Detailed output with examples
pnpm check:naming:json      # JSON output for CI/CD

# Check specific aspects
pnpm check:naming:files      # File/directory naming only
pnpm check:naming:primitives # Primitive type usage only
pnpm check:naming:code       # Advanced code patterns only

# Check single file
pnpm check:naming --file src/api/modal.ts
pnpm check:naming -f src/internal/adapters/domAdapter.ts

# Auto-fix violations
pnpm fix:naming              # Fix all violations
pnpm fix:naming:dry          # Preview fixes without applying
pnpm fix:naming:files        # Fix file naming violations
pnpm fix:naming:private      # Fix only private member violations
pnpm fix:naming:primitive    # Fix only primitive type violations
pnpm fix:naming --file src/api/modal.ts  # Fix single file
pnpm fix:naming --include-comments       # Also fix references in comments
```

#### 4. **VS Code Integration**

The project includes `.vscode/settings.json` for optimal integration:
- Biome provides real-time linting feedback
- Format on save enabled
- Custom tasks for running naming checks
- File associations for `.mock.ts` files

#### 5. **CI/CD Integration**

```yaml
# GitHub Actions example
- name: Lint with Biome
  run: pnpm lint
  
- name: Check naming conventions
  run: pnpm check:naming
```

#### 6. **File Renaming and Import Updates**

```bash
# Rename files safely using git mv to preserve history
git mv old-file-name.ts NewFileName.ts

# Update imports after manual rename
pnpm update:imports -- --old src/old-name.ts --new src/new-name.ts

# Or use the file renamer script for automatic updates
pnpm fix:naming:files
```

### Performance Considerations

- **Biome**: ~100ms for full codebase (incremental, cached)
- **Custom Scripts**: ~2-5s for full codebase (full AST parsing)
- Run Biome first for quick feedback, then custom scripts for comprehensive checking

### Troubleshooting Common Issues

1. **False Positives in Test Files**:
   - Test files have relaxed rules for test data
   - Constants like `validUser`, `mockData` are allowed in tests
   - Use descriptive names to avoid confusion

2. **Configuration Objects vs Constants**:
   - `defaultConfig` (camelCase) - configuration object
   - `DEFAULT_TIMEOUT` (UPPER_SNAKE_CASE) - true constant
   - Check the semantic meaning, not just the `const` keyword

3. **Event Handler Detection**:
   - Not all methods starting with 'handle' are event handlers
   - The script checks method context and parameters
   - Add proper Event type annotations for better detection

4. **Frozen Enums**:
   - `Status = Object.freeze({...})` can use PascalCase
   - Must have UPPER_CASE keys to be recognized as enum-like

## Historical Migration Context

The following migrations have been completed to establish these naming conventions:

### Completed Migrations

1. **Utility Files** (kebab-case to camelCase):
   - `client-extensions.ts` → `clientExtensions.ts`
   - `skip-browser-tests.ts` → `skipBrowserTests.ts`
   - `environment-utils.ts` → `environmentUtils.ts`
   - `test-utils.ts` → `testUtils.ts`
   - `error-extensions.d.ts` → `errorExtensions.d.ts`

2. **Class Files** (kebab-case to PascalCase):
   - `chrome-extension.test.ts` → `ChromeExtension.test.ts`
   - `popup-window.ts` → `PopupWindow.ts`
   - `base-framework-adapter.ts` → `BaseFrameworkAdapter.ts`

3. **Mock Files** (standardized naming):
   - `state-manager.mock.ts` → `stateManager.mock.ts`
   - `view-manager.mock.ts` → `viewManager.mock.ts`
   - `wallet-connector.mock.ts` → `walletConnector.mock.ts`
   - `connector-ctor.mock.ts` → `connectorCtor.mock.ts`

4. **Test Files** (consistent naming):
   - `deep-clone.test.ts` → `deepClone.test.ts`
   - `logger.complete-coverage.test.ts` → `loggerCompleteCoverage.test.ts`
   - `controller.test-types.ts` → `controllerTestTypes.ts`
   - `factory.test-types.ts` → `factoryTestTypes.ts`

5. **Special Cases**:
   - `controller-di.ts` → `controllerDi.ts`

6. **Type References**:
   - Over 760 primitive type references standardized across 237 files
   - `String` → `string`
   - `Number` → `number`
   - `Boolean` → `boolean`

7. **Method Names** (standardized to camelCase):
   - Factory methods use `create` prefix
   - Event handlers use camelCase (with optional `on` prefix)
   - General methods use verb-first camelCase naming

This historical context demonstrates the systematic approach taken to establish consistent naming throughout the codebase. The refactoring goals achieved were:

1. **Improved Consistency**: All files now follow the same naming patterns, making the codebase more predictable and easier to navigate.
2. **Standard TypeScript Conventions**: Adopted industry-standard TypeScript naming conventions (PascalCase for classes, camelCase for utilities).
3. **Better Code Navigation**: File names now clearly indicate their contents and purpose.
4. **Reduced Cognitive Load**: Developers no longer need to deal with multiple naming systems.
5. **Better IDE Support**: Consistent naming enables more effective autocomplete and file search.
6. **Self-Consistency**: Script files themselves have been renamed to follow camelCase (e.g., `naming-conventions.js` → `namingConventions.js`).

*Note: No functional changes were made during this refactoring; only file names and import paths were updated to enhance code organization and readability.*

All new code must follow these established patterns.

### Special Cases and Exceptions
Sometimes exceptions to these rules may be necessary:
1. Working with external APIs that use different conventions
2. Using libraries with established patterns
3. Implementing standard interfaces

When exceptions are needed, add a comment explaining why:
```typescript
// Using PascalCase to match external API convention
const APIClient = createClient();
```

## Related Documentation

This document contains the current, established naming conventions. Additional documents provide implementation details:

1. **BIOME_SCRIPT_COORDINATION.md** - Explains how Biome and custom scripts work together
2. **NAMING_CONVENTION_ANALYSIS.md** - Analysis of gaps and improvement opportunities
3. **Scripts Documentation**:
   - `scripts/naming/README.md` - Details on each custom script
   - `scripts/lib/astUtils.js` - Core AST analysis utilities

## Ongoing Maintenance

To maintain code quality and naming consistency as the codebase evolves:

1. **Run Checks Before Commits**:
   - The pre-commit hook runs automatically when committing
   - Verify naming conventions manually with `pnpm check:naming`

2. **Manual Fixes Required**:
   - Review identified issues and fix them manually
   - Use `git mv` for safe file renaming to preserve git history

3. **Code Reviews**:
   - Check for proper naming patterns during reviews
   - Verify that new code follows established conventions
   - Use the verification checklist provided in this document
   - Pay special attention to:
     - Event handler naming (should start with 'handle' or 'on')
     - Constant classification (true constants vs config objects)
     - Private member naming (no underscore prefixes)
     - File naming matching exports

# Help and Support

- Run naming convention checks before commits
- Use IDE support for automatic case conversion
- When in doubt, look at existing files in the same directory
- Raise questions in code reviews if conventions are unclear
- Use the `pnpm check:naming:verbose` command to verify patterns in your code