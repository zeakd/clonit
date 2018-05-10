const execa = require('execa');

module.exports._git = (command, args, opts) =>
  execa('git', [command].concat(args), opts);

module.exports.clone = (args, opts) => 
  this._git('clone', args, opts)

module.exports.init = (opts) => 
  this._git('init', [], opts)

module.exports.remoteAdd = (args, opts) =>
  this._git('remote', ['add'].concat(args), opts);

module.exports.add = (args, opts) =>
  this._git('add', args, opts);

module.exports.commit = (message, opts) =>
  this._git('commit', ['-m'].concat(message), opts);
