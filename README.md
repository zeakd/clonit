# clonit
Easiest way to create-your-app: clone it

## Install

``` bash
  $ npm install -g clonit
  $ clonit --help
``` 


``` bash
  $ npx clonit --help
``` 

## Usage

``` bash
  $ clonit --help
```
```
  Usage: 
    $ clonit <source-folder> <dest>
    $ clonit <source-git-url> <dest>

  Options
    --ignore-specs    ignore spec file (defaults: .gitignore)
    --prefix          prefix of source for monorepo
    --force           overwrite dest
    --branch          use specific git branch (when use git)

  Examples
    $ clonit my/starter/repo my-app
    $ clonit my/starter/repo my-app --ignore-specs .gitignore --ignore-specs .ignore # your own ignorefile
    $ clonit https://github.com/zeakd/rollup-module-starter my-app --prefix typescript # from remote monorepo
```

## What it does 

- clone starter using git repo or local folder.
- choose **branch** and **prefix**
- respect **.gitignore** or somthing else you want.


## Roadmap

- [ ] node api
- [ ] post clonit hook (like `npm install` or `yarn`)
- [ ] templete variable (like module name)