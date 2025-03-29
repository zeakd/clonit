import { fileURLToPath }      from 'node:url';

import { copyDir }            from '../utils/fs.js';
import { createTempDir }      from '../utils/temp.js';

import { ClonitContext }      from './clonit-context.js';
import type { ClonitOptions } from './types.js';

/**
 * 템플릿 폴더를 임시 디렉토리로 복사하고 ClonitContext를 생성
 */
export async function createClonit(
  source: string,
  target: string,
  options: ClonitOptions = {},
): Promise<ClonitContext> {
  const tempDir = await createTempDir();

  // file:// URL을 처리
  const sourcePath = source.startsWith('file://')
    ? fileURLToPath(source)
    : source;

  await copyDir(sourcePath, tempDir, { ignore: options.ignore || [] });

  return new ClonitContext(tempDir, target, options);
}
