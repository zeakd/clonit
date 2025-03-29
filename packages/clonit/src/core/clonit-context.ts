import * as path                                               from 'node:path';

import { readFile, writeFile, copyDir, remove, rename }        from '../utils/fs.js';

import type { ClonitContext as IClonitContext, ClonitOptions } from './types.js';

/**
 * Clonit context class
 */
export class ClonitContext implements IClonitContext {
  /** Temporary directory path */
  readonly tempDir:         string;
  private readonly options: Required<ClonitOptions>;

  constructor(tempDir: string, options: ClonitOptions = {}) {
    if (!tempDir) {
      throw new Error('Temporary directory path is required');
    }
    this.tempDir = tempDir;
    this.options = {
      ignore:         options.ignore || [],
      keepTemp:       options.keepTemp || false,
      forceOverwrite: options.forceOverwrite || false,
      cwd:            options.cwd || process.cwd(),
    };
  }

  /**
   * Delete temporary directory
   */
  async cleanup(): Promise<void> {
    await remove(this.tempDir);
  }

  /**
   * Convert relative path to absolute path based on tempDir
   */
  private resolvePath(relPath: string): string {
    return path.resolve(this.tempDir, relPath);
  }

  /**
   * Rename file or directory in temporary folder
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const oldAbsPath = this.resolvePath(oldPath);
    const newAbsPath = this.resolvePath(newPath);
    await rename(oldAbsPath, newAbsPath);
  }

  /**
   * Update content of a text file
   */
  async update(
    relPath: string,
    transform: (oldContent: string) => string | Promise<string>,
  ): Promise<void> {
    const absPath = this.resolvePath(relPath);
    const content = await readFile(absPath);
    const newContent = await transform(content);
    await writeFile(absPath, newContent);
  }

  /**
   * Update content of a JSON file
   */
  async updateJson(
    relPath: string,
    transform: (jsonObj: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>,
  ): Promise<void> {
    const absPath = this.resolvePath(relPath);
    const content = await readFile(absPath);
    const jsonObj = JSON.parse(content);
    const newJsonObj = await transform(jsonObj);
    await writeFile(absPath, JSON.stringify(newJsonObj, null, 2));
  }

  /**
   * Copy temporary folder contents to final target folder
   */
  async out(targetPath: string): Promise<void> {
    await copyDir(this.tempDir, targetPath, { ignore: this.options.ignore });

    if (!this.options.keepTemp) {
      await remove(this.tempDir);
    }
  }
}
