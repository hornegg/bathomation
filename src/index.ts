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
const redMaterial = new THREE.MeshBasicMaterial({color: 'red', side: THREE.DoubleSide});

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

interface TubeParameters {
  thetaStart: number;
  phiStart: number;
  thetaEnd: number;
  phiEnd: number;
  radius: number;
}

const createTube = (param: TubeParameters): THREE.TubeGeometry => {

  class Tube extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const theta = linearMap(t, 0, 1, param.thetaStart, param.thetaEnd);
      const phi = linearMap(t, 0, 1, param.phiStart, param.phiEnd);
      return ellipticalToCartesian(
        1,
        theta,
        phi
      );
    }
  }

  return new THREE.TubeGeometry(new Tube, 100, param.radius, 100, false);
};

interface ArcParameters {
  centerTheta: number;
  centerPhi: number;
  thetaRadius: number;
  phiRadius: number;
  tubeRadius: number;
  startAngle: number;
  finishAngle: number;
}

const createArc = (param: ArcParameters): THREE.TubeGeometry => {

  class Arc extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const angle = linearMap(t, 0, 1, param.startAngle, param.finishAngle);
      return ellipticalToCartesian(
        1,
        param.centerTheta + (param.thetaRadius * Math.cos(angle)),
        param.centerPhi + (param.phiRadius * Math.sin(angle))
      );
    }
  }

  return new THREE.TubeGeometry(new Arc, 100, param.tubeRadius, 100, false);
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

  return createTube({
    thetaStart: theta + (r * Math.cos(v * FIFTH_TAU)),
    phiStart: phi + (r * Math.sin(v * FIFTH_TAU)),
    thetaEnd: theta + (r * Math.cos(u * FIFTH_TAU)),
    phiEnd: phi + (r * Math.sin(u * FIFTH_TAU)),
    radius: 0.02
  });

}).map(
  geom => new THREE.Mesh(geom, outlineMaterialDouble)
).forEach(
  mesh => foreheadGroup.add(mesh)
);

scene.add(foreheadGroup);

//
// Eyes
//

const lid = {
  thetaStart: 0.8,
  phiStart: 0.9,
  thetaEnd: 0.3,
  phiEnd: 0.9,
  radius: 0.04
};

const centerTheta = linearMap(1, 0, 2, lid.thetaStart, lid.thetaEnd);
const centerPhi = linearMap(1, 0, 2, lid.phiStart, lid.phiEnd);

const topLidRight = createTube(lid);

const bottomLidRight = createArc({
  centerTheta,
  centerPhi,
  thetaRadius: 0.22,
  phiRadius: 0.33,
  tubeRadius: lid.radius,
  startAngle: PI,
  finishAngle: TWO_PI
});

const eyeballRight = createTube({
  thetaStart: centerTheta - 0.05,
  phiStart: centerPhi - 0.05,
  thetaEnd: centerTheta + 0.05,
  phiEnd: centerPhi - 0.2,
  radius: lid.radius * 0.8
});

const topLidLeft = topLidRight.clone().scale(-1, 1, 1);
const bottomLidLeft = bottomLidRight.clone().scale(-1, 1, 1);
const eyeballLeft = eyeballRight.clone().scale(-1, 1, 1);

const eyesGroup = new THREE.Group();

[topLidLeft, topLidRight, bottomLidLeft, bottomLidRight].map(
  geom => new THREE.Mesh(geom, outlineMaterialDouble)
).forEach(
  mesh => eyesGroup.add(mesh)
);

[eyeballLeft, eyeballRight].map(
  geom => new THREE.Mesh(geom, redMaterial)
).forEach(
  mesh => eyesGroup.add(mesh)
);
  
scene.add(eyesGroup);

//
// Mouth
//

const mouth = new THREE.Mesh(
  createArc({
    centerTheta: 0,
    centerPhi: -HALF_PI,
    thetaRadius: 0.7,
    phiRadius: 0.7,
    tubeRadius: 0.04,
    startAngle: -0.9,
    finishAngle: 0.9
  }),
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

