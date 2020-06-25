/* eslint-disable @typescript-eslint/no-var-requires */

import * as fs from 'fs';
import * as THREE from 'three';
const ThreeBSP = require('three-js-csg')(THREE);

import { createEllipsoid } from './commonGeometry';

const outfilename = process.argv[2];
const outline = (process.argv[3] === 'true');

console.log('building bodyGeometry', {outline});

const scalar = outline ? 0.07 : 0;

const bodyEllipsoid = createEllipsoid(0.75, 1.8, 0.5, scalar);
bodyEllipsoid.translate(0, -1.3, 0);
const bodyEllipsoidBsp = new ThreeBSP(bodyEllipsoid);

const headBox = new THREE.BoxGeometry(2, 2, 2);
headBox.translate(0, 1.5, 0);
const headBoxBsp = new ThreeBSP(headBox);

const loader = new THREE.BufferGeometryLoader();

const head = new THREE.Geometry();

head.fromBufferGeometry(
  loader.parse(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../dist/outlineHeadGeometry.json`, {encoding: 'utf8'})
    )
  )
);

const headBsp = new ThreeBSP(head);

const body: THREE.Geometry = bodyEllipsoidBsp
.subtract(headBoxBsp)
.subtract(headBsp)
.toGeometry();

fs.writeFileSync(
  outfilename,
  JSON.stringify(
    (new THREE.BufferGeometry()).fromGeometry(body).toJSON(),
    null,
    2
  )
);

console.log(`${outfilename} done`);

