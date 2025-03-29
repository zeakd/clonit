import path                                                                        from 'path';

import { describe, it, expect, vi, beforeEach, afterEach }                         from 'vitest';

import { readFile, writeFile, rename, copyDir, remove, exists, isEmptyDir, mkdir } from '../utils/fs.js';

import { ClonitContext }                                                           from './clonit-context.js';

vi.mock('../utils/fs.js', () => ({
  readFile:   vi.fn(),
  writeFile:  vi.fn(),
  rename:     vi.fn(),
  copyDir:    vi.fn(),
  remove:     vi.fn(),
  exists:     vi.fn(),
  isEmptyDir: vi.fn(),
  mkdir:      vi.fn(),
}));

describe('ClonitContext', () => {
  let context: ClonitContext;
  const tempDir = '/temp/clonit-test';
  const targetDir = '/target/clonit-test';
  const options = {
    ignore:    ['.git', 'node_modules'],
    keepTemp:  false,
    overwrite: false,
    cwd:       '/test/cwd',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(isEmptyDir).mockResolvedValue(true);
    context = new ClonitContext(tempDir, targetDir, options);
  });

  afterEach(async () => {
    await context.cleanup();
  });

  describe('constructor', () => {
    it('should throw error if tempDir is empty', () => {
      expect(() => new ClonitContext('', targetDir)).toThrow('Temporary directory path is required');
    });

    it('should throw error if targetDir is empty', () => {
      expect(() => new ClonitContext(tempDir, '')).toThrow('Target directory path is required');
    });

    it('should set tempDir and targetDir', () => {
      expect(context.tempDir).toBe(tempDir);
      expect(context.targetDir).toBe(targetDir);
    });
  });

  describe('rename', () => {
    it('should rename file or directory', async () => {
      const oldPath = 'old.txt';
      const newPath = 'new.txt';
      const oldAbsPath = path.resolve(tempDir, oldPath);
      const newAbsPath = path.resolve(tempDir, newPath);

      await context.rename(oldPath, newPath);

      expect(rename).toHaveBeenCalledWith(oldAbsPath, newAbsPath);
    });

    it('should throw error when oldPath is outside tempDir', async () => {
      const oldPath = '../outside.txt';
      const newPath = 'new.txt';

      await expect(context.rename(oldPath, newPath)).rejects.toThrow('Path "../outside.txt" is outside of temporary directory');
      expect(rename).not.toHaveBeenCalled();
    });

    it('should throw error when newPath is outside tempDir', async () => {
      const oldPath = 'old.txt';
      const newPath = '../outside.txt';

      await expect(context.rename(oldPath, newPath)).rejects.toThrow('Path "../outside.txt" is outside of temporary directory');
      expect(rename).not.toHaveBeenCalled();
    });

    it('should throw error for directory traversal in oldPath', async () => {
      const oldPath = 'subdir/../../../outside.txt';
      const newPath = 'new.txt';

      await expect(context.rename(oldPath, newPath)).rejects.toThrow('Path "subdir/../../../outside.txt" is outside of temporary directory');
      expect(rename).not.toHaveBeenCalled();
    });

    it('should throw error for directory traversal in newPath', async () => {
      const oldPath = 'old.txt';
      const newPath = 'subdir/../../../outside.txt';

      await expect(context.rename(oldPath, newPath)).rejects.toThrow('Path "subdir/../../../outside.txt" is outside of temporary directory');
      expect(rename).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update file content', async () => {
      const relPath = 'test.txt';
      const absPath = path.resolve(tempDir, relPath);
      const oldContent = 'Hello, World!';
      const newContent = 'Hello, Clonit!';

      vi.mocked(readFile).mockResolvedValue(oldContent);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await context.update(relPath, () => newContent);

      expect(readFile).toHaveBeenCalledWith(absPath);
      expect(writeFile).toHaveBeenCalledWith(absPath, newContent);
    });

    it('should handle async transform function', async () => {
      const relPath = 'test.txt';
      const absPath = path.resolve(tempDir, relPath);
      const oldContent = 'Hello, World!';
      const newContent = 'Hello, Clonit!';

      vi.mocked(readFile).mockResolvedValue(oldContent);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await context.update(relPath, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return newContent;
      });

      expect(readFile).toHaveBeenCalledWith(absPath);
      expect(writeFile).toHaveBeenCalledWith(absPath, newContent);
    });

    it('should not update file when async transform returns undefined', async () => {
      const relPath = 'test.txt';
      const absPath = path.resolve(tempDir, relPath);
      const oldContent = 'Hello, World!';

      vi.mocked(readFile).mockResolvedValue(oldContent);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await context.update(relPath, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return undefined;
      });

      expect(readFile).toHaveBeenCalledWith(absPath);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('updateJson', () => {
    it('should update JSON file content', async () => {
      const relPath = 'package.json';
      const absPath = path.resolve(tempDir, relPath);
      const oldContent = '{"name": "test"}';
      const newContent = '{\n  "name": "clonit"\n}';

      vi.mocked(readFile).mockResolvedValue(oldContent);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await context.updateJson(relPath, () => ({ name: 'clonit' }));

      expect(readFile).toHaveBeenCalledWith(absPath);
      expect(writeFile).toHaveBeenCalledWith(absPath, newContent);
    });

    it('should handle async transform function', async () => {
      const relPath = 'package.json';
      const absPath = path.resolve(tempDir, relPath);
      const oldContent = '{"name": "test"}';
      const newContent = '{\n  "name": "clonit"\n}';

      vi.mocked(readFile).mockResolvedValue(oldContent);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await context.updateJson(relPath, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { name: 'clonit' };
      });

      expect(readFile).toHaveBeenCalledWith(absPath);
      expect(writeFile).toHaveBeenCalledWith(absPath, newContent);
    });

    it('should not update JSON file when async transform returns undefined', async () => {
      const relPath = 'package.json';
      const absPath = path.resolve(tempDir, relPath);
      const oldContent = '{"name": "test"}';

      vi.mocked(readFile).mockResolvedValue(oldContent);
      vi.mocked(writeFile).mockResolvedValue(undefined);

      await context.updateJson(relPath, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return undefined;
      });

      expect(readFile).toHaveBeenCalledWith(absPath);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  describe('out', () => {
    it('should copy files to target directory', async () => {
      await context.out();

      expect(copyDir).toHaveBeenCalledWith(tempDir, targetDir, { ignore: options.ignore });
      expect(remove).toHaveBeenCalledWith(tempDir);
    });

    it('should throw error when target is not empty and overwrite is false', async () => {
      vi.mocked(isEmptyDir).mockResolvedValue(false);

      await expect(context.out())
        .rejects
        .toThrow('Target directory "/target/clonit-test" is not empty. Use overwrite option to proceed.');
    });

    it('should proceed when target is not empty but overwrite is true', async () => {
      vi.mocked(isEmptyDir).mockResolvedValue(false);
      const context = new ClonitContext(tempDir, targetDir, { ...options, overwrite: true });

      await context.out();

      expect(copyDir).toHaveBeenCalledWith(tempDir, targetDir, { ignore: options.ignore });
      expect(remove).toHaveBeenCalledWith(tempDir);
    });

    it('should not remove temp directory when keepTemp is true', async () => {
      const context = new ClonitContext(tempDir, targetDir, { ...options, keepTemp: true });
      await context.out();

      expect(copyDir).toHaveBeenCalledWith(tempDir, targetDir, { ignore: options.ignore });
      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should delete temporary directory', async () => {
      vi.mocked(exists).mockResolvedValue(false);
      await context.cleanup();
      expect(remove).toHaveBeenCalledWith(tempDir);
    });
  });

  describe('resolvePath', () => {
    it('should resolve path within tempDir', () => {
      const relPath = 'test.txt';
      const absPath = path.resolve(tempDir, relPath);

      // @ts-expect-error - private method access for testing
      const result = context.resolvePath(relPath);

      expect(result).toBe(absPath);
    });

    it('should throw error for path outside tempDir', () => {
      const relPath = '../outside.txt';

      // @ts-expect-error - private method access for testing
      expect(() => context.resolvePath(relPath)).toThrow('Path "../outside.txt" is outside of temporary directory');
    });

    it('should throw error for path with directory traversal', () => {
      const relPath = 'subdir/../../../outside.txt';

      // @ts-expect-error - private method access for testing
      expect(() => context.resolvePath(relPath)).toThrow('Path "subdir/../../../outside.txt" is outside of temporary directory');
    });
  });

  describe('create', () => {
    it('should create a file with content', async () => {
      const relPath = 'test.txt';
      const content = 'Hello, World!';
      const absPath = path.resolve(tempDir, relPath);

      await context.create(relPath, content);

      expect(writeFile).toHaveBeenCalledWith(absPath, content);
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('should create a directory', async () => {
      const relPath = 'src/components';
      const absPath = path.resolve(tempDir, relPath);

      await context.create(relPath, undefined, true);

      expect(mkdir).toHaveBeenCalledWith(absPath, { recursive: true });
      expect(writeFile).not.toHaveBeenCalled();
    });

    it('should throw error when creating file without content', async () => {
      const relPath = 'test.txt';

      await expect(context.create(relPath)).rejects.toThrow('Content is required for file creation');
      expect(writeFile).not.toHaveBeenCalled();
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('should throw error when path is outside tempDir', async () => {
      const relPath = '../outside.txt';
      const content = 'Hello, World!';

      await expect(context.create(relPath, content)).rejects.toThrow('Path "../outside.txt" is outside of temporary directory');
      expect(writeFile).not.toHaveBeenCalled();
      expect(mkdir).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete file or directory', async () => {
      const relPath = 'test.txt';
      const absPath = path.resolve(tempDir, relPath);

      await context.delete(relPath);

      expect(remove).toHaveBeenCalledWith(absPath);
    });

    it('should throw error when path is outside tempDir', async () => {
      const relPath = '../outside.txt';

      await expect(context.delete(relPath)).rejects.toThrow('Path "../outside.txt" is outside of temporary directory');
      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe('cwd', () => {
    it('should use tempDir as cwd', () => {
      const context = new ClonitContext(tempDir, targetDir, options);
      expect(context.cwd).toBe(tempDir);
    });

    it('should not be affected by options.cwd', () => {
      const customCwd = '/custom/cwd';
      const context = new ClonitContext(tempDir, targetDir, { ...options, cwd: customCwd });
      expect(context.cwd).toBe(tempDir);
    });
  });

  describe('resolve', () => {
    it('should resolve relative path to absolute path based on tempDir', () => {
      const context = new ClonitContext(tempDir, targetDir, options);
      const relPath = 'src/index.ts';
      const expected = path.resolve(tempDir, relPath);
      expect(context.resolve(relPath)).toBe(expected);
    });

    it('should handle parent directory traversal', () => {
      const context = new ClonitContext(tempDir, targetDir, options);
      const relPath = '../lib/utils.ts';
      const expected = path.resolve(tempDir, relPath);
      expect(context.resolve(relPath)).toBe(expected);
    });

    it('should handle absolute paths', () => {
      const context = new ClonitContext(tempDir, targetDir, options);
      const absPath = '/absolute/path/to/file.ts';
      expect(context.resolve(absPath)).toBe(absPath);
    });
  });
});
