/* eslint-disable @typescript-eslint/no-var-requires */

import * as fs from 'fs';
import * as THREE from 'three';
const ThreeBSP = require('three-js-csg')(THREE);

const outfilename = process.argv[2];
const outline = (process.argv[3] === 'true');
const bodyFilename = process.argv[4];

console.log('building headGeometry', {outline});

const createSphere = (radius: number): THREE.Geometry => {
  const sphereSegments = 24;
  return new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
};

const createEllipsoid = (x: number, y: number, z: number, scalar: number): THREE.Geometry => {
  return createSphere(1).applyMatrix4(new THREE.Matrix4().makeScale(x + scalar, y + scalar, z + scalar));
};

const scalar = outline ? 0.07 : 0;
const head = createEllipsoid(1.5, 1.0, 1.0, scalar);

// vector between center of head and center of ear
const x = 1.44;
const y = 0.6;
const z = -0.3; 

const leftEar = createEllipsoid(0.4, 0.4, 0.25, scalar);
const rightEar = leftEar.clone();

leftEar.translate(x, y, z);
rightEar.translate(-x, y, z);

const headBsp = new ThreeBSP(head);
const leftEarBsp = new ThreeBSP(leftEar);
const rightEarBsp = new ThreeBSP(rightEar);

const leftIntersect = headBsp.intersect(leftEarBsp);
const rightIntersect = headBsp.intersect(rightEarBsp);

const geometry: THREE.Geometry = headBsp
.union(leftEarBsp)
.union(rightEarBsp)
.subtract(leftIntersect)
.subtract(rightIntersect)
.toGeometry();

fs.writeFileSync(
  outfilename,
  JSON.stringify(
    (new THREE.BufferGeometry()).fromGeometry(geometry).toJSON(),
    null,
    2
  )
);

const bodyEllipsoid = createEllipsoid(0.75, 1.8, 0.5, scalar);
bodyEllipsoid.translate(0, -1.3, 0);
const bodyEllipsoidBsp = new ThreeBSP(bodyEllipsoid);

const headBox = new THREE.BoxGeometry(2, 2, 2);
headBox.translate(0, 1.5, 0);
const headBoxBsp = new ThreeBSP(headBox);

const body: THREE.Geometry = bodyEllipsoidBsp
.subtract(headBoxBsp)
.subtract(headBsp)
.toGeometry();

fs.writeFileSync(
  bodyFilename,
  JSON.stringify(
    (new THREE.BufferGeometry()).fromGeometry(body).toJSON(),
    null,
    2
  )
);

console.log(`${outfilename} done`);

