import * as path                                                           from 'node:path';

import { readFile, writeFile, copyDir, remove, rename, isEmptyDir, mkdir } from '../utils/fs.js';

import type { ClonitContext as IClonitContext, ClonitOptions }             from './types.js';

/**
 * Clonit context class
 */
export class ClonitContext implements IClonitContext {
  /** Temporary directory path */
  readonly tempDir:         string;
  /** Current working directory (same as tempDir) */
  readonly cwd:             string;
  private readonly options: Required<ClonitOptions>;

  constructor(tempDir: string, options: ClonitOptions = {}) {
    if (!tempDir) {
      throw new Error('Temporary directory path is required');
    }
    this.tempDir = tempDir;
    this.cwd = tempDir;
    this.options = {
      ignore:    options.ignore || [],
      keepTemp:  options.keepTemp || false,
      overwrite: options.overwrite || false,
      cwd:       options.cwd || process.cwd(),
      dryRun:    options.dryRun || false,
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
    const absPath = path.resolve(this.tempDir, relPath);
    const normalizedAbsPath = path.normalize(absPath);
    const normalizedTempDir = path.normalize(this.tempDir);

    if (!normalizedAbsPath.startsWith(normalizedTempDir)) {
      throw new Error(`Path "${relPath}" is outside of temporary directory`);
    }

    return absPath;
  }

  /**
   * Resolve relative path to absolute path based on cwd
   */
  resolve(relPath: string): string {
    return path.resolve(this.cwd, relPath);
  }

  /**
   * Read content of a file from temporary folder
   */
  async read(relPath: string): Promise<string> {
    const absPath = this.resolvePath(relPath);
    return readFile(absPath);
  }

  /**
   * Create a new file or directory in temporary folder
   */
  async create(relPath: string, content?: string, isDirectory: boolean = false): Promise<void> {
    const absPath = this.resolvePath(relPath);

    if (this.options.dryRun) {
      return;
    }

    if (isDirectory) {
      await mkdir(absPath, { recursive: true });
    }
    else {
      if (content === undefined) {
        throw new Error('Content is required for file creation');
      }
      await writeFile(absPath, content);
    }
  }

  /**
   * Delete a file or directory in temporary folder
   */
  async delete(relPath: string): Promise<void> {
    const absPath = this.resolvePath(relPath);
    if (this.options.dryRun) {
      return;
    }
    await remove(absPath);
  }

  /**
   * Rename file or directory in temporary folder
   */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const oldAbsPath = this.resolvePath(oldPath);
    const newAbsPath = this.resolvePath(newPath);
    if (this.options.dryRun) {
      return;
    }
    await rename(oldAbsPath, newAbsPath);
  }

  /**
   * Update content of a text file
   */
  async update(
    relPath: string,
    transform: (oldContent: string) => string | Promise<string> | undefined | Promise<undefined>,
  ): Promise<void> {
    const absPath = this.resolvePath(relPath);
    const content = await readFile(absPath);
    const newContent = await transform(content);
    if (newContent !== undefined) {
      if (this.options.dryRun) {
        return;
      }
      await writeFile(absPath, newContent);
    }
  }

  /**
   * Update content of a JSON file
   */
  async updateJson(
    relPath: string,
    transform: (jsonObj: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>> | undefined | Promise<undefined>,
  ): Promise<void> {
    const absPath = this.resolvePath(relPath);
    const content = await readFile(absPath);
    const jsonObj = JSON.parse(content);
    const newJsonObj = await transform(jsonObj);
    if (newJsonObj !== undefined) {
      if (this.options.dryRun) {
        return;
      }
      await writeFile(absPath, JSON.stringify(newJsonObj, null, 2));
    }
  }

  /**
   * Copy temporary folder contents to final target folder
   */
  async out(targetDir: string): Promise<void> {
    if (!targetDir) {
      throw new Error('Target directory path is required');
    }
    
    // 타겟 디렉토리가 비어있는지 확인
    const isTargetEmpty = await isEmptyDir(targetDir);
    if (!isTargetEmpty && !this.options.overwrite) {
      throw new Error(`Target directory "${targetDir}" is not empty. Use overwrite option to proceed.`);
    }

    if (this.options.dryRun) {
      return;
    }

    await copyDir(this.tempDir, targetDir, { ignore: this.options.ignore });

    if (!this.options.keepTemp) {
      await remove(this.tempDir);
    }
  }
}
