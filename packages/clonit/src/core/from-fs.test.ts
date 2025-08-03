import { fileURLToPath }                        from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { copyDir }                              from '../utils/fs.js';

import { fromFS }                               from './from-fs.js';

vi.mock('../utils/fs.js');

describe('fromFS', () => {
  const sourceDir = '/source';
  const tempDir = '/temp/clonit-test';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(copyDir).mockResolvedValue(undefined);
  });

  it('should return a function', () => {
    const sourceFunction = fromFS(sourceDir);
    expect(typeof sourceFunction).toBe('function');
  });

  it('should copy source to temp directory when function is called', async () => {
    const sourceFunction = fromFS(sourceDir);
    await sourceFunction(tempDir);

    expect(copyDir).toHaveBeenCalledWith(sourceDir, tempDir, { ignore: [] });
  });

  it('should respect ignore patterns', async () => {
    const ignore = ['.git', 'node_modules'];
    const sourceFunction = fromFS(sourceDir, { ignore });
    await sourceFunction(tempDir);

    expect(copyDir).toHaveBeenCalledWith(sourceDir, tempDir, { ignore });
  });

  it('should handle file:// URLs correctly', async () => {
    const fileUrl = 'file:///source';
    const expectedPath = fileURLToPath(fileUrl);
    const sourceFunction = fromFS(fileUrl);

    await sourceFunction(tempDir);

    expect(copyDir).toHaveBeenCalledWith(expectedPath, tempDir, { ignore: [] });
  });

  it('should handle options without ignore', async () => {
    const sourceFunction = fromFS(sourceDir, {});
    await sourceFunction(tempDir);

    expect(copyDir).toHaveBeenCalledWith(sourceDir, tempDir, { ignore: [] });
  });
});
