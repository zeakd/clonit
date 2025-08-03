import * as fs                                from 'node:fs/promises';
import * as path                              from 'node:path';
import { fileURLToPath }                      from 'node:url';

import { execa }                              from 'execa';
import ignore                                 from 'ignore';

import { copyDir }                            from '../utils/fs.js';

import type { SourceFunction, FromFSOptions } from './types.js';

/**
 * Generator that traverses parent directories
 */
function* retrieveParentDir(fromDir: string) {
  const fromDirpath = path.resolve(fromDir);
  let currentDir = fromDirpath;

  while (true) {
    yield currentDir;

    const parentDir = path.dirname(currentDir);
    if (currentDir === '/') {
      break;
    }

    currentDir = parentDir;
  }
}

/**
 * Get git repository root
 */
async function getGitRoot(): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['rev-parse', '--show-toplevel']);
    return stdout;
  }
  catch {
    return null;
  }
}

/**
 * Get all .gitignore files from source directory up to git root
 */
async function getGitignoreFiles(dir: string): Promise<string[]> {
  const gitRoot = await getGitRoot();
  const gitignoreFiles: string[] = [];

  for (const dirpath of retrieveParentDir(dir)) {
    const gitignoreFilepath = path.join(dirpath, '.gitignore');

    try {
      await fs.access(gitignoreFilepath);
      gitignoreFiles.push(gitignoreFilepath);
    }
    catch {
      // Skip if file does not exist
    }

    if (gitRoot && dirpath === gitRoot) {
      break;
    }
  }

  return gitignoreFiles;
}

/**
 * Create a source function that copies from file system
 */
export function fromFS(source: string, options: FromFSOptions = {}): SourceFunction {
  return async (tempDir: string): Promise<void> => {
    // Handle file:// URLs
    const sourcePath = source.startsWith('file://')
      ? fileURLToPath(source)
      : source;

    // If no explicit ignore patterns provided, use .gitignore files
    if (!options.ignore || options.ignore.length === 0) {
      const gitignoreFiles = await getGitignoreFiles(sourcePath);

      if (gitignoreFiles.length > 0) {
        // Create ignore instance and add patterns from all .gitignore files
        const ig = ignore.default();

        for (const ignoreFile of gitignoreFiles) {
          const content = await fs.readFile(ignoreFile, 'utf-8');
          ig.add(content);
        }

        // Get all files and filter with ignore patterns
        const allFiles: string[] = [];
        const walkDir = async (dir: string, baseDir: string) => {
          const entries = await fs.readdir(dir);

          for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const relativePath = path.relative(baseDir, fullPath);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
              await walkDir(fullPath, baseDir);
            }
            else {
              allFiles.push(relativePath);
            }
          }
        };

        await walkDir(sourcePath, sourcePath);
        const filteredFiles = ig.filter(allFiles);

        // Copy only non-ignored files
        await fs.mkdir(tempDir, { recursive: true });
        for (const file of filteredFiles) {
          const srcPath = path.join(sourcePath, file);
          const destPath = path.join(tempDir, file);
          const destDir = path.dirname(destPath);

          await fs.mkdir(destDir, { recursive: true });
          await fs.copyFile(srcPath, destPath);
        }

        return;
      }
    }

    // Fallback to simple copy with ignore patterns
    await copyDir(sourcePath, tempDir, { ignore: options.ignore || [] });
  };
}
