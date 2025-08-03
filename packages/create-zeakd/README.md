# @zeakd/create

A flexible project scaffolding tool with both CLI and interactive modes.

## Installation

```bash
npm install -g @zeakd/create
# or
npx @zeakd/create
```

## Usage

### CLI Mode

```bash
# Create project with CLI arguments
npx @zeakd/create my-app
npx @zeakd/create my-app --template react-ts
npx @zeakd/create my-app -t pnpm-ts
```

### Interactive Mode

```bash
# Run without arguments for interactive mode
npx @zeakd/create
```

In interactive mode, you'll be prompted to:
1. Enter your project name
2. Select a template

## Available Templates

### pnpm-ts
- **Type**: Local template (using `fromFS`)
- **Description**: Basic TypeScript project with PNPM
- **Features**: TypeScript configuration, PNPM package manager, development environment setup

### react-ts
- **Type**: Git template (using `fromGit`) 
- **Description**: React + TypeScript with Vite
- **Features**: Vite build tool, React 18, TypeScript, Hot Module Replacement

## Features

- 🎯 **Flexible Usage**: Both CLI and interactive modes
- 📦 **Multiple Templates**: Local and Git-based templates
- 🔧 **Smart Defaults**: Automatic project configuration
- 🚀 **Quick Start**: Ready to develop immediately after creation
- ⚡ **Optimized Git Clones**: Uses shallow clones and sparse checkout for faster downloads

## How it Works

This tool uses the `clonit` package with:
- `fromFS`: Copies templates from the local file system
- `fromGit`: Clones templates from Git repositories with optimized settings (depth: 1, branch: main)

Template-specific transformations:
- **pnpm-ts**: Renames `_gitignore` → `.gitignore`, `_env` → `.env`, etc.
- **react-ts**: Updates `package.json` with project name

## Development

```bash
# Install dependencies
pnpm install

# Test locally
node create.js

# Run with arguments
node create.js my-app -t react-ts
```

## License

ISC