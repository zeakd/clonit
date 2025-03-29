import { Stats }                                      from 'node:fs';
import * as fs                                        from 'node:fs/promises';

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import {
  exists,
  copyFile,
  copyDir,
  readFile,
  writeFile,
  remove,
} from '../../src/utils/fs.js';

type MockedFs = {
  [K in keyof typeof fs]: Mock;
};

const mockFs = fs as unknown as MockedFs;
vi.mock('node:fs/promises');

describe('fs utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Common test cases
  const testCases = {
    invalidPaths: [
      { path: '', description: 'empty path' },
      { path: ' ', description: 'whitespace path' },
      { path: '/', description: 'root path' },
      { path: '..', description: 'parent directory' },
      { path: './', description: 'current directory' },
    ],
    specialChars: [
      { path: '/test/file with spaces.txt', description: 'spaces in path' },
      { path: '/test/file-with-special-chars!@#$%^&*.txt', description: 'special characters' },
      { path: '/test/file-with-한글.txt', description: 'non-ASCII characters' },
    ],
  };

  describe('exists', () => {
    it('should return true when file exists', async () => {
      const path = '/test/file.txt';
      mockFs.access.mockResolvedValue(undefined);
      const result = await exists(path);
      expect(result).toBe(true);
      expect(mockFs.access).toHaveBeenCalledWith(path);
    });

    it('should return false when file does not exist', async () => {
      const path = '/test/file.txt';
      mockFs.access.mockRejectedValue({ code: 'ENOENT' });
      const result = await exists(path);
      expect(result).toBe(false);
      expect(mockFs.access).toHaveBeenCalledWith(path);
    });

    it('should handle permission errors', async () => {
      const path = '/test/file.txt';
      mockFs.access.mockRejectedValue(new Error('EACCES'));
      await expect(exists(path)).rejects.toThrow('EACCES');
    });

    testCases.invalidPaths.forEach(({ path, description }) => {
      it(`should handle ${description}`, async () => {
        await expect(exists(path)).rejects.toThrow();
      });
    });

    testCases.specialChars.forEach(({ path, description }) => {
      it(`should handle ${description}`, async () => {
        mockFs.access.mockResolvedValue(undefined);
        const result = await exists(path);
        expect(result).toBe(true);
        expect(mockFs.access).toHaveBeenCalledWith(path);
      });
    });
  });

  describe('copyFile', () => {
    it('should copy file to destination', async () => {
      const src = '/test/src.txt';
      const dest = '/test/dest.txt';
      const destDir = '/test';

      await copyFile(src, dest);

      expect(mockFs.mkdir).toHaveBeenCalledWith(destDir, { recursive: true });
      expect(mockFs.copyFile).toHaveBeenCalledWith(src, dest);
    });
  });

  describe('copyDir', () => {
    it('should copy directory with files', async () => {
      const srcPath = '/source';
      const destPath = '/target';
      const srcFile = '/source/file.txt';
      const destFile = '/target/file.txt';
      mockFs.readdir.mockResolvedValue(['file.txt']);
      mockFs.stat.mockResolvedValue({ isDirectory: () => false } as Stats);
      await copyDir(srcPath, destPath);
      expect(mockFs.mkdir).toHaveBeenCalledWith(destPath, { recursive: true });
      expect(mockFs.copyFile).toHaveBeenCalledWith(srcFile, destFile);
    });

    it('should respect ignore patterns', async () => {
      const srcPath = '/source';
      const destPath = '/target';
      const srcFile = '/source/file1.txt';
      const destFile = '/target/file1.txt';
      mockFs.readdir.mockResolvedValue(['file1.txt', 'file2.txt']);
      mockFs.stat.mockResolvedValue({ isDirectory: () => false } as Stats);
      await copyDir(srcPath, destPath, { ignore: ['file2.txt'] });
      expect(mockFs.mkdir).toHaveBeenCalledWith(destPath, { recursive: true });
      expect(mockFs.copyFile).toHaveBeenCalledWith(srcFile, destFile);
    });
  });

  describe('readFile', () => {
    it('should read file content', async () => {
      const path = '/test/file.txt';
      mockFs.readFile.mockResolvedValue('test content');
      const content = await readFile(path);
      expect(content).toBe('test content');
      expect(mockFs.readFile).toHaveBeenCalledWith(path, 'utf-8');
    });
  });

  describe('writeFile', () => {
    it('should write content to file', async () => {
      const path = '/test/file.txt';
      const parentDir = '/test';

      await writeFile(path, 'test content');

      expect(mockFs.mkdir).toHaveBeenCalledWith(parentDir, { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith(path, 'test content', 'utf-8');
    });
  });

  describe('remove', () => {
    it('should remove file', async () => {
      const path = '/test/file.txt';
      mockFs.stat.mockResolvedValue({ isDirectory: () => false } as Stats);

      await remove(path);

      expect(mockFs.unlink).toHaveBeenCalledWith(path);
    });

    it('should remove directory', async () => {
      const path = '/test/dir';
      mockFs.stat.mockResolvedValue({ isDirectory: () => true } as Stats);

      await remove(path);

      expect(mockFs.rm).toHaveBeenCalledWith(path, { recursive: true, force: true });
    });
  });
});
