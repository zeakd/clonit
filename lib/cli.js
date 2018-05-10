#!/usr/bin/env node
const meow = require('meow');
const del = require('del');
const clonit = require('./clonit')

const cli = meow(`
  Usage  
    $ clonit <STARTER_REPO_URL> <REPO_URL> [FOLDER_NAME]
    $ clonit <STARTER_REPO_URL> <REPO_NAME> # if same repo root

  Examples 
    $ clonit https://github.com/zeakd/rollup-module-starter my-module # YOU SHOULD HAVE https://github.com/zeakd/my-module
    $ clonit https://github.com/zeakd/rollup-module-starter https://github.com/zeakd/my-module
    $ clonit https://github.com/zeakd/rollup-module-starter https://github.com/zeakd/my-module mine
`);

clonit(cli.input, cli.flags)

