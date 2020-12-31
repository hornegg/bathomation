import * as path from 'path';
import { promisify } from 'util';
import { exec as execOrig } from 'child_process';

import * as gulp from 'gulp';

import { newer } from './gulp/newer';
import { watchRunScriptNewer } from './gulp/watchRunNewer';
import settings from './src/settings';

const execNoLog = promisify(execOrig);

const exec = (cmd) => {
  console.log(`\n${cmd}`);
  return execNoLog(cmd);
};

const defaultTask = (callback: () => void): void => {
  // fire hues

  watchRunScriptNewer({
    displayName: 'changeHues',
    src: 'processing/changeHues.ts',
    extra: ['src/THREE.Fire/Fire.png', 'processing/p5Headless.ts'],
    dests: [
      'dist/blueFire.png',
      'dist/greenFire.png',
      'dist/yellowFire.png',
      'dist/redFire.png',
    ],
    args: [],
  });

  // head

  watchRunScriptNewer({
    displayName: 'headGeometry',
    src: 'model/headGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/headGeometry.json'],
    args: ['false'],
  });

  watchRunScriptNewer({
    displayName: 'outlineHeadGeometry',
    src: 'model/headGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/outlineHeadGeometry.json'],
    args: ['true'],
  });

  // body

  watchRunScriptNewer({
    displayName: 'bodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineHeadGeometry.json'],
    dests: ['dist/bodyGeometry.json'],
    args: ['false'],
  });

  watchRunScriptNewer({
    displayName: 'outlineBodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineHeadGeometry.json'],
    dests: ['dist/outlineBodyGeometry.json'],
    args: ['true'],
  });

  // left foot

  watchRunScriptNewer({
    displayName: 'leftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/leftFootGeometry.json'],
    args: ['false', 'true'],
  });

  watchRunScriptNewer({
    displayName: 'outlineLeftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/outlineLeftFootGeometry.json'],
    args: ['true', 'true'],
  });

  // right foot

  watchRunScriptNewer({
    displayName: 'rightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/rightFootGeometry.json'],
    args: ['false', 'false'],
  });

  watchRunScriptNewer({
    displayName: 'outlineRightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/outlineRightFootGeometry.json'],
    args: ['true', 'false'],
  });

  // Post processing
  postProcessing();

  callback();
};

const postProcessing = async () => {
  const zipFilename = path.resolve('dist/frames.zip');
  const rawFramesPath = path.resolve('dist/rawFrames');
  const framesParam = path.resolve('dist/rawFrames/f%06d.png');
  const videoPath = path.resolve('dist/baphomation.mp4');
  const ffmpegPath = path.join('node_modules', 'ffmpeg-static', 'ffmpeg');
  const result: boolean = await newer([zipFilename], [videoPath]);

  const task = async () => {
    await exec(`rimraf ${rawFramesPath}/*`);
    await exec(`extract-zip ${zipFilename} ${rawFramesPath}`);
    await exec(
      `${ffmpegPath} -framerate ${settings.fps} -i ${framesParam} ${videoPath}`
    );
  };

  gulp.watch(
    zipFilename,
    { ignoreInitial: !result },
    Object.assign(task, { displayName: 'post processing' })
  );
};

export default defaultTask;
