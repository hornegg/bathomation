import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = 0.5 * PI;

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
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

const createHorn = (outline: boolean): THREE.Group => {

  const scalar = outline ? 0.07 : 0;
  const hornMaxRadius = 0.1 + scalar;
  const hornLength = 1 + scalar + scalar;
  const segments = 10;

  const openHorn = (u: number, v: number, vec: THREE.Vector3): void => {
    const hornRadius = (1 - v) * hornMaxRadius;
    const angle = -TWO_PI * u;

    vec.set(
      hornRadius * Math.cos(angle),
      hornLength * v,
      hornRadius * Math.sin(angle),
    );
  }; 

  const horn = new THREE.ParametricGeometry(openHorn, segments, 5);

  const mesh = new THREE.Mesh(
    horn,
    outline ? outlineMaterial : skin
  );

  const group = new THREE.Group();
  group.add(mesh);

  if (outline) {
    const circle = new THREE.CircleGeometry(hornMaxRadius + scalar, segments);
    circle.rotateX(HALF_PI);

    const circleMesh = new THREE.Mesh(
      circle,
      outlineMaterialDouble
    );

    group.add(circleMesh);
  }

  return group;
};

const horn = createHorn(false);
const hornOutline = createHorn(true);

const hornGroup = new THREE.Group();
hornGroup.add(horn);
hornGroup.add(hornOutline);

hornGroup.translateY(1);

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

