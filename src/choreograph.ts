import * as THREE from 'three';

import {
  HALF_PI,
  linearMap,
  segmentedLinearMap3,
  segmentedMap,
  watchTowerLength,
} from './common';
import { MainState } from './mainState';
import { getPointOnPentagon, pentagramCentre } from './pentagram';
import settings from './settings';

export const pentagramLength = (2 * watchTowerLength) / 3;

export const choreographBody = (frame: number): MainState => {
  const midStepLength = linearMap(0.5, 0, 1, pentagramLength, watchTowerLength);

  const cycleFrame = frame % settings.cycleLength;
  const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
  const watchTowerFrame = cycleFrame % watchTowerLength;

  const bodyAngle = segmentedMap(
    watchTowerFrame,
    [pentagramLength, watchTowerLength],
    [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
  );

  const leftFootAngle = segmentedMap(
    watchTowerFrame,
    [pentagramLength, midStepLength],
    [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
  );

  const rightFootAngle = segmentedMap(
    watchTowerFrame,
    [midStepLength, watchTowerLength],
    [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
  );

  const layer = Math.floor(frame / settings.cycleLength) % 3;

  const layerInfo = settings.frameCapture
    ? {
        topFlames: layer === 0,
        baphomet: layer === 1,
        bottomFlames: layer === 2,
      }
    : { topFlames: true, baphomet: true, bottomFlames: true };

  return {
    frame,
    bodyAngle,
    leftFootAngle,
    rightFootAngle,
    layerInfo,
  };
};

const neutralLeft = new THREE.Vector3(100, -400, 0);
const neutralRight = new THREE.Vector3(-100, -400, 0);

export const stillArm = neutralLeft;

export const choreographArm = (watchTowerFrame: number): THREE.Vector3 => {
  const pentagramStart = 0.1 * watchTowerLength;
  const pentagramEnd = 0.4 * watchTowerLength;
  const centreStart = 0.6 * watchTowerLength;
  const centreEnd = 0.7 * watchTowerLength;

  const frameSegments = [
    0,
    ...[0, 1, 2, 3, 4, 5].map((v) =>
      linearMap(v, 0, 5, pentagramStart, pentagramEnd)
    ),
    centreStart,
    centreEnd,
    watchTowerLength,
  ];

  const changeCoords = (pt: THREE.Vector3) => {
    return new THREE.Vector3(pt.z, pt.y, -pt.x);
  };

  const pointAt = segmentedLinearMap3(watchTowerFrame, frameSegments, [
    neutralRight,
    ...[0, 1, 2, 3, 4, 5].map((v) => changeCoords(getPointOnPentagon(v))),
    changeCoords(pentagramCentre),
    changeCoords(pentagramCentre),
    neutralRight,
  ]);

  return pointAt;
};
