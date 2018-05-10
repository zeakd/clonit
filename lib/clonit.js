const path = require('path');
const url = require('url');
const del = require('del');
const git = require('./git');

function clonit (input, options) {
  if (input.length < 2) {
    return process.exit(1); 
  }

  // get starter repo url
  const sourceRepo = input[0];

  // get target folder name
  let folderName;
  let targetRepo;

  if (input.length < 3) {

    folderName = input[1];
    const parsedUrl = new url.URL(sourceRepo);
    parsedUrl.pathname = path.resolve(parsedUrl.pathname, `../${folderName}`);
    targetRepo = parsedUrl.toString();
  } else {

    targetRepo = input[1];
    folderName = input[2];
  }

  // cwd after clone
  const targetCwd = path.resolve(process.cwd(), folderName);

  git.clone([sourceRepo, folderName])
    .then(logger('cloned'))
    .then(() => del([`${folderName}/.git`]))
    .then(logger('deleted .git'))
    .then(() => git.init({ cwd: targetCwd }))
    .then(logger('inited'))
    .then(() => git.remoteAdd(['origin', targetRepo], { cwd: targetCwd })) 
    .then(logger('remote added'))
    .then(() => git.add(['.'], { cwd: targetCwd }))
    .then(logger('added'))
    .then(() => git.commit(['init'], { cwd: targetCwd }))
    .then(logger('commited'))
}

const logger = msg => o => {
  console.log(msg);
  return o;
}

module.exports = clonit;

