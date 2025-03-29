import * as fs  from 'node:fs/promises';
import * as os  from 'node:os';
import { join } from 'node:path';

/**
 * Create temporary directory
 * @param prefix Directory name prefix (default: 'clonit-')
 * @returns Absolute path of created temporary directory
 */
export async function createTempDir(prefix = 'clonit-'): Promise<string> {
  const tmpDir = os.tmpdir();
  return fs.mkdtemp(join(tmpDir, prefix));
}
