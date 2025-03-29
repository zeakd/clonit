import path                                                     from 'path';

import { describe, it, expect, vi, beforeEach, afterEach }      from 'vitest';

import { readFile, writeFile, rename, copyDir, remove, exists } from '../utils/fs.js';

import { ClonitContext }                                        from './clonit-context.js';

vi.mock('../utils/fs.js', () => ({
  readFile:  vi.fn(),
  writeFile: vi.fn(),
  rename:    vi.fn(),
  copyDir:   vi.fn(),
  remove:    vi.fn(),
  exists:    vi.fn(),
}));

describe('ClonitContext', () => {
  let context: ClonitContext;
  const tempDir = '/temp/clonit-test';
  const options = {
    ignore:         ['.git', 'node_modules'],
    keepTemp:       false,
    forceOverwrite: false,
    cwd:            '/test/cwd',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    context = new ClonitContext(tempDir, options);
  });

  afterEach(async () => {
    await context.cleanup();
  });

  describe('constructor', () => {
    it('should throw error if tempDir is empty', () => {
      expect(() => new ClonitContext('')).toThrow('Temporary directory path is required');
    });

    it('should set tempDir', () => {
      expect(context.tempDir).toBe(tempDir);
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
  });

  describe('out', () => {
    it('should copy contents of temporary folder to target folder and delete temporary folder', async () => {
      const targetPath = '/target';

      await context.out(targetPath);

      expect(copyDir).toHaveBeenCalledWith(tempDir, targetPath, { ignore: options.ignore });
      expect(remove).toHaveBeenCalledWith(tempDir);
    });

    it('should not delete temporary folder if keepTemp is true', async () => {
      const targetPath = '/target';
      context = new ClonitContext(tempDir, { ...options, keepTemp: true });

      await context.out(targetPath);

      expect(copyDir).toHaveBeenCalledWith(tempDir, targetPath, { ignore: options.ignore });
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
});
