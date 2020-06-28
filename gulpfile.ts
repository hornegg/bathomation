import { spawn } from 'child_process';
import * as fs from 'fs';

import * as gulp from 'gulp';

interface RunChangedScriptParams {
  src: string;
  dest: string;
  args: string[];
  additionalDependencies: string[];
}

const runChangedScript = (params: RunChangedScriptParams): void => {

  let ignoreInitial = false;

  if (fs.existsSync(params.dest)) {
    const srcStat = fs.statSync(params.src);
    const destStat = fs.statSync(params.dest);

    ignoreInitial = destStat.mtime > srcStat.mtime;
  }

  const depends = [params.src, ...params.additionalDependencies];

  gulp.watch(depends, {ignoreInitial}, (callback): void => {

    const script = spawn('node_modules\\.bin\\ts-node.cmd', [params.src, params.dest, ...params.args]);

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

  // head

  runChangedScript({
    src: 'model/headGeometry.ts',
    dest: 'dist/headGeometry.json',
    args: ['false'],
    additionalDependencies: [
      'model/commonGeometry.ts'
    ]
  });

  runChangedScript({
    src: 'model/headGeometry.ts',
    dest: 'dist/outlineHeadGeometry.json',
    args: ['true'],
    additionalDependencies: [
      'model/commonGeometry.ts'
    ]
  });

  // body

  runChangedScript({
    src: 'model/bodyGeometry.ts',
    dest: 'dist/bodyGeometry.json',
    args: ['false'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ]
  });

  runChangedScript({
    src: 'model/bodyGeometry.ts',
    dest: 'dist/outlineBodyGeometry.json',
    args: ['true'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ]
  });

  // left foot

  runChangedScript({
    src: 'model/footGeometry.ts',
    dest: 'dist/leftFootGeometry.json',
    args: ['false', 'true'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  runChangedScript({
    src: 'model/footGeometry.ts',
    dest: 'dist/outlineLeftFootGeometry.json',
    args: ['true', 'true'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  // right foot

  runChangedScript({
    src: 'model/footGeometry.ts',
    dest: 'dist/rightFootGeometry.json',
    args: ['false', 'false'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  runChangedScript({
    src: 'model/footGeometry.ts',
    dest: 'dist/outlineRightFootGeometry.json',
    args: ['true', 'false'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

};

export default defaultTask;

