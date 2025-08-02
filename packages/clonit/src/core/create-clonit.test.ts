import { fileURLToPath }                        from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { copyDir }                              from '../utils/fs.js';
import { createTempDir }                        from '../utils/temp.js';

import { create }                               from './create-clonit.js';

vi.mock('../utils/fs.js');
vi.mock('../utils/temp.js');

describe('create', () => {
  const sourceDir = '/source';
  const targetDir = '/target';
  const tempDir = '/temp/clonit-test';
  const testCwd = '/test/cwd';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createTempDir).mockResolvedValue(tempDir);
    vi.mocked(copyDir).mockResolvedValue(undefined);
  });

  it('should create ClonitContext with source files', async () => {
    const context = await create(sourceDir, targetDir, { cwd: testCwd });

    expect(createTempDir).toHaveBeenCalled();
    expect(copyDir).toHaveBeenCalledWith(sourceDir, tempDir, { ignore: [] });
    expect(context).toBeDefined();
    expect(context.targetDir).toBe(targetDir);
  });

  it('should respect ignore patterns', async () => {
    const ignore = ['.git', 'node_modules'];
    await create(sourceDir, targetDir, { cwd: testCwd, ignore });

    expect(copyDir).toHaveBeenCalledWith(sourceDir, tempDir, { ignore });
  });

  it('should handle file:// URLs correctly', async () => {
    const fileUrl = 'file:///source';
    const expectedPath = fileURLToPath(fileUrl);

    await create(fileUrl, targetDir, { cwd: testCwd });

    expect(copyDir).toHaveBeenCalledWith(expectedPath, tempDir, { ignore: [] });
  });
});
