import createSimpleGit, { SimpleGit } from 'simple-git/promise';
import fs from 'fs-extra';

const git: SimpleGit = createSimpleGit();

async function clone(gitUrl: string, dest: string, branch?: string): Promise<void> {
  await fs.emptyDir(dest);

  const gitOption: { branch?: string } = {};
  if (branch) {
    gitOption['--branch'] = branch;
  }

  await git.clone(gitUrl, dest, gitOption);
  
  return;
}

export default clone;
