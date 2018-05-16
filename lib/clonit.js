const path = require('path');
const { URL }= require('url');
const del = require('del');
const isURL = require('is-whatwg-url');
const git = require('./git');

function normalizeInput (input) {
  
  if (input.length < 2) {
    throw new Error('missing arguments')
  }
  
  // get source repo
  const sourceRepo = input[0]
  if (!isURL(sourceRepo)) throw new Error('invalid input');
  
  // get target repo, folder name
  let targetRepo, folderName; 
  if (input.length < 3) {
    const target = input[1];

    if (isURL(target)) {

      // target is repository url
      targetRepo = target;
      
      // get folder name
      folderName = path.parse(targetRepo).name;

    } else {

      // target is repository name
      folderName = target;
      const parsedSrcUrl = new URL(sourceRepo);

      parsedSrcUrl.pathname = path.resolve(parsedSrcUrl.pathname, `../${folderName}`);
      targetRepo = parsedSrcUrl.toString();
    }
  } else {
    targetRepo = input[1];
    folderName = input[2];
  }

  if (!isURL(targetRepo)) 
    throw new Error('invalid input');

  if (typeof folderName !== 'string') 
    throw new Error('invalid input');

  return {
    sourceRepo,
    targetRepo,
    folderName,
  }
}

function clonit (input, options) {
  let normalized;
  try {
    normalized = normalizeInput(input);
  } catch (err) {
    console.error(err);
    process.exit(-1);
  }

  const {
    sourceRepo,
    targetRepo,
    folderName,
  } = normalized;

  // cwd after clone
  const targetCwd = path.resolve(process.cwd(), folderName);

  git.clone([sourceRepo, folderName])
    .then(logger(`cloned ${sourceRepo} to ${folderName}`))
    .then(() => del([`${folderName}/.git`]))
    .then(logger('deleted .git'))
    .then(() => git.init({ cwd: targetCwd }))
    .then(logger('git inited'))
    .then(() => git.remoteAdd(['origin', targetRepo], { cwd: targetCwd })) 
    .then(logger(`remote ${targetRepo} added as origin`))
    .then(() => git.add(['.'], { cwd: targetCwd }))
    .then(logger('added all file'))
    .then(() => git.commit(['init'], { cwd: targetCwd }))
    .then(logger('first commit'))
}

const logger = msg => o => {
  console.log(msg);
  return o;
}

module.exports = clonit;

