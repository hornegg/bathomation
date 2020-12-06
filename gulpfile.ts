import * as fs from 'fs/promises';

import * as gulp from 'gulp';
import * as run from 'gulp-run';
import * as noop from 'gulp-noop';

// mtimePromise - returns the last time the file was modified if it can get it, or null if the file is missing or otherwise inaccessible
const mtimePromise = (filename: string): Promise<number | null> => 
  fs.stat(filename).then(stat => stat.mtime.valueOf()).catch(() => null);

const createMtimeReducer = (fn) => {
  return (acc, mtime): number | null =>
    (acc === null || mtime === null)
      ? null
      : fn(acc, mtime);
};

// newer - returns true if at least one of the source files is newer than at least one of the destination files
const newer = async (srcs: string[], dests: string[]): Promise<boolean> => {

  const [srcsMtime, destsMtime] = await Promise.all([
    Promise.all(
      srcs.map(mtimePromise)
    ),
    Promise.all(
      dests.map(mtimePromise)
    )
  ]);

  const srcMtime = srcsMtime.reduce(createMtimeReducer(Math.max), 0);
  const destMtime = destsMtime.reduce(createMtimeReducer(Math.min), Number.MAX_SAFE_INTEGER);
  if (srcMtime !== null) {
    if (destMtime === null || srcMtime >= destMtime) {
      return true;
    }
  }

  return false;
};

interface CommonParams {
  displayName: string;
  src: string;
  dests: string[];
  extra: string[];
}

interface WatchRunNewerParams extends CommonParams {
  cmd: string;
}

const watchRunNewer = async (params: WatchRunNewerParams): Promise<void> => {

  const srcs = [params.src, ...params.extra];

  const result: boolean = await newer(srcs, params.dests);

  const task = () =>
    run(params.cmd).exec().pipe(
        noop()
    );

  task.displayName = params.displayName;

  gulp.watch([params.src, ...params.extra], {ignoreInitial: !result}, task);
  
};

interface WatchRunScriptNewerParams extends CommonParams {
  args: string[];
}

const watchRunScriptNewer = (params: WatchRunScriptNewerParams) => {
  watchRunNewer({
    ...params,
    cmd: `node_modules\\.bin\\ts-node.cmd ${params.src} ${[...params.dests, ...params.args].join(' ')}`
  });
};

const defaultTask = (): void => {

  // fire hues

  watchRunScriptNewer({
    displayName: 'changeHues',
    src: 'processing/changeHues.ts',
    extra: [
      'src/THREE.Fire/Fire.png',
      'processing/p5Headless.ts'
    ],
    dests: [
      'dist/blueFire.png',
      'dist/greenFire.png',
      'dist/yellowFire.png',
      'dist/redFire.png'
    ],
    args: []
  });

  // head

  watchRunScriptNewer({
    displayName: 'headGeometry',
    src: 'model/headGeometry.ts',
    extra: [
      'model/commonGeometry.ts'
    ],
    dests: ['dist/headGeometry.json'],
    args: ['false']
  });

  watchRunScriptNewer({
    displayName: 'outlineHeadGeometry',
    src: 'model/headGeometry.ts',
    extra: [
      'model/commonGeometry.ts'
    ],
    dests: ['dist/outlineHeadGeometry.json'],
    args: ['true']
  });

  // body

  watchRunScriptNewer({
    displayName: 'bodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ],
    dests: ['dist/bodyGeometry.json'],
    args: ['false']
  });

  watchRunScriptNewer({
    displayName: 'outlineBodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json'
    ],
    dests: ['dist/outlineBodyGeometry.json'],
    args: ['true']
  });

  // left foot

  watchRunScriptNewer({
    displayName: 'leftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ],
    dests: ['dist/leftFootGeometry.json'],
    args: ['false', 'true']
  });

  watchRunScriptNewer({
    displayName: 'outlineLeftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ],
    dests: ['dist/outlineLeftFootGeometry.json'],
    args: ['true', 'true']
  });

  // right foot

  watchRunScriptNewer({
    displayName: 'rightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ],
    dests: ['dist/rightFootGeometry.json'],
    args: ['false', 'false']
  });

  watchRunScriptNewer({
    displayName: 'outlineRightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineBodyGeometry.json'
    ],
    dests: ['dist/outlineRightFootGeometry.json'],
    args: ['true', 'false']
  });
};

export default defaultTask;

