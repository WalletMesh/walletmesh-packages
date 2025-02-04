#!/usr/bin/env bash

TEMPLATE_DIR=template

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      TARGET="$2"
      shift 2
      ;;
    *)
      NAME="$1"
      shift
      ;;
  esac
done

# Validate inputs
if [ -z "$NAME" ]; then
  echo "Create a new package with configurable target directory"
  echo
  echo "Usage: ./$0 --target <target> <name>"
  echo "  --target: Target directory (core, aztec, etc.)"
  echo "  name: Package name (will be prefixed based on target)"
  exit 1
fi

if [ -z "$TARGET" ]; then
  TARGET="core"
fi

# Validate name
if echo "$NAME" | egrep -q "[^a-z0-9-]"; then
  echo "Invalid characters in name"
  exit 1
fi

# Set package name based on target
if [ "$TARGET" = "core" ]; then
  PACKAGE_NAME="@walletmesh/$NAME"
else
  PACKAGE_NAME="@walletmesh/$TARGET-$NAME"
fi

PACKAGE_DIR="$TARGET/$NAME"

# Create package
if [ -d "$PACKAGE_DIR" ]; then
  echo "Package $PACKAGE_DIR already exists"
  exit 1
fi

mkdir -p "$PACKAGE_DIR"
cp -r "$TEMPLATE_DIR"/* "$PACKAGE_DIR"/

# Update package.json
jq ".name = \"$PACKAGE_NAME\"" "$TEMPLATE_DIR/package.json" > "$PACKAGE_DIR/package.json"
