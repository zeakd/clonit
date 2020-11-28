import fs from 'fs-extra';

function clean(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rm(path, { 
      force: true,
      recursive: true,
    }, (error) => {
      if (error) reject(error);
      resolve();
    });
  });
}

export default clean;
