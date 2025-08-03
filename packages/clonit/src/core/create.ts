import { createTempDir }                      from '../utils/temp.js';

import { ClonitContext }                      from './clonit-context.js';
import { fromFS }                             from './from-fs.js';
import type { ClonitOptions, SourceFunction } from './types.js';

/**
 * Create a ClonitContext by copying template to temporary directory
 */
export async function create(
  source: SourceFunction | string,
  options: ClonitOptions = {},
): Promise<ClonitContext> {
  const tempDir = await createTempDir();

  if (typeof source === 'string') {
    // Backward compatibility: treat string as file system source
    const sourceFunction = fromFS(source, { ignore: options.ignore });
    await sourceFunction(tempDir);
  }
  else {
    // New API: execute the source function
    await source(tempDir);
  }

  return new ClonitContext(tempDir, options);
}
