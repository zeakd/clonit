import { isAbsolute, resolve } from 'path';

function makeAbsolute(path: string): string {
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

export { makeAbsolute };
