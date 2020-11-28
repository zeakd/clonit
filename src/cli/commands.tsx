import React from 'react';
import { Text } from 'ink';
import { join, resolve } from 'path';
import pkgDir from 'pkg-dir';
import { clean, clone, copy } from '../tasks';
import { isExist } from '../utils/is-exist';
import { makeAbsolute } from '../utils/make-absolute';
import { Options } from './types';
import { Logger } from './logger';

const logger = new Logger();

export async function remote(url: string, dest: string, options: Options): Promise<void> {
  const destPath = makeAbsolute(dest);

  if (!options.force && isExist(destPath)) {
    logger.error(`destination ${destPath} is not empty`);
    process.exit(1);
  }

  const pkgRoot = await pkgDir(__dirname);
  const tmpClonePath = resolve(pkgRoot, 'tmp', new Date().getTime().toString());
  if (options.force) {
    logger.warn('using --force'); 
  }
  
  logger.addTask({ name: 'clone', title: 'clone starter from git repository' });
  logger.addTask({ name: 'copy', title: 'copy source folder' });
  logger.addTask({ name: 'clean', title: 'clean tmp cloned directory' });

  try {
    logger.updateTask('clone', { 
      status: 'pending',
      message: [
        <Text>cloning <Text color='yellow'>{url}</Text> ...</Text>,
        options.branch && <Text>use branch <Text color='yellow'>{options.branch}</Text></Text>,
      ],
    });
    await clone(url, tmpClonePath, options.branch);
    logger.updateTask('clone', { status: 'success' });
  } catch (error) {
    logger.updateTask('clone', { status: 'failure' });
    throw error;
  }

  try {
    logger.updateTask('copy', {
      status: 'pending', 
      message: [
        `copy to ${dest}${dest[dest.length - 1] !== '/' ? '/' : ''}`,
        options.prefix && options.prefix !== '/' && <Text>choose prefix <Text color='yellow'>{options.prefix}</Text> from source</Text>,
      ],
    });
    await copy(join(tmpClonePath, options.prefix), destPath, options);
    logger.updateTask('copy', { status: 'success' });
  } catch (error) {
    logger.updateTask('copy', { status: 'failure' });
    throw error;
  }

  try {
    logger.updateTask('clean', { status: 'pending' });
    await clean(tmpClonePath);
    logger.updateTask('clean', { status: 'success' });
  } catch (error) {
    logger.updateTask('clean', { status: 'failure' });
    throw error;
  }
}

export async function local(src: string, dest: string, options: Options): Promise<void> {
  const srcPath = makeAbsolute(src);
  const destPath = makeAbsolute(dest);

  if (!options.force && isExist(destPath)) {
    logger.error(`destination ${destPath} is not empty`);
    process.exit(1);
  }

  if (!isExist(srcPath)) {
    logger.error(`source ${srcPath} does not exist`);
    process.exit(1);
  }

  if (options.force) {
    logger.warn('using --force'); 
  }

  logger.addTask({ name: 'copy', title: 'copy source folder' });
  try {
    logger.updateTask('copy', {
      status: 'pending', 
      message: [
        `copy to ${dest}${dest[dest.length - 1] !== '/' ? '/' : ''}`,
        options.prefix && options.prefix !== '/' && <Text>choose prefix <Text color='yellow'>{options.prefix}</Text> from source</Text>,
      ],
    });
    
    await copy(join(srcPath, options.prefix), destPath, options);
    logger.updateTask('copy', { status: 'success' });
  } catch (error) {
    logger.updateTask('copy', { status: 'failure' });
    throw error;
  }

  return;
}
