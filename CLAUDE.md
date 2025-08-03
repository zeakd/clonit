# Clonit - Claude Development Guide

## Project Overview

Clonit is a scaffolding toolkit that implements a **source function architecture** to separate template sources from scaffolding logic. This enables unified handling of different template sources (filesystem, git, npm, etc.).

## Recent Architecture Changes

### Source Function Pattern
We refactored from a string-based source to a function-based approach:

```typescript
// Before: Source was just a string path
create('./template', './target')

// After: Source is a function
create(fromFS('./template'), './target')
create(fromGit('https://github.com/org/template'), './target')
```

### Key Components

1. **Source Functions** (`fromFS`, `fromGit`)
   - Higher-order functions that return `(tempDir: string) => Promise<void>`
   - Handle copying/cloning templates to temporary directory
   - Support source-specific options

2. **ClonitContext**
   - Provides file transformation methods
   - Manages temporary directory lifecycle
   - Handles output to target directory

3. **Backward Compatibility**
   - `create()` still accepts string sources
   - Internally converts to `fromFS()` for compatibility

## Working with the Codebase

### Test-Driven Development
Always write tests first:

```bash
# 1. Write test
# 2. Run test (should fail)
cd packages/clonit && pnpm test

# 3. Implement feature
# 4. Run test (should pass)
```

### Common Tasks

#### Adding a New Source Type
1. Define types in `src/core/types.ts`
2. Create test file `src/core/from-<source>.test.ts`
3. Implement in `src/core/from-<source>.ts`
4. Export from `src/index.ts`

#### Fixing Lint/Type Errors
```bash
# Check ESLint errors
pnpm eslint .

# Fix TypeScript errors
cd packages/clonit && pnpm build
```

### Git Sparse Checkout
The `fromGit` implementation includes special handling for sparse checkouts:

```typescript
fromGit('https://github.com/vitejs/vite', {
  sparse: ['packages/create-vite/template-react-ts']
})
// This will:
// 1. Clone with sparse checkout
// 2. Move template-react-ts contents to root
// 3. Clean up directory structure
```

## Current Implementation Status

### Completed
- ✅ `fromFS` source function with ignore patterns
- ✅ `fromGit` source function with sparse checkout
- ✅ Backward compatibility for string sources
- ✅ Full test coverage
- ✅ Example CLI (`create-zeakd`) using both sources

### Known Issues
- Sparse checkout shows warning when directory not found (falls back to full clone)
- No npm source function yet

## Development Tips

### Running the Example CLI
```bash
# Link packages locally
pnpm install

# Run create-zeakd
pnpm create @zeakd my-app

# Or with specific template
pnpm create @zeakd my-app -t react-ts
```

### Testing Git Operations
Git tests use real operations, so they:
- Require git to be installed
- May be slower than other tests
- Need network access for remote repos

### File Operation Patterns
```javascript
// Always handle missing files gracefully
try {
  await ctx.rename('_gitignore', '.gitignore');
} catch {
  // File doesn't exist, ignore
}

// Update JSON safely
await ctx.updateJson('package.json', (json) => {
  json.name = projectName;
  return json;
});
```

## Quick Commands

```bash
# Install all dependencies
pnpm install

# Run all tests
pnpm -r test

# Build all packages
pnpm -r build

# Run specific package test
cd packages/clonit && pnpm test

# Link for local testing
cd packages/create-zeakd && npm link
```

## Architecture Decisions

1. **Why Source Functions?**
   - Decouples source from scaffolding logic
   - Enables testing of sources independently
   - Allows composition and configuration

2. **Why Temporary Directory?**
   - Safe transformation without affecting source
   - Atomic operations (all-or-nothing)
   - Easy cleanup on failure

3. **Why Backward Compatibility?**
   - Smooth migration for existing users
   - No breaking changes in public API
   - Progressive enhancement