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
  'ts-package': {
    name:   'TypeScript Package',
    source: () => fromGit('https://github.com/zeakd/templates', {
      sparse: ['ts-package'],
    }),
    hint:   'Pure ESM TypeScript package with Vitest',
  },
  'python-app': {
    name:   'Python Application',
    source: () => fromGit('https://github.com/zeakd/templates', {
      sparse: ['python-app'],
    }),
    hint:   'Python 3.12+ with uv, Ruff, and pytest',
  },
  'pnpm-monorepo': {
    name:   'PNPM Monorepo',
    source: () => fromGit('https://github.com/zeakd/templates', {
      sparse: ['pnpm-monorepo'],
    }),
    hint:   'PNPM workspace monorepo structure',
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
  'ts-package': async (ctx, projectName) => {
    // Update package.json
    await ctx.updateJson('package.json', (json) => {
      json.name = projectName;
      return json;
    });
  },
  'python-app': async (ctx, projectName) => {
    // Update pyproject.toml
    await ctx.update('pyproject.toml', (content) => {
      return content.replace(/name = "python-app"/, `name = "${projectName}"`);
    });
  },
  'pnpm-monorepo': async (ctx, projectName) => {
    // Update root package.json
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
    --template, -t  Choose template (ts-package, python-app, pnpm-monorepo, react-ts)

  Examples
    $ create-zeakd my-app
    $ create-zeakd my-app --template ts-package
    $ create-zeakd my-app -t python-app
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

    // Determine next steps based on template
    let nextSteps = '';
    switch (templateId) {
      case 'ts-package':
        nextSteps = `  cd ${projectName}
  pnpm install
  pnpm test`;
        break;
      case 'python-app':
        nextSteps = `  cd ${projectName}
  uv sync
  uv run python -m app`;
        break;
      case 'pnpm-monorepo':
        nextSteps = `  cd ${projectName}
  pnpm install
  pnpm build`;
        break;
      case 'react-ts':
        nextSteps = `  cd ${projectName}
  npm install
  npm run dev`;
        break;
    }

    outro(`✨ Done!
Project created at ${targetDir}

Next steps:
${nextSteps}
`);
  }
  catch (error) {
    s.stop('Failed to create project');
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
