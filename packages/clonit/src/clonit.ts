import * as fs              from 'node:fs/promises';
import * as os              from 'node:os';
import * as path            from 'node:path';

import ignore               from 'ignore';
import { glob }             from 'tinyglobby';

import { getGitRoot }       from './get-git-root.js';
import { retriveParentDir } from './retrive-parent-dir.js';

async function createTmpDir() {
  const dirname = await fs.mkdtemp(path.join(os.tmpdir(), 'clonit-'));

  return dirname;
}

type Options = {
  cwd?: string;
};

export async function create(sourceDir: string, distDir: string, options: Options = {}) {
  const sourceDirpath = path.resolve(sourceDir);

  const tmpDir = await createTmpDir();

  const ignoreFilepaths = await getGitignoreFiles(sourceDir);
  const ignoreFiles = await Promise.all(ignoreFilepaths.map(async (ignoreFilepath) => {
    return (await fs.readFile(ignoreFilepath)).toString();
  }));

  const ig = ignore.default();
  for (const ignoreFile of ignoreFiles) {
    ig.add(ignoreFile);
  }

  const filepaths = await glob(sourceDirpath, { dot: true, cwd: options.cwd });
  console.log(filepaths);
  const filteredFilepaths = ig.filter(filepaths);

  await Promise.all(filteredFilepaths.map(async filepath => fs.copyFile(filepath, path.join(tmpDir, path.relative(sourceDirpath, filepath)))));

  await fs.rename(tmpDir, distDir);

  await fs.rm(tmpDir, { recursive: true, force: true });
}

async function getGitignoreFiles(dir: string) {
  const root = await getGitRoot();
  const gitignoreFiles = [];
  for (const dirpath of retriveParentDir(dir)) {
    const gitignoreFilepath = path.join(dirpath, '.gitignore');

    try {
      await fs.access(gitignoreFilepath);
      gitignoreFiles.push(gitignoreFilepath);
    }
    catch {
      // skip if file does not exist
    }

    if (dirpath === root) {
      break;
    }
  }

  return gitignoreFiles;
}
