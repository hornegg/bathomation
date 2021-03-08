import { HALF_PI, linearMap, segmentedMap, watchTowerLength } from './common';
import { MainState } from './mainState';
import settings from './settings';

export const pentagramLength = (2 * watchTowerLength) / 3;

export const choreograph = (frame: number): MainState => {
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
