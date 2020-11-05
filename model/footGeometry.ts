import * as fs from 'fs';
import * as THREE from 'three';
import * as bspConstructor from 'three-js-csg';

import { createEllipsoid } from './commonGeometry';

const ThreeBSP = bspConstructor(THREE);

const outfilename = process.argv[2];
const outline = (process.argv[3] === 'true');
const left = (process.argv[4] === 'true');

const scalar = outline ? 0.07 : 0;

const radius = 0.25;
const floorLevel = -3.1;

const footEllipsoid = createEllipsoid(radius, radius, radius, scalar);
const footCenterX = left ? -1 : 1;

footEllipsoid.translate(
  footCenterX,
  floorLevel,
  0
);

const footEllipsoidBsp = new ThreeBSP(footEllipsoid);

const floorBox = new THREE.BoxGeometry(2, radius, 2);
floorBox.translate(footCenterX, floorLevel + (0.5 * radius), 0);
const floorBoxBsp = new ThreeBSP(floorBox);

const foot: THREE.Geometry = footEllipsoidBsp
.subtract(floorBoxBsp)
.toGeometry();

fs.writeFileSync(
  outfilename,
  JSON.stringify(
    (new THREE.BufferGeometry()).fromGeometry(foot).toJSON(),
    null,
    2
  )
);

