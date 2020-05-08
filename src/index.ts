import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const TWO_PI = 2 * Math.PI;

export function linearMap(value: number, range1start: number, range1end: number, range2start: number, range2end: number): number {
  return range2start + (range2end - range2start) * ((value - range1start) / (range1end - range1start));
}

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const skin = new THREE.MeshBasicMaterial({color: 0x333333});
const outlineMaterial = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});

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

const createHorn = (outline: boolean): THREE.Geometry => {

  const scalar = outline ? 0.07 : 0;
  const hornMaxRadius = 0.1 + scalar;
  const hornLength = 1 + scalar + scalar + scalar + scalar;
  const lengthSections = 5;
  const deltaV = 1 / lengthSections;

  const openHorn = (u: number, v: number, vec: THREE.Vector3): void => {
    const hornRadius = (1 - v) * hornMaxRadius;
    const angle = -TWO_PI * u;

    vec.set(
      hornRadius * Math.cos(angle),
      hornLength * v,
      hornRadius * Math.sin(angle),
    );
  }; 

  const closedHorn = (u: number, v: number, vec: THREE.Vector3): void => {
    const closer = (v === 0);

    if (!closer) {
      v = linearMap(v, deltaV, 1, 0, 1);
    }

    openHorn(u, v, vec);

    if (closer) {
      vec.setY(0);
    }
  };

  const horn = new THREE.ParametricGeometry(outline ? openHorn : closedHorn, 10, lengthSections);

  return horn;
};

const horn = createHorn(false);
const hornOutline = createHorn(true);

const hornMesh = new THREE.Mesh(
  horn,
  skin
);

const hornOutlineMesh = new THREE.Mesh(
  hornOutline,
  outlineMaterial
);

const hornGroup = new THREE.Group();
hornGroup.add(hornMesh);
hornGroup.add(hornOutlineMesh);

hornGroup.translateY(2);

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

