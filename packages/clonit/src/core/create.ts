import { createTempDir }                      from '../utils/temp.js';

import { ClonitContext }                      from './clonit-context.js';
import { fromFS }                             from './from-fs.js';
import type { ClonitOptions, SourceFunction } from './types.js';

/**
 * 템플릿 폴더를 임시 디렉토리로 복사하고 ClonitContext를 생성
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
