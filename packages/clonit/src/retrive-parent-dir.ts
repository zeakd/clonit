import * as path from 'node:path';

/**
 * Generator that traverses parent directories from fromDir
 * @example
 * for (const dir of retriveParent('/path/to/dir'))
 */
export function* retriveParentDir(fromDir: string) {
  const fromDirpath = path.resolve(fromDir);

  let currentDir = fromDirpath;

  while (true) {
    yield currentDir;

    const parentDir = path.dirname(currentDir);
    if (currentDir === '/') {
      break;
    }

    currentDir = parentDir;
  }
}
