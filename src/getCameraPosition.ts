import * as THREE from 'three';
import { HALF_PI, QUARTER_PI, PI } from './common';

const getCameraPosition = (frame: number): THREE.Vector3 => {
  const distance = 5;
  const baseHeight = HALF_PI;
  const baseAngle = PI + QUARTER_PI;

  return new THREE.Vector3().setFromSphericalCoords(
    distance,
    baseHeight,
    baseAngle
  );
};

export default getCameraPosition;
