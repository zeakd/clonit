import * as fs                                  from 'node:fs/promises';
import * as os                                  from 'node:os';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createTempDir }                        from './temp.js';

vi.mock('node:fs/promises');
vi.mock('node:os');

describe('temp utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createTempDir', () => {
    it('should create a temporary directory with random name', async () => {
      const tempPath = '/tmp/clonit-abc123';
      vi.mocked(os.tmpdir).mockReturnValue('/tmp');
      vi.mocked(fs.mkdtemp).mockResolvedValue(tempPath);

      const result = await createTempDir();

      expect(os.tmpdir).toHaveBeenCalled();
      expect(fs.mkdtemp).toHaveBeenCalledWith('/tmp/clonit-');
      expect(result).toBe(tempPath);
    });

    it('should create a temporary directory with custom prefix', async () => {
      const tempPath = '/tmp/custom-abc123';
      vi.mocked(os.tmpdir).mockReturnValue('/tmp');
      vi.mocked(fs.mkdtemp).mockResolvedValue(tempPath);

      const result = await createTempDir('custom-');

      expect(os.tmpdir).toHaveBeenCalled();
      expect(fs.mkdtemp).toHaveBeenCalledWith('/tmp/custom-');
      expect(result).toBe(tempPath);
    });

    it('should handle empty prefix', async () => {
      const tempPath = '/tmp/abc123';
      vi.mocked(os.tmpdir).mockReturnValue('/tmp');
      vi.mocked(fs.mkdtemp).mockResolvedValue(tempPath);

      const result = await createTempDir('');

      expect(os.tmpdir).toHaveBeenCalled();
      expect(fs.mkdtemp).toHaveBeenCalledWith('/tmp');
      expect(result).toBe(tempPath);
    });

    it('should handle filesystem errors', async () => {
      vi.mocked(os.tmpdir).mockReturnValue('/tmp');
      vi.mocked(fs.mkdtemp).mockRejectedValue(new Error('EACCES'));

      await expect(createTempDir()).rejects.toThrow('EACCES');
    });
  });
});
