#!/usr/bin/env node
import path                                                      from 'node:path';
import process                                                   from 'node:process';
import { fileURLToPath }                                         from 'node:url';

import { intro, outro, select, text, spinner, cancel, isCancel } from '@clack/prompts';
import { create, fromFS, fromGit }                               from 'clonit';
import meow                                                      from 'meow';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Template definitions
const templates = {
  'pnpm-ts': {
    name:   'PNPM + TypeScript',
    source: () => fromFS(path.join(__dirname, 'templates/pnpm-package-ts')),
    hint:   'Basic TypeScript project',
  },
  'react-ts': {
    name:   'React + TypeScript (Vite)',
    source: () => fromGit('https://github.com/vitejs/vite', {
      sparse: ['packages/create-vite/template-react-ts'],
    }),
    hint: 'Vite-based React + TypeScript',
  },
};

// Template-specific handlers
const templateHandlers = {
  'pnpm-ts': async (ctx, projectName) => {
    try {
      await ctx.rename('_gitignore', '.gitignore');
    }
    catch {
      // File doesn't exist, ignore
    }

    try {
      await ctx.rename('_env', '.env');
    }
    catch {
      // File doesn't exist, ignore
    }

    try {
      await ctx.rename('_env.local', '.env.local');
    }
    catch {
      // File doesn't exist, ignore
    }

    await ctx.updateJson('package.json', (json) => {
      json.name = projectName;
      return json;
    });
  },
  'react-ts': async (ctx, projectName) => {
    // Handle _gitignore rename
    try {
      await ctx.rename('_gitignore', '.gitignore');
    }
    catch {
      // File doesn't exist or already renamed, ignore
    }

    // Update package.json
    await ctx.updateJson('package.json', (json) => {
      json.name = projectName;
      if (!json.version || json.version === '0.0.0') {
        json.version = '0.1.0';
      }
      return json;
    });
  },
};

// CLI setup
const cli = meow(`
  Usage
    $ create-zeakd [project-name]

  Options
    --template, -t  Choose template (pnpm-ts, react-ts)

  Examples
    $ create-zeakd my-app
    $ create-zeakd my-app --template react-ts
    $ create-zeakd my-app -t pnpm-ts
`, {
  importMeta: import.meta,
  flags:      {
    template: {
      type:      'string',
      shortFlag: 't',
    },
  },
});

async function main() {
  let projectName = cli.input[0];
  let templateId = cli.flags.template;

  // If no project name provided via CLI, ask interactively
  if (!projectName) {
    intro('create-zeakd - Project scaffolding tool');

    projectName = await text({
      message:     'What is your project name?',
      placeholder: 'my-awesome-project',
      validate:    (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/.test(value)) {
          return 'Project name can only contain lowercase letters, numbers, hyphens, and underscores';
        }
      },
    });

    if (isCancel(projectName)) {
      cancel('Operation cancelled');
      process.exit(0);
    }
  }

  // If no template provided via CLI, ask interactively
  if (!templateId) {
    if (cli.input.length === 0) {
      // Only show intro if we're in full interactive mode
      intro('create-zeakd - Project scaffolding tool');
    }

    const templateChoice = await select({
      message: 'Select a template',
      options: Object.entries(templates).map(([id, template]) => ({
        value: id,
        label: template.name,
        hint:  template.hint,
      })),
    });

    if (isCancel(templateChoice)) {
      cancel('Operation cancelled');
      process.exit(0);
    }

    templateId = templateChoice;
  }

  // Validate template
  if (!templates[templateId]) {
    console.error(`Error: Unknown template "${templateId}"`);
    console.error(`Available templates: ${Object.keys(templates).join(', ')}`);
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), projectName);
  const template = templates[templateId];

  const s = spinner();
  s.start('Creating project...');

  try {
    // Create project using selected template
    const ctx = await create(template.source(), { overwrite: false });

    // Apply template-specific transformations
    const handler = templateHandlers[templateId];
    if (handler) {
      await handler(ctx, projectName);
    }

    await ctx.out(targetDir);

    s.stop('Project created successfully!');

    outro(`✨ Done!
Project created at ${targetDir}

Next steps:
  cd ${projectName}
  ${templateId === 'pnpm-ts' ? 'pnpm install' : 'npm install'}
  ${templateId === 'pnpm-ts' ? 'pnpm dev' : 'npm run dev'}
`);
  }
  catch (error) {
    s.stop('Failed to create project');
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
