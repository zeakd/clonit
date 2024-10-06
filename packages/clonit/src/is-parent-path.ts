import path from 'node:path';

export function isParentPath(parent: string, child: string) {
  const parentFilepath = path.resolve(parent);
  const childFilepath = path.resolve(child);

  return childFilepath.startsWith(parentFilepath) && path.relative(childFilepath, parentFilepath).startsWith('..');
}
