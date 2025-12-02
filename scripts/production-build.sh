#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

printf "\n== UberFix production setup ==\n\n"

# Remove local node_modules to ensure a clean install without touching the lockfile
if [ -d "node_modules" ]; then
  echo "🧹 Removing existing node_modules..."
  rm -rf node_modules
fi

# Clear pnpm store to prevent stale artifacts
if command -v pnpm >/dev/null 2>&1; then
  PNPM_STORE="$(pnpm store path)"
  if [ -d "$PNPM_STORE" ]; then
    echo "🧼 Clearing pnpm store at $PNPM_STORE..."
    rm -rf "$PNPM_STORE"
  fi
else
  echo "❌ pnpm is not installed or not in PATH. Please install pnpm >= 10.0.0." >&2
  exit 1
fi

echo "📦 Installing dependencies with the existing lockfile..."
pnpm install --frozen-lockfile

echo "🏗️ Building production bundle..."
pnpm build

echo "✅ Production build completed successfully. Artifacts are in dist/"
