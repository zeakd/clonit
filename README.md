# clonit

> Scaffolding without template languages

[![npm version](https://img.shields.io/npm/v/clonit.svg)](https://www.npmjs.com/package/clonit)
[![npm downloads](https://img.shields.io/npm/dm/clonit.svg)](https://www.npmjs.com/package/clonit)

Maintain your scaffolding templates as real, working projects. No more `{{mustache}}` variables breaking your code.

## Monorepo Structure

This is a monorepo containing:
- **`packages/clonit`** - Core scaffolding library
- **`packages/create-zeakd`** - Example CLI implementation

## The Problem

Traditional scaffolding tools require you to maintain templates filled with placeholder syntax:

```json
// package.json.mustache
{
  "name": "{{projectName}}",
  "version": "{{version}}",
  {{#useTypeScript}}
  "devDependencies": {
    "typescript": "^5.0.0"
  }
  {{/useTypeScript}}
}
```

This approach creates cascading complexity:

### 🚫 Broken Developer Experience
- Your IDE can't validate the JSON
- Linters and formatters fail
- Syntax highlighting breaks
- No autocomplete or IntelliSense

### 🚫 Fragmented Template Structure
```
_templates/
  component/
    new/
      index.ejs.t         # Generator metadata
      component.ejs.t     # Template with EJS syntax
      test.ejs.t          # Another template file
      prompt.js           # Separate prompt logic
```
Multiple file types, each with different syntax and rules.

### 🚫 Template Logic Complexity
```ejs
---
to: src/components/<%= name %>/index.tsx
---
<%_ if (withStyles) { _%>
import styles from './<%= name %>.module.css'
<%_ } _%>

export const <%= Name %> = () => {
  return (
    <div<% if (withStyles) { %> className={styles.container}<% } %>>
      <%= name %>
    </div>
  )
}
```
Template tags scattered throughout your code, making it unreadable and unmaintainable.

### 🚫 Testing Impossibility
- Can't run or test templates directly
- No way to validate output before generation
- Debugging requires trial and error

## The Solution

Clonit takes a fundamentally different approach: **your templates are real, working projects**.

### ✅ Real Projects as Templates
```json
// package.json - not a template, a real file!
{
  "name": "my-template",
  "version": "1.0.0",
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```
- Full IDE support: linting, formatting, autocomplete
- Run `npm install` and `npm test` on your template
- Commit and version control like any other project

### ✅ Transformations as Code
```javascript
import { create, fromFS } from 'clonit'

const ctx = await create(fromFS('./template'))

// Transform with familiar JavaScript APIs
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName
}))

// Conditional logic is just JavaScript
if (!useTypeScript) {
  await ctx.delete('tsconfig.json')
  await ctx.updateJson('package.json', pkg => {
    delete pkg.devDependencies.typescript
    return pkg
  })
}

await ctx.out('./my-new-project')
```

### ✅ Single Source of Truth
```
my-template/
  ├── src/
  │   └── index.ts        # Real TypeScript file
  ├── package.json        # Real package.json
  ├── tsconfig.json       # Real config
  └── README.md           # Real documentation
```
No special directories, no metadata files, no separate prompt logic. Just a regular project.

### ✅ Maintainability Built-in
- **Test your template**: Run the actual project
- **Debug transformations**: Use console.log and debugger
- **Refactor safely**: Your IDE understands everything
- **Share templates**: Just share a GitHub repo or npm package

## Features

- ✨ **No template language** - Keep your templates as real, working projects
- 🧩 **Extensible sources** - Use templates from filesystem, git, npm, or anywhere
- 🛡️ **Safe by default** - All transformations happen in a temp directory
- 🔧 **Simple API** - Intuitive methods for file manipulation
- 📦 **Build your own** - Perfect for creating custom `create-*` packages

## Installation

```bash
npm install clonit
```

## Quick Start

```javascript
import { create, fromFS } from 'clonit'

// 1. Create context from a template source
const ctx = await create(fromFS('./my-template'))

// 2. Transform files
await ctx.rename('_gitignore', '.gitignore')
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: 'my-project'
}))

// 3. Write to destination
await ctx.out('./my-project')
```

## Core Concepts

### Source Functions

Clonit separates template sources from transformation logic:

```javascript
// From filesystem
const ctx = await create(fromFS('./templates/react-app'))

// From git repository
const ctx = await create(
  fromGit('https://github.com/vitejs/vite', {
    sparse: ['packages/create-vite/template-react-ts']
  })
)
```

### Transform then Output

All transformations happen in an isolated temp directory:

```javascript
const ctx = await create(fromFS('./template'))

// Safe transformations
await ctx.rename('README.template.md', 'README.md')
await ctx.update('README.md', content => 
  content.replace('# Template', `# ${projectName}`)
)

// Nothing is written until you call out()
await ctx.out('./my-project')
```

## API Reference

### `create(source, options?)`

Creates a new ClonitContext from a source.

```javascript
const ctx = await create(fromFS('./template'), {
  keepTemp: false,  // Keep temp directory after out()
  overwrite: false, // Overwrite existing target directory
  dryRun: false    // Simulate operations without writing
})
```

The `source` parameter can be:
- A source function from `fromFS()` or `fromGit()`
- A custom async function that populates the temp directory
- A string path (for backward compatibility, converted to `fromFS()`)

### Source Functions

#### `fromFS(path, options?)`

Create a source from filesystem.

```javascript
fromFS('./template', {
  ignore: ['node_modules', '.git', '*.log']
})
```

#### `fromGit(repo, options?)`

Create a source from git repository.

```javascript
fromGit('https://github.com/user/repo', {
  branch: 'main',
  tag: 'v1.0.0',
  commit: 'abc123',
  depth: 1,
  sparse: ['packages/template']
})
```

### ClonitContext Methods

#### File Operations

```javascript
// Read file content
const content = await ctx.read('README.md')

// Rename files (common for dotfiles)
await ctx.rename('_gitignore', '.gitignore')
await ctx.rename('_env.example', '.env')

// Delete unwanted files conditionally
if (!options.includeTests) {
  await ctx.delete('__tests__')
  await ctx.delete('jest.config.js')
}

// Create files when needed
await ctx.create('src/config.js', `export const API_URL = '${apiUrl}'`)
```

#### Content Transformation

```javascript
// Update text file
await ctx.update('README.md', content => {
  return content.replace(/oldValue/g, 'newValue')
})

// Update JSON file
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: 'new-name',
  version: '1.0.0'
}))
```

#### Output

```javascript
// Write transformed files to target directory
await ctx.out('./my-project')
```

## Building a `create-*` CLI

Here's a complete example of building your own scaffolding CLI:

```javascript
#!/usr/bin/env node
import { create, fromFS, fromGit } from 'clonit'
import { select, text } from '@clack/prompts'
import path from 'path'

const templates = {
  minimal: () => fromFS(path.join(__dirname, 'templates/minimal')),
  react: () => fromGit('https://github.com/vitejs/vite', {
    sparse: ['packages/create-vite/template-react-ts']
  })
}

const projectName = await text({
  message: 'Project name?',
  defaultValue: 'my-app'
})

const template = await select({
  message: 'Choose a template',
  options: [
    { value: 'minimal', label: 'Minimal starter' },
    { value: 'react', label: 'React + TypeScript' }
  ]
})

// Create and transform
const ctx = await create(templates[template]())

await ctx.rename('_gitignore', '.gitignore')
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName
}))

// Output
await ctx.out(`./${projectName}`)

console.log(`✨ Created ${projectName}!`)
```

Publish this as `create-my-app` and users can run:
```bash
npm create my-app
yarn create my-app
pnpm create my-app
```

## Recipes

### Conditional Files

```javascript
if (!options.includeTests) {
  await ctx.delete('__tests__')
  await ctx.delete('jest.config.js')
}
```

### Multiple Package.json Updates

```javascript
await ctx.updateJson('package.json', pkg => ({
  ...pkg,
  name: projectName,
  description: options.description,
  author: options.author,
  repository: options.git ? { url: options.git } : undefined,
  keywords: options.keywords?.split(',').map(k => k.trim())
}))
```

### Replace Placeholders

```javascript
// Use simple placeholders in your template files
await ctx.update('README.md', content => 
  content
    .replace(/PROJECT_NAME/g, projectName)
    .replace(/PROJECT_DESCRIPTION/g, description)
    .replace(/AUTHOR_NAME/g, authorName)
)

// Multiple replacements with a map
const replacements = {
  PROJECT_NAME: projectName,
  CURRENT_YEAR: new Date().getFullYear(),
  LICENSE_TYPE: options.license || 'MIT'
}

await ctx.update('LICENSE', content => {
  Object.entries(replacements).forEach(([key, value]) => {
    content = content.replace(new RegExp(key, 'g'), value)
  })
  return content
})
```

### Template-specific Transformations

```javascript
// React component template
if (componentType === 'functional') {
  await ctx.delete('src/ClassComponent.tsx')
  await ctx.rename('src/FunctionalComponent.tsx', `src/${componentName}.tsx`)
  await ctx.update(`src/${componentName}.tsx`, content => 
    content.replace(/TemplateComponent/g, componentName)
  )
}

// Configure based on options
if (options.useStyledComponents) {
  await ctx.updateJson('package.json', pkg => ({
    ...pkg,
    dependencies: {
      ...pkg.dependencies,
      'styled-components': '^6.0.0'
    }
  }))
}
```

## Comparison with Other Tools

| Feature | clonit | plop/hygen | yeoman |
|---------|--------|------------|---------|
| Template Language | ❌ None | ✅ Handlebars | ✅ EJS |
| Template Testing | ✅ Yes | ❌ No | ❌ No |
| IDE Support | ✅ Full | ❌ Limited | ❌ Limited |
| Git/Remote Sources | ✅ Yes | ❌ No | ❌ No |
| Transform Safety | ✅ Temp dir | ❌ In-place | ❌ In-place |

## Development

This is a monorepo managed with pnpm workspaces.

```bash
# Install dependencies
pnpm install

# Run tests for all packages
pnpm -r test

# Build all packages
pnpm -r build

# Run tests in watch mode
pnpm -r test:watch
```

### Project Structure

```
clonit/
├── packages/
│   ├── clonit/           # Core library
│   └── create-zeakd/     # Example CLI
├── package.json          # Root package.json
└── pnpm-workspace.yaml   # Workspace configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT