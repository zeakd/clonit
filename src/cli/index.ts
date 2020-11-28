#!/usr/bin/env node

import meow from 'meow';
import { isGitRemote } from '../utils/is-git-remote';
import { remote, local } from './commands';
import { Options } from './types';

const cli = meow(`
  Usage: 
    $ clonit <source-folder> <dest>
    $ clonit <source-git-url> <dest>

  Options
    --ignore-specs    ignore spec file (defaults: .gitignore)
    --prefix          prefix of source for monorepo
    --force           overwrite dest
    --branch          use specific git branch (when use git)

  Examples
    $ clonit my/starter/folder my-app
    $ clonit my/starter/folder my-app --ignore-specs .gitignore --ignore-specs .ignore # your own ignorefile
    $ clonit https://github.com/zeakd/starters my-cli --prefix typescript-ink-starter # from remote monorepo
`, {
  flags: {
    'ignore-specs': {
      type: 'string',
      default: ['.gitignore'],
      isMultiple: true,
    },
    force: {
      type: 'boolean',
      default: false,
    },
    prefix: {
      type: 'string',
      default: '/',
    },
    branch: { type: 'string' },
  },
});

// TODO: fail on extraneous flags

run(cli);

async function run(cli: meow.Result) {
  if (cli.input.length !== 2) {
    cli.showHelp();
    return;
  }

  const [src, dest] = cli.input;
  const options = cli.flags as Options;

  if (isGitRemote(src)) {
    remote(src, dest, options);
  } else {    
    local(src, dest, options);
  }
}
