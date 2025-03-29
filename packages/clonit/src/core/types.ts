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
  cwd?:       string;
}

/**
 * Context interface for clonit
 */
export interface ClonitContext {
  /** Temporary directory path */
  readonly tempDir: string;

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
    transform: (oldContent: string) => string | Promise<string>
  ): Promise<void>;

  /**
   * Update content of a JSON file
   * @param relPath Path of JSON file to update
   * @param transform Function to transform JSON object
   */
  updateJson(
    relPath: string,
    transform: (jsonObj: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>
  ): Promise<void>;

  /**
   * Copy temporary folder contents to final target folder
   */
  out(): Promise<void>;
}
