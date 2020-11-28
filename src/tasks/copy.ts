import path from 'path';
import fs from 'fs';
import cpy from 'cpy';
import globby from 'globby';
import ignore from 'ignore';

const defaultOptions = { ignoreSpecs: ['.gitignore'] };

async function copy(src: string, dest: string, options = {}): Promise<void> {
  const { ignoreSpecs: _ignoreSpecs } = { ...defaultOptions, ...options };
  const ignoreSpecs = (Array.isArray(_ignoreSpecs) ? _ignoreSpecs : [_ignoreSpecs]).filter(Boolean);

  const ig = ignore();
  const ignoreFilepaths = await globby(ignoreSpecs.map(ignoreSpec => path.join(src, `**/${ignoreSpec}`)));
  for (const ignoreFilepath of ignoreFilepaths) {
    ig.add(fs.readFileSync(ignoreFilepath).toString());
  }
  
  const allfiles = (await globby([src], { dot: true })).map(filepath => path.relative(src, filepath));
  const filtered = ig.filter(allfiles);

  await cpy([...filtered, '!.git/**/*'], dest, { parents: true, cwd: src });
  return;
}

export default copy;
