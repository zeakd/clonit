/**
 * Basic options interface for clonit
 */
export interface ClonitOptions {
  /** File/folder patterns to ignore when copying (glob) */
  ignore?:    string[];
  /** Whether to keep temporary folder after out() (default: false=delete) */
  keepTemp?:  boolean;
  /** Whether to overwrite target folder even if not empty (default: false=error) */
  overwrite?: boolean;
  /** Current working directory for resolving target path (default: process.cwd()) */
  cwd?:       string;
}

/**
 * Context interface for clonit
 */
export interface ClonitContext {
  /** Temporary directory path */
  readonly tempDir: string;

  /** Current working directory (same as tempDir) */
  readonly cwd: string;

  /**
   * Create a new file or directory in temporary folder
   * @param relPath Path of file/directory to create
   * @param content Content for file (optional, required for files)
   * @param isDirectory Whether to create a directory (default: false)
   */
  create(relPath: string, content?: string, isDirectory?: boolean): Promise<void>;

  /**
   * Delete a file or directory in temporary folder
   * @param relPath Path of file/directory to delete
   */
  delete(relPath: string): Promise<void>;

  /**
   * Rename file or directory in temporary folder
   * @param oldPath Path of file/directory to rename
   * @param newPath New path for file/directory
   */
  rename(oldPath: string, newPath: string): Promise<void>;

  /**
   * Update content of a text file
   * @param relPath Path of file to update
   * @param transform Function to transform file content
   */
  update(
    relPath: string,
    transform: (oldContent: string) => string | Promise<string> | undefined | Promise<undefined>
  ): Promise<void>;

  /**
   * Update content of a JSON file
   * @param relPath Path of JSON file to update
   * @param transform Function to transform JSON object
   */
  updateJson(
    relPath: string,
    transform: (jsonObj: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>> | undefined | Promise<undefined>
  ): Promise<void>;

  /**
   * Copy temporary folder contents to final target folder
   */
  out(): Promise<void>;

  /**
   * Resolve relative path to absolute path based on cwd (tempDir)
   * @param relPath Relative path to resolve
   * @returns Absolute path
   */
  resolve(relPath: string): string;
}
