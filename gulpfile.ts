import { watchRunScriptNewer } from './gulp/watchRunNewer';

const defaultTask = (callback: () => void): void => {

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

  callback();
};

export default defaultTask;

