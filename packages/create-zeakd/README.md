# create-zeakd

> Example scaffolding CLI built with clonit

[![npm version](https://img.shields.io/npm/v/@zeakd/create.svg)](https://www.npmjs.com/package/@zeakd/create)

A real-world example of building a `create-*` CLI using clonit's template transformation approach, powered by templates from [github.com/zeakd/templates](https://github.com/zeakd/templates).

## Installation & Usage

```bash
# Use directly with npx/pnpm/yarn
npx create-zeakd my-app
pnpm create @zeakd my-app
yarn create @zeakd my-app

# Or install globally
npm install -g @zeakd/create
create-zeakd my-app
```

## Interactive Mode

Run without arguments for an interactive experience:

```bash
npx create-zeakd
```

You'll be guided through:
1. Project name selection
2. Template choice with descriptions

## Available Templates

All templates (except React) are sourced from [github.com/zeakd/templates](https://github.com/zeakd/templates):

### `ts-package` - TypeScript Package
- **Source**: Git sparse checkout from zeakd/templates
- **Features**: Pure ESM, TypeScript 5.8, Vitest, ESLint 9.32
- **Perfect for**: NPM packages and libraries

### `python-app` - Python Application
- **Source**: Git sparse checkout from zeakd/templates
- **Features**: Python 3.12+, uv package manager, Ruff, pytest
- **Perfect for**: Modern Python applications

### `pnpm-monorepo` - PNPM Monorepo
- **Source**: Git sparse checkout from zeakd/templates
- **Features**: PNPM workspaces, Changesets, TypeScript
- **Perfect for**: Multi-package projects

### `react-ts` - React + TypeScript (Vite)
- **Source**: Sparse checkout from Vite repository
- **Features**: React 18, TypeScript, Vite, HMR
- **Perfect for**: Modern React applications

## How It Works

This CLI demonstrates clonit's power:

```javascript
// Define templates with different sources
const templates = {
  'ts-package': {
    name: 'TypeScript Package',
    source: () => fromGit('https://github.com/zeakd/templates', {
      sparse: ['ts-package']
    }),
    hint: 'Pure ESM TypeScript package with Vitest'
  },
  'react-ts': {
    name: 'React + TypeScript (Vite)',
    source: () => fromGit('https://github.com/vitejs/vite', {
      sparse: ['packages/create-vite/template-react-ts']
    }),
    hint: 'Vite-based React + TypeScript'
  }
}
```

### Template Transformations

Each template has specific transformations:

```javascript
// TypeScript package handler
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName
}))

// Python app handler
await ctx.update('pyproject.toml', content => 
  content.replace(/name = "python-app"/, `name = "${projectName}"`)
)

// React template handler
await ctx.rename('_gitignore', '.gitignore')
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName,
  version: '0.1.0'
}))
```

## Key Features Demonstrated

### 🎯 Git Sparse Checkout
- Only downloads specific template directories
- Efficient for templates in larger repos
- Works with monorepos and template collections

### 🔧 Real Project Templates
- Templates are actual working projects
- No template syntax or placeholders
- Full IDE support during template development

### ⚡ Smart Transformations
- Language-aware updates (JSON, TOML)
- Safe file renaming with error handling
- Project name propagation

### 🎨 Clean CLI Design
- Uses `@clack/prompts` for beautiful UI
- `meow` for robust CLI parsing
- Clear help and usage information

## CLI Options

```bash
create-zeakd [project-name]

Options:
  --template, -t  Choose template (ts-package, python-app, pnpm-monorepo, react-ts)
  --help, -h      Show help
  --version       Show version

Examples:
  $ create-zeakd my-app
  $ create-zeakd my-app --template ts-package
  $ create-zeakd my-python-app -t python-app
```

## Development

```bash
# Clone the monorepo
git clone https://github.com/zeakd/clonit
cd clonit

# Install dependencies
pnpm install

# Test the CLI locally
cd packages/create-zeakd
node create.js my-test-app

# Or link for global testing
npm link
create-zeakd my-test-app
```

## Template Structure

```
create-zeakd/
├── create.js              # Main CLI entry point
├── package.json
└── README.md
```

All templates are fetched from remote repositories using git sparse checkout, no local template storage needed!

## Why This Example Matters

This CLI showcases how clonit enables:

1. **No Template Maintenance**: Templates live in their own repos
2. **Always Up-to-Date**: Fetches latest templates on each use
3. **Flexible Sources**: Mix templates from different repositories
4. **Efficient Downloads**: Sparse checkout only gets what's needed
5. **Modern CLI UX**: Beautiful prompts and interactions

## Creating Your Own

Use this as a blueprint for your own `create-*` CLI:

1. Fork this example
2. Update template definitions to point to your repos
3. Customize transformations for your needs
4. Publish to npm
5. Users can run `npm create your-name`

## Template Philosophy

The templates from [github.com/zeakd/templates](https://github.com/zeakd/templates) follow these principles:

- **Modern**: Latest stable versions of tools and frameworks
- **Minimal**: Just enough configuration to be productive
- **Fast**: Optimized for developer experience
- **Type-safe**: TypeScript and Python type hints by default
- **Production-ready**: Includes linting, formatting, and testing setup

## License

ISC