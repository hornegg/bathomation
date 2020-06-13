import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = 0.5 * PI;

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

