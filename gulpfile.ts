import * as fs from 'fs/promises';

import * as gulp from 'gulp';
import * as newer from 'gulp-newer';
import * as run from 'gulp-run';
import * as noop from 'gulp-noop';

interface CommonParams {
  displayName: string;
  src: string;
  dest: string;
  extra: string[];
}

interface WatchRunNewerParams extends CommonParams {
  cmd: string;
}

const watchRunNewer = (params: WatchRunNewerParams): void => {

  const task = () =>

    Promise.all(
      params.extra.map(filename => fs.stat(filename))
    ).then(() => 
      gulp.src(params.src).pipe(
        newer(params).pipe(
          run(params.cmd).exec()
        ).pipe(
          noop()
        )
      )
    ).catch(
      () => noop()
    );

  task.displayName = params.displayName;

  gulp.watch([params.src, ...params.extra], {ignoreInitial: false}, task);
  
};

interface WatchRunScriptNewerParams extends CommonParams {
  args: string[];
}

const watchRunScriptNewer = (params: WatchRunScriptNewerParams) => {
  watchRunNewer({
    ...params,
    cmd: `node_modules\\.bin\\ts-node.cmd ${params.src} ${params.dest} ${params.args.join(' ')}`
  });
};

const defaultTask = (): void => {

  // fire hues

  watchRunScriptNewer({
    displayName: 'changeHues',
    src: 'processing/changeHues.ts',
    dest: 'dist/redFire.png',
    args: [],
    extra: [
      'src/THREE.Fire/Fire.png',
      'processing/p5Headless.ts'
    ]
  });

  // head

  watchRunScriptNewer({
    displayName: 'headGeometry',
    src: 'model/headGeometry.ts',
    dest: 'dist/headGeometry.json',
    args: ['false'],
    extra: [
      'model/commonGeometry.ts'
    ]
  });

  watchRunScriptNewer({
    displayName: 'outlineHeadGeometry',
    src: 'model/headGeometry.ts',
    dest: 'dist/outlineHeadGeometry.json',
    args: ['true'],
    extra: [
      'model/commonGeometry.ts'
    ]
  });

  // body

  watchRunScriptNewer({
    displayName: 'bodyGeometry',
    src: 'model/bodyGeometry.ts',
    dest: 'dist/bodyGeometry.json',
    args: ['false'],
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ]
  });

  watchRunScriptNewer({
    displayName: 'outlineBodyGeometry',
    src: 'model/bodyGeometry.ts',
    dest: 'dist/outlineBodyGeometry.json',
    args: ['true'],
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ]
  });

  // left foot

  watchRunScriptNewer({
    displayName: 'leftFootGeometry',
    src: 'model/footGeometry.ts',
    dest: 'dist/leftFootGeometry.json',
    args: ['false', 'true'],
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  watchRunScriptNewer({
    displayName: 'outlineLeftFootGeometry',
    src: 'model/footGeometry.ts',
    dest: 'dist/outlineLeftFootGeometry.json',
    args: ['true', 'true'],
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  // right foot

  watchRunScriptNewer({
    displayName: 'rightFootGeometry',
    src: 'model/footGeometry.ts',
    dest: 'dist/rightFootGeometry.json',
    args: ['false', 'false'],
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });

  watchRunScriptNewer({
    displayName: 'outlineRightFootGeometry',
    src: 'model/footGeometry.ts',
    dest: 'dist/outlineRightFootGeometry.json',
    args: ['true', 'false'],
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ]
  });
};

export default defaultTask;

