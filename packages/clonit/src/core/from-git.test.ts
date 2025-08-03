import { execa }                                from 'execa';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { fromGit }                              from './from-git.js';

vi.mock('execa');

describe('fromGit', () => {
  const repo = 'https://github.com/user/repo.git';
  const tempDir = '/temp/clonit-test';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(execa).mockImplementation(() => ({
      stdout:   '',
      stderr:   '',
      exitCode: 0,
    } as unknown as ReturnType<typeof execa>));
  });

  it('should return a function', () => {
    const sourceFunction = fromGit(repo);
    expect(typeof sourceFunction).toBe('function');
  });

  it('should clone repository to temp directory with default options', async () => {
    const sourceFunction = fromGit(repo);
    await sourceFunction(tempDir);

    expect(execa).toHaveBeenCalledWith('git', [
      'clone',
      '-b',
      'main',
      '--depth',
      '1',
      repo,
      tempDir,
    ]);
  });

  it('should respect branch option', async () => {
    const sourceFunction = fromGit(repo, { branch: 'develop' });
    await sourceFunction(tempDir);

    expect(execa).toHaveBeenCalledWith('git', [
      'clone',
      '-b',
      'develop',
      '--depth',
      '1',
      repo,
      tempDir,
    ]);
  });

  it('should respect depth option', async () => {
    const sourceFunction = fromGit(repo, { depth: 3 });
    await sourceFunction(tempDir);

    expect(execa).toHaveBeenCalledWith('git', [
      'clone',
      '-b',
      'main',
      '--depth',
      '3',
      repo,
      tempDir,
    ]);
  });

  it('should respect tag option', async () => {
    const sourceFunction = fromGit(repo, { tag: 'v1.0.0' });
    await sourceFunction(tempDir);

    expect(execa).toHaveBeenCalledWith('git', [
      'clone',
      '-b',
      'v1.0.0',
      '--depth',
      '1',
      repo,
      tempDir,
    ]);
  });

  it('should handle multiple options', async () => {
    const sourceFunction = fromGit(repo, { branch: 'develop', depth: 5 });
    await sourceFunction(tempDir);

    expect(execa).toHaveBeenCalledWith('git', [
      'clone',
      '-b',
      'develop',
      '--depth',
      '5',
      repo,
      tempDir,
    ]);
  });

  it('should handle local repository path', async () => {
    const localRepo = '/path/to/local/repo';
    const sourceFunction = fromGit(localRepo);
    await sourceFunction(tempDir);

    expect(execa).toHaveBeenCalledWith('git', [
      'clone',
      '-b',
      'main',
      '--depth',
      '1',
      localRepo,
      tempDir,
    ]);
  });

  it('should throw error on clone failure', async () => {
    vi.mocked(execa).mockRejectedValue(new Error('Clone failed'));

    const sourceFunction = fromGit(repo);
    await expect(sourceFunction(tempDir)).rejects.toThrow('Clone failed');
  });

  it('should handle sparse checkout option', async () => {
    const sourceFunction = fromGit(repo, { sparse: ['packages/create-vite/template-react-ts'] });
    await sourceFunction(tempDir);

    // Should include sparse checkout flags in clone command
    expect(execa).toHaveBeenNthCalledWith(1, 'git', [
      'clone',
      '-b',
      'main',
      '--depth',
      '1',
      '--filter=blob:none',
      '--sparse',
      repo,
      tempDir,
    ]);

    // Should initialize sparse-checkout
    expect(execa).toHaveBeenNthCalledWith(2, 'git', [
      '-C',
      tempDir,
      'sparse-checkout',
      'init',
      '--cone',
    ]);

    // Should set sparse-checkout patterns
    expect(execa).toHaveBeenNthCalledWith(3, 'git', [
      '-C',
      tempDir,
      'sparse-checkout',
      'set',
      'packages/create-vite/template-react-ts',
    ]);
  });
});
