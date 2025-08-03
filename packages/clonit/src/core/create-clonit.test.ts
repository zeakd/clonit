import { fileURLToPath }                        from 'node:url';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { copyDir }                              from '../utils/fs.js';
import { createTempDir }                        from '../utils/temp.js';

import { create }                               from './create-clonit.js';
import { fromFS }                               from './from-fs.js';
import { fromGit }                              from './from-git.js';

vi.mock('../utils/fs.js');
vi.mock('../utils/temp.js');
vi.mock('./from-fs.js');
vi.mock('./from-git.js');

describe('create', () => {
  const sourceDir = '/source';
  const targetDir = '/target';
  const tempDir = '/temp/clonit-test';
  const testCwd = '/test/cwd';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createTempDir).mockResolvedValue(tempDir);
    vi.mocked(copyDir).mockResolvedValue(undefined);
    
    // Mock fromFS to return a function that calls copyDir
    vi.mocked(fromFS).mockImplementation((source, options) => {
      return async (tempDir) => {
        const sourcePath = source.startsWith('file://')
          ? fileURLToPath(source)
          : source;
        await copyDir(sourcePath, tempDir, { ignore: options?.ignore || [] });
      };
    });
  });

  describe('with function source', () => {
    it('should accept a source function', async () => {
      const mockSourceFunction = vi.fn().mockResolvedValue(undefined);
      const context = await create(mockSourceFunction, targetDir, { cwd: testCwd });

      expect(createTempDir).toHaveBeenCalled();
      expect(mockSourceFunction).toHaveBeenCalledWith(tempDir);
      expect(context).toBeDefined();
      expect(context.targetDir).toBe(targetDir);
    });

    it('should work with fromFS', async () => {
      const mockSourceFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked(fromFS).mockReturnValue(mockSourceFunction);

      const context = await create(fromFS(sourceDir), targetDir, { cwd: testCwd });

      expect(createTempDir).toHaveBeenCalled();
      expect(mockSourceFunction).toHaveBeenCalledWith(tempDir);
      expect(context).toBeDefined();
      expect(context.targetDir).toBe(targetDir);
    });

    it('should work with fromGit', async () => {
      const mockSourceFunction = vi.fn().mockResolvedValue(undefined);
      vi.mocked(fromGit).mockReturnValue(mockSourceFunction);

      const context = await create(fromGit('https://github.com/user/repo'), targetDir, { cwd: testCwd });

      expect(createTempDir).toHaveBeenCalled();
      expect(mockSourceFunction).toHaveBeenCalledWith(tempDir);
      expect(context).toBeDefined();
      expect(context.targetDir).toBe(targetDir);
    });
  });

  describe('backward compatibility with string source', () => {
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
});
