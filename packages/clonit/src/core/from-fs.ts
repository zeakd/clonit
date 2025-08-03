import { fileURLToPath }                      from 'node:url';

import { copyDir }                            from '../utils/fs.js';

import type { SourceFunction, FromFSOptions } from './types.js';

/**
 * Create a source function that copies from file system
 */
export function fromFS(source: string, options: FromFSOptions = {}): SourceFunction {
  return async (tempDir: string): Promise<void> => {
    // Handle file:// URLs
    const sourcePath = source.startsWith('file://')
      ? fileURLToPath(source)
      : source;

    await copyDir(sourcePath, tempDir, { ignore: options.ignore || [] });
  };
}
