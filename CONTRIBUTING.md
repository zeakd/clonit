# Contributing to Clonit

This guide is optimized for AI assistants to understand the codebase structure and development workflow.

## Project Structure

```
clonit/
├── packages/
│   ├── clonit/                 # Core library
│   │   ├── src/
│   │   │   ├── core/          # Core functionality
│   │   │   │   ├── create-clonit.ts    # Main create function
│   │   │   │   ├── clonit-context.ts   # Context for file operations
│   │   │   │   ├── from-fs.ts          # File system source function
│   │   │   │   ├── from-git.ts         # Git repository source function
│   │   │   │   └── types.ts            # TypeScript type definitions
│   │   │   ├── utils/         # Utility functions
│   │   │   │   ├── fs.ts              # File system utilities
│   │   │   │   └── temp.ts            # Temporary directory utilities
│   │   │   └── index.ts       # Public API exports
│   │   └── tests/             # Test files mirroring src structure
│   └── create-zeakd/          # Example CLI implementation
│       ├── create.js          # CLI entry point
│       └── templates/         # Local template files
├── .changeset/                # Changeset configuration
├── eslint.config.js          # ESLint configuration
└── pnpm-workspace.yaml       # PNPM workspace configuration
```

## Key Concepts

### Source Functions
A source function is a higher-order function that returns an async function accepting a temporary directory path:

```typescript
type SourceFunction = (tempDir: string) => Promise<void>;

// Example source function factory
function fromFS(source: string, options?: FromFSOptions): SourceFunction {
  return async (tempDir: string) => {
    // Copy files from source to tempDir
  };
}
```

### ClonitContext
The context object provides methods to transform files before outputting to the target directory:

- `rename(from, to)` - Rename files or directories
- `update(file, fn)` - Transform text file contents
- `updateJson(file, fn)` - Transform JSON file contents
- `read(file)` - Read file contents
- `out()` - Output transformed files to target directory

### Test-Driven Development
All features should have corresponding tests:

```typescript
// Test structure mirrors source structure
src/core/from-fs.ts → src/core/from-fs.test.ts
```

## Development Workflow

### 1. Setup
```bash
# Clone repository
git clone <repo-url>
cd clonit

# Install dependencies
pnpm install

# Build packages
pnpm -r build
```

### 2. Making Changes

#### Adding a New Source Function
1. Create type definitions in `src/core/types.ts`
2. Write tests first in `src/core/from-<source>.test.ts`
3. Implement the source function in `src/core/from-<source>.ts`
4. Export from `src/index.ts`
5. Update documentation

#### Modifying Core Behavior
1. Understand existing tests in relevant `.test.ts` files
2. Add/modify tests for new behavior
3. Update implementation
4. Ensure backward compatibility

### 3. Testing
```bash
# Run all tests
pnpm -r test

# Run tests for specific package
cd packages/clonit && pnpm test

# Run tests in watch mode
cd packages/clonit && pnpm vitest
```

### 4. Code Quality
```bash
# Run ESLint
pnpm eslint .

# Build TypeScript
cd packages/clonit && pnpm build
```

### 5. Git Sparse Checkout Implementation
The `fromGit` function supports sparse checkout with automatic directory restructuring:

```typescript
// When using sparse checkout, the function:
// 1. Clones with --filter=blob:none --sparse
// 2. Sets sparse-checkout patterns
// 3. Moves sparse directory contents to root
// 4. Cleans up the directory structure
```

## Common Patterns

### Error Handling
- Use try-catch for file operations that might fail
- Provide meaningful error messages
- Allow graceful fallbacks (e.g., sparse checkout fallback to full clone)

### Backward Compatibility
The `create` function maintains backward compatibility:
```typescript
// Old API still works
create('./template', './target')

// New API with source functions
create(fromFS('./template'), './target')
```

### File Transformations
Common transformations in CLI tools:
```javascript
// Rename dotfiles
await ctx.rename('_gitignore', '.gitignore');

// Update package.json
await ctx.updateJson('package.json', (json) => {
  json.name = projectName;
  return json;
});
```

## Dependencies

### Core Dependencies
- `execa` - Process execution for git operations
- `tinyglobby` - Glob pattern matching
- `ignore` - Gitignore-style ignore patterns

### Dev Dependencies
- `vitest` - Test runner
- `typescript` - Type checking
- `@types/node` - Node.js type definitions

## Release Process

This project uses changesets for version management:

```bash
# Create a changeset
pnpm changeset

# Version packages
pnpm changeset version

# Publish packages
pnpm changeset publish
```

## Debugging Tips

### Test Failures
- Check temporary directory creation/cleanup
- Verify file permissions
- Look for async/await issues
- Check path resolution (absolute vs relative)

### Git Operations
- Ensure git is available in PATH
- Check network connectivity for remote repos
- Verify branch/tag names exist
- Test with different git versions

### File System Operations
- Use `path.join()` for cross-platform paths
- Handle both files and directories in operations
- Consider symlinks and special files
- Test on different operating systems