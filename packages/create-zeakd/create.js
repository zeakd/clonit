import { createClonit } from 'clonit';

const ctx = await createClonit('./templates/pnpm-package-ts', './here', {
  forceOverwrite: false,
});

await ctx.rename('_gitignore', '.gitignore');
await ctx.rename('_env', '.env');
await ctx.rename('_env.local', '.env.local');
await ctx.updateJson('package.json', (json) => {
  json.name = 'hello';
  return json;
});
await ctx.out();
