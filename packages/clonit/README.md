# Clonit

Maintainable scaffolding toolkit


```js
import { createClonit } from 'clonit'

// -
const ctx = await createClonit('./templates/hello-app/'); 

// -
await ctx.rename('_gitignore', '.gitignore');
await ctx.update('README.md', (content) => {
	return content.replace('__PLACEHOLDER__', 'My App')
})
await ctx.updateJson('package.json', (pkg) => {
	pkg.description = 'My first app';
	pkg.name = 'my-app';
	return pkg;
})

// -
await ctx.out('./my-app');
```

## Core Concepts

