/**
 * Function type for source providers
 * @param tempDir - Temporary directory path where source should be copied
 * @returns Promise that resolves when source is ready
 */
export type SourceFunction = (tempDir: string) => Promise<void>;

/**
 * Transform function result type
 * Supports synchronous and asynchronous transformations
 * @template T - Type of the value being transformed
 */
export type TransformResult<T> = T | undefined | Promise<T | undefined>;

/**
 * Options for fromFS function
 */
export interface FromFSOptions {
  /** File/folder patterns to ignore when copying (glob) */
  ignore?: string[];
}

/**
 * Options for fromGit function
 */
export interface FromGitOptions {
  /** Branch to clone */
  branch?: string;
  /** Tag to clone */
  tag?:    string;
  /** Specific commit to checkout after clone */
  commit?: string;
  /** Clone depth for shallow clones */
  depth?:  number;
  /** Sparse checkout patterns */
  sparse?: string[];
}

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
  /** Whether to simulate file system operations without actual changes (default: false) */
  dryRun?:    boolean;
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
   * Read content of a file from temporary folder
   * @param relPath Path of file to read
   * @returns Content of the file
   */
  read(relPath: string): Promise<string>;

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
    transform: (oldContent: string) => TransformResult<string>
  ): Promise<void>;

  /**
   * Update content of a JSON file
   * @param relPath Path of JSON file to update
   * @param transform Function to transform JSON object
   */
  updateJson<T extends Record<string, unknown> = Record<string, unknown>>(
    relPath: string,
    transform: (jsonObj: T) => TransformResult<T>
  ): Promise<void>;

  /**
   * Copy temporary folder contents to final target folder
   * @param targetDir Target directory path
   */
  out(targetDir: string): Promise<void>;

  /**
   * Resolve relative path to absolute path based on cwd (tempDir)
   * @param relPath Relative path to resolve
   * @returns Absolute path
   */
  resolve(relPath: string): string;
}
