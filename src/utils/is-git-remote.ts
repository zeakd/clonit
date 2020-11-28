import isSsh from 'is-ssh';
import { URL } from 'url';

function isGitRemote(str: string): boolean {
  return isSsh(str) || isUrl(str);
}


function isUrl(str: string) {
  try {
    new URL(str);
    return true;
  } catch (error) {
    return false;
  }
}

export { isGitRemote };
