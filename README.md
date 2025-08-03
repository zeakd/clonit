# Clonit

A flexible and maintainable project scaffolding toolkit that unifies file system and git-based templates.

## Packages

- **clonit** - Core scaffolding library with source function architecture
- **@zeakd/create** - Example CLI tool using clonit for project generation

## Core Concept

Clonit introduces a **source function** architecture that separates the source of templates from the scaffolding logic:

```js
// Traditional approach - source is tightly coupled
create('./templates/my-app', './new-app')

// Clonit approach - source is a function
create(fromFS('./templates/my-app'), './new-app')
create(fromGit('https://github.com/org/template'), './new-app')
```

This separation enables:
- **Unified API** for different template sources (filesystem, git, npm, etc.)
- **Composable sources** with configurable options
- **Testable** source implementations
- **Extensible** architecture for custom sources

## Quick Start

```bash
# Install clonit
npm install clonit

# Or use the example CLI
pnpm create @zeakd my-app
```

## Development

This is a monorepo managed with pnpm workspaces:

```bash
# Install dependencies
pnpm install

# Run tests
pnpm -r test

# Build packages
pnpm -r build
```

