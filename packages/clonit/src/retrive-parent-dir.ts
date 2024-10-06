import * as path from 'node:path';

/**
 * fromDir 부터 부모 디렉토리를 순회하며 디렉토리를 반환하는 generator
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
