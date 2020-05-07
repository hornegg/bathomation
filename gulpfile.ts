import { spawn } from 'child_process';
import * as fs from 'fs';

import * as gulp from 'gulp';

const runChangedScript = (src: string, dest: string, args: string[]): void => {

  let ignoreInitial = false;

  if (fs.existsSync(dest)) {
    const srcStat = fs.statSync(src);
    const destStat = fs.statSync(dest);

    ignoreInitial = destStat.mtime > srcStat.mtime;
  }

  gulp.watch(src, {ignoreInitial}, (callback): void => {

    const script = spawn('node_modules\\.bin\\ts-node.cmd', [src, dest, ...args]);

    script.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    script.stderr.on('data', (data) => {
      console.log(data.toString());
    });

    script.on('close', (code) => {
      callback(code ?  new Error('Script return code non-zero') : undefined);
    });

  });

};

const defaultTask = (): void => {

  runChangedScript('model/headGeometry.ts', 'dist/headGeometry.json', ['false']);
  runChangedScript('model/headGeometry.ts', 'dist/outlineHeadGeometry.json', ['true']);

};

export default defaultTask;

