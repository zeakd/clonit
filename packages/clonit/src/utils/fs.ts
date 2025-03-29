import * as fs     from 'node:fs/promises';
import { dirname } from 'node:path';

export interface FsOptions {
  ignore?: string[];
}

/**
 * Check if file or directory exists
 */
export async function exists(path: string): Promise<boolean> {
  if (!path || path.trim() === '') {
    throw new Error('Path cannot be empty');
  }

  try {
    await fs.access(path);
    return true;
  }
  catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

/**
 * Copy file
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  const destDir = dirname(dest);
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(src, dest);
}

/**
 * Copy directory recursively
 */
export async function copyDir(src: string, dest: string, options: { ignore?: string[] } = {}): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src);

  for (const entry of entries) {
    const srcPath = `${src}/${entry}`;
    const destPath = `${dest}/${entry}`;

    if (options.ignore?.some(pattern => entry === pattern)) {
      continue;
    }

    try {
      const stat = await fs.stat(srcPath);
      if (stat.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await copyDir(srcPath, destPath, options);
      }
      else {
        await copyFile(srcPath, destPath);
      }
    }
    catch (error) {
      if ((error as { code?: string }).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

/**
 * Read file content and return as string
 */
export async function readFile(path: string): Promise<string> {
  return fs.readFile(path, 'utf-8');
}

/**
 * Write string to file
 */
export async function writeFile(path: string, content: string): Promise<void> {
  const parentDir = dirname(path);
  await fs.mkdir(parentDir, { recursive: true });
  await fs.writeFile(path, content, 'utf-8');
}

/**
 * Remove file or directory
 */
export async function remove(path: string): Promise<void> {
  const stat = await fs.stat(path);
  if (stat.isDirectory()) {
    await fs.rm(path, { recursive: true, force: true });
  }
  else {
    await fs.unlink(path);
  }
}

/**
 * Rename file or directory
 */
export async function rename(oldPath: string, newPath: string): Promise<void> {
  await fs.rename(oldPath, newPath);
}

/**
 * Check if directory is empty
 */
export async function isEmptyDir(dir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dir);
    return entries.length === 0;
  }
  catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') {
      return true;
    }
    throw error;
  }
}
