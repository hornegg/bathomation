import { spawn } from 'child_process';
import * as fs from 'fs';

import * as gulp from 'gulp';

interface RunChangedScriptParams {
  displayName: string;
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

  const task = (callback): void => {

    // Ensure that dependencies have been built

    const missing = params.additionalDependencies.reduce((acc, dependency) => {
      return acc ? acc : !fs.existsSync(dependency);
    }, false);
  
    if (missing) {
      // Just something that has not been built yet, probably not an error on its own
      callback();
      return; 
    }

    // Run script

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

  }; 

  task.displayName = params.displayName;

  gulp.watch(depends, {ignoreInitial}, task);
  
};

const defaultTask = (): void => {

  // fire hues

  runChangedScript({
    displayName: 'changeHues',
    src: 'processing/changeHues.ts',
    dest: 'dist/redFire.png',
    args: [],
    additionalDependencies: [
      'src/THREE.Fire/Fire.png',
      'processing/createHeadlessP5.ts'
    ]
  });

  // head

  runChangedScript({
    displayName: 'headGeometry',
    src: 'model/headGeometry.ts',
    dest: 'dist/headGeometry.json',
    args: ['false'],
    additionalDependencies: [
      'model/commonGeometry.ts'
    ]
  });

  runChangedScript({
    displayName: 'outlineHeadGeometry',
    src: 'model/headGeometry.ts',
    dest: 'dist/outlineHeadGeometry.json',
    args: ['true'],
    additionalDependencies: [
      'model/commonGeometry.ts'
    ]
  });

  // body

  runChangedScript({
    displayName: 'bodyGeometry',
    src: 'model/bodyGeometry.ts',
    dest: 'dist/bodyGeometry.json',
    args: ['false'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ]
  });

  runChangedScript({
    displayName: 'outlineBodyGeometry',
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
    displayName: 'leftFootGeometry',
    src: 'model/footGeometry.ts',
    dest: 'dist/leftFootGeometry.json',
    args: ['false', 'true'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  runChangedScript({
    displayName: 'outlineLeftFootGeometry',
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
    displayName: 'rightFootGeometry',
    src: 'model/footGeometry.ts',
    dest: 'dist/rightFootGeometry.json',
    args: ['false', 'false'],
    additionalDependencies: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  runChangedScript({
    displayName: 'outlineRightFootGeometry',
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

