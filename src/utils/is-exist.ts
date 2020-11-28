import fs from 'fs';

function isExist(path: string): boolean {
  return fs.existsSync(path) && fs.readdirSync(path).length !== 0;
}

export { isExist };
