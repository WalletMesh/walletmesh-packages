# c-kzg Rebuild Optimization

## Overview

The c-kzg module requires native compilation with node-gyp.

## How It Works

1. When you run `pnpm install`, the `.pnpmfile.cjs` is loaded
2. If c-kzg is being installed, pnpm adds a postinstall script to it
3. The postinstall script runs `scripts/rebuild-c-kzg.cjs`
4. The rebuild script checks if rebuilding is necessary
5. If build artifacts exist, it skips the rebuild

## Implementation

### 1. `.pnpmfile.cjs`

- Hooks into pnpm's lifecycle events
- Detects when c-kzg is being installed
- Adds a postinstall script specifically to the c-kzg package

### 2. `scripts/rebuild-c-kzg.cjs`

- Checks if c-kzg exists in node_modules
- Verifies if build artifacts already exist
- Only rebuilds when necessary
- Handles errors gracefully

### 3. Manual Rebuild

If you need to force a rebuild of c-kzg:
```bash
pnpm rebuild:c-kzg
```
