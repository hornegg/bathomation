import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = 0.5 * PI;
const FIFTH_TAU = TWO_PI / 5;

const linearMap = (value: number, range1start: number, range1end: number, range2start: number, range2end: number): number => {
  return range2start + (range2end - range2start) * ((value - range1start) / (range1end - range1start));
};

const headWidth = 1.5;
const headHeight = 1;
const headDepth = 1;

const ellipticalToCartesian = (r: number, theta: number, phi: number, vec?: THREE.Vector3): THREE.Vector3 => {

  vec = vec ? vec : new THREE.Vector3();

  return vec.set(
    r * headWidth * Math.sin(theta) * Math.cos(phi),
    r * headHeight * Math.sin(theta) * Math.sin(phi),
    r * headDepth * Math.cos(theta)
  );
};

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const skin = new THREE.MeshBasicMaterial({color: 0x333333, side: THREE.DoubleSide});
const outlineMaterial = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
const outlineMaterialDouble = new THREE.MeshBasicMaterial({color: 'black', side: THREE.DoubleSide});

//
// Load the geometry
//

(new THREE.BufferGeometryLoader()).load('headGeometry.json', (geometry) => {

  const head = new THREE.Mesh(
      geometry,
      skin
    );

  scene.add(head);
});

(new THREE.BufferGeometryLoader()).load('outlineHeadGeometry.json', (geometry) => {

  const headOutline = new THREE.Mesh(
    geometry,
    outlineMaterial
  );

  scene.add(headOutline);

});

//
// Horns
//

const createHorn = (theta: number, phi: number, maxWidth: number, maxDepth: number, length: number, bend: number): THREE.Geometry => {

  const openHorn = (u: number, v: number, vec: THREE.Vector3): void => {

    const width = maxWidth * (1 - u);
    const depth = maxDepth * (1 - u);
    const angle = TWO_PI * v;

    ellipticalToCartesian(
      1 + (length * u),
      theta + (width * Math.sin(angle)),
      phi + (depth * Math.cos(angle)),
      vec
    );

    vec = vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), bend * length * u);
  }; 

  const horn = new THREE.ParametricGeometry(openHorn, 10, 10);

  return horn;
};

const leftHorn = new THREE.Mesh(
  createHorn(HALF_PI, (5/8) * PI, 0.15, 0.1, 1, 0.2),
  skin
);

const om = 1.4; // Outline multiplier

const leftHornOutline = new THREE.Mesh(
  createHorn(HALF_PI, (5/8) * PI, 0.15 * om, 0.1 * om, 1.2, 0.2),
  outlineMaterial
);

const rightHorn = new THREE.Mesh(
  createHorn(HALF_PI, (3/8) * PI, 0.15, 0.1, 1, -0.2),
  skin
);

const rightHornOutline = new THREE.Mesh(
  createHorn(HALF_PI, (3/8) * PI, 0.15 * om, 0.1 * om, 1.2, -0.2),
  outlineMaterial
);

const hornGroup = new THREE.Group();
hornGroup.add(leftHorn);
hornGroup.add(leftHornOutline);
hornGroup.add(rightHorn);
hornGroup.add(rightHornOutline);

scene.add(hornGroup);

//
// Basic shapes upon the ellipical head
//

const createTube = (thetaStart, phiStart, thetaEnd, phiEnd, radius): THREE.TubeGeometry => {

  console.log('createTube', thetaStart, phiStart, thetaEnd, phiEnd, radius);

  class Tube extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const theta = linearMap(t, 0, 1, thetaStart, thetaEnd);
      const phi = linearMap(t, 0, 1, phiStart, phiEnd);
      return ellipticalToCartesian(
        1,
        theta,
        phi
      );
    }
  }

  return new THREE.TubeGeometry(new Tube, 100, radius, 100, false);
};

const createArc = (centerTheta, centerPhi, arcRadius, tubeRadius, startAngle, finishAngle): THREE.TubeGeometry => {

  class Arc extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const angle = linearMap(t, 0, 1, startAngle, finishAngle);
      return ellipticalToCartesian(
        1,
        centerTheta + (arcRadius * Math.cos(angle)),
        centerPhi + (arcRadius * Math.sin(angle))
      );
    }
  }

  return new THREE.TubeGeometry(new Arc, 100, tubeRadius, 100, false);
};

//
// Forehead pentagram
//

const foreheadGroup = new THREE.Group();

[0,1,2,3,4].map(v => {
  
  const theta = 0.75;
  const phi = HALF_PI;
  const r = 0.3;
  v = v + 0.5;
  const u = v + 2;

  return createTube(
    theta + (r * Math.cos(v * FIFTH_TAU)),
    phi + (r * Math.sin(v * FIFTH_TAU)),
    theta + (r * Math.cos(u * FIFTH_TAU)),
    phi + (r * Math.sin(u * FIFTH_TAU)),
    0.02
  );

}).map(
  geom => new THREE.Mesh(geom, outlineMaterialDouble)
).forEach(
  mesh => foreheadGroup.add(mesh)
);

scene.add(foreheadGroup);

//
// Eyes
//

const topLidRight = createTube(
  0.8,
  0.9,
  0.3,
  0.9,
  0.05
);

const topLidLeft = topLidRight.clone().scale(-1, 1, 1);

const eyesGroup = new THREE.Group();

[topLidLeft, topLidRight].map(
  geom => new THREE.Mesh(geom, outlineMaterialDouble)
).forEach(
  mesh => eyesGroup.add(mesh)
);

scene.add(eyesGroup);

//
// Mouth
//

const mouth = new THREE.Mesh(
  createArc(0, -HALF_PI, 0.7, 0.04, -0.9, 0.9),
  outlineMaterialDouble
);

scene.add(mouth);

//
// Animate
//

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const timingTool = new FrameTimingTool(30);

const animate = (): void => {

  setTimeout(() => {
      requestAnimationFrame( animate );
    },
    timingTool.calculateTimeToNextFrame()
  );

  controls.update();

  renderer.render(scene, camera);
};

animate();

