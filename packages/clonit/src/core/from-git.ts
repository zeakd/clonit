import path from 'node:path';

import { execa } from 'execa';

import type { SourceFunction, FromGitOptions } from './types.js';

/**
 * Create a source function that clones from git repository
 */
export function fromGit(repo: string, options: FromGitOptions = {}): SourceFunction {
  return async (tempDir: string): Promise<void> => {
    // Apply default options
    const opts = {
      depth: 1,
      branch: 'main',
      ...options,
    };

    const args = ['git', 'clone'];

    // Handle branch or tag
    if (opts.tag) {
      args.push('-b', opts.tag);
    } else if (opts.branch) {
      args.push('-b', opts.branch);
    }

    // Handle shallow clone
    if (opts.depth !== undefined) {
      args.push('--depth', opts.depth.toString());
    }

    // Handle sparse checkout
    if (opts.sparse && opts.sparse.length > 0) {
      args.push('--filter=blob:none', '--sparse');
    }

    // Add repository and destination
    args.push(repo, tempDir);

    // Execute git clone
    await execa(args[0], args.slice(1));

    // Configure sparse checkout if needed
    if (opts.sparse && opts.sparse.length > 0) {
      // Initialize sparse-checkout
      await execa('git', ['-C', tempDir, 'sparse-checkout', 'init', '--cone']);
      
      // Set sparse-checkout patterns
      await execa('git', ['-C', tempDir, 'sparse-checkout', 'set', ...opts.sparse]);
      
      // Move contents of sparse directory to root
      // We assume only one sparse directory is specified
      const sparseDir = opts.sparse[0];
      const sourcePath = path.join(tempDir, sparseDir);
      
      // Check if the sparse directory exists
      const { copyDir } = await import('../utils/fs.js');
      const fs = await import('node:fs/promises');
      
      try {
        await fs.access(sourcePath);
        
        // Create a temporary directory to hold the contents
        const tempHoldDir = `${tempDir}_temp`;
        await fs.mkdir(tempHoldDir, { recursive: true });
        
        // Move the sparse directory contents to temp hold
        await copyDir(sourcePath, tempHoldDir, { ignore: [] });
        
        // Remove everything in tempDir
        const entries = await fs.readdir(tempDir);
        for (const entry of entries) {
          await fs.rm(path.join(tempDir, entry), { recursive: true, force: true });
        }
        
        // Move contents back from temp hold to tempDir
        const holdEntries = await fs.readdir(tempHoldDir);
        for (const entry of holdEntries) {
          await fs.rename(
            path.join(tempHoldDir, entry),
            path.join(tempDir, entry)
          );
        }
        
        // Clean up temp hold directory
        await fs.rm(tempHoldDir, { recursive: true, force: true });
      } catch (error) {
        // If sparse directory doesn't exist, just continue
        console.warn(`Sparse directory ${sparseDir} not found, using full clone`);
      }
    }

    // Handle specific commit checkout
    if (opts.commit && !opts.tag) {
      await execa('git', ['-C', tempDir, 'checkout', opts.commit]);
    }
  };
}