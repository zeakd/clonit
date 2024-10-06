import { $ } from 'execa';

export async function getGitRoot() {
  try {
    const { stdout } = await $`git rev-parse --show-toplevel`;
    return stdout;
  }
  catch {
    return process.cwd();
  }
}
