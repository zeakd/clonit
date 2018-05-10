# clonit
initialize your repo with cloned repository

## Install

``` bash
$ npm install -g clonit
``` 

## Usage

before run clonit, create empty repository for your project.

``` bash 
$ clonit --help

  initialize your repo with cloned repository

  Usage
    $ clonit <STARTER_REPO_URL> <REPO_URL> [FOLDER_NAME]
    $ clonit <STARTER_REPO_URL> <REPO_NAME> # if same repo root

  Examples
    $ clonit https://github.com/zeakd/rollup-module-starter my-module # YOU SHOULD HAVE https://github.com/zeakd/my-module
    $ clonit https://github.com/zeakd/rollup-module-starter https://github.com/zeakd/my-module
    $ clonit https://github.com/zeakd/rollup-module-starter https://github.com/zeakd/my-module mine
```

``` bash
$ clonit https://github.com/zeakd/rollup-module-starter https://github.com/zeakd/my-module my-module
or
$ clonit https://github.com/zeakd/rollup-module-starter my-module
$ cd my-module
$ npm init # npm init would not remove dependency, scripts, etc. just edit name, version, author, license of package.json.
```

## What it does 

- git clone the starter repo
- remove .git folder
- init git
- add remote origin. https://github.com/YOUR_ID/MY_MODULE.git should be created and empty
- commit with "init" message

## TODO

- CLI visualization
- if repo has package.json, npm init before commit.