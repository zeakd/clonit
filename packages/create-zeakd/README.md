# create-zeakd

> Example scaffolding CLI built with clonit

[![npm version](https://img.shields.io/npm/v/@zeakd/create.svg)](https://www.npmjs.com/package/@zeakd/create)

A real-world example of building a `create-*` CLI using clonit's template transformation approach.

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

### `pnpm-ts` - Local TypeScript Starter
- **Source**: Local filesystem template
- **Features**: TypeScript, PNPM, minimal setup
- **Perfect for**: Quick TypeScript projects

### `react-ts` - React + TypeScript (Vite)
- **Source**: Sparse checkout from Vite repository
- **Features**: React 18, TypeScript, Vite, HMR
- **Perfect for**: Modern React applications

## How It Works

This CLI demonstrates clonit's power:

```javascript
// Define templates with different sources
const templates = {
  'pnpm-ts': {
    name: 'PNPM + TypeScript',
    source: () => fromFS(path.join(__dirname, 'templates/pnpm-package-ts')),
    hint: 'Basic TypeScript project'
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
// pnpm-ts template handler
await ctx.rename('_gitignore', '.gitignore')
await ctx.rename('_env', '.env')
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName
}))

// react-ts template handler
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName,
  version: '0.1.0'
}))
```

## Key Features Demonstrated

### 🎯 Multiple Source Types
- Local templates with `fromFS()`
- Remote templates with `fromGit()` and sparse checkout

### 🔧 Real Project Templates
- Templates are actual working projects
- No template syntax or placeholders
- Full IDE support during template development

### ⚡ Optimized Git Operations
- Shallow clones (`depth: 1`)
- Sparse checkout for monorepo templates
- Only downloads what's needed

### 🎨 Clean CLI Design
- Uses `@clack/prompts` for beautiful UI
- `meow` for robust CLI parsing
- Clear help and usage information

## CLI Options

```bash
create-zeakd [project-name]

Options:
  --template, -t  Choose template (pnpm-ts, react-ts)
  --help, -h      Show help
  --version       Show version

Examples:
  $ create-zeakd my-app
  $ create-zeakd my-app --template react-ts
  $ create-zeakd my-app -t pnpm-ts
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
├── templates/
│   └── pnpm-package-ts/   # Local template
│       ├── src/
│       ├── _gitignore     # Renamed on scaffold
│       ├── _env           # Renamed on scaffold
│       └── package.json   # Transformed on scaffold
└── package.json
```

## Why This Example Matters

This CLI showcases how clonit enables:

1. **Maintainable Templates**: The `pnpm-package-ts` template is a real TypeScript project
2. **Flexible Sources**: Mix local and remote templates seamlessly
3. **No Build Step**: No template compilation or preprocessing
4. **Type Safety**: Full TypeScript support if desired
5. **Modern CLI UX**: Beautiful prompts and interactions

## Creating Your Own

Use this as a blueprint for your own `create-*` CLI:

1. Fork this example
2. Replace templates with your own
3. Customize transformations
4. Publish to npm
5. Users can run `npm create your-name`

## License

ISC