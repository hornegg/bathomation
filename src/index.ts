import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';
import { createHead } from './head';
import { skin, loadGeometry, outlineMaterial, linearMap, boundedMap, TWO_PI, HALF_PI } from './common';

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const bodyGroup = new THREE.Group();

//
// Add the head
//

createHead().then(head => {
  bodyGroup.add(head);
});

//
// Body
//

const addMesh = async (geometryFile: string, material: THREE.Material, parent: THREE.Object3D) => {

  const geometry = await loadGeometry(geometryFile);

  const mesh = new THREE.Mesh(
    geometry,
    material
  );

  parent.add(mesh);
};

addMesh('bodyGeometry.json', skin, bodyGroup);
addMesh('outlineBodyGeometry.json', outlineMaterial, bodyGroup);

addMesh('leftFootGeometry.json', skin, scene);
addMesh('outlineLeftFootGeometry.json', outlineMaterial, scene);
addMesh('rightFootGeometry.json', skin, scene);
addMesh('outlineRightFootGeometry.json', outlineMaterial, scene);

scene.add(bodyGroup);

//
// Choreograph
//

const choreograph = (frame: number) => {
  const cycleLength = 900;
  const watchTowerLength = cycleLength / 4;
  const pentagramLength = 2 * watchTowerLength / 3;

  const cycleFrame = frame % cycleLength;
  const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
  const watchTowerFrame = cycleFrame % watchTowerLength;

  const bodyAngle = boundedMap(watchTowerFrame, pentagramLength, watchTowerLength, watchTower * HALF_PI, (watchTower - 1) * HALF_PI);

  bodyGroup.rotation.y = bodyAngle;

};

//
// Animate
//

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const timingTool = new FrameTimingTool(30);
let frame = 0;

const animate = (): void => {

  setTimeout(() => {
      requestAnimationFrame( animate );
    },
    timingTool.calculateTimeToNextFrame()
  );

  controls.update();

  choreograph(frame);
  ++frame;

  renderer.render(scene, camera);
};

animate();

