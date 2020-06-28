import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';
import { createHead } from './head';
import { skin, loadGeometry, outlineMaterial } from './common';

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

//
// Add the head
//

createHead().then(head => {
  scene.add(head);
});

//
// Body
//

const addMesh = (geometryFile: string, material: THREE.Material): void => {

  loadGeometry(geometryFile).then(
    (geometry) => {
      scene.add(
        new THREE.Mesh(
          geometry,
          material
        )
      );
    }
  );
  
};

addMesh('bodyGeometry.json', skin);
addMesh('outlineBodyGeometry.json', outlineMaterial);
addMesh('leftFootGeometry.json', skin);
addMesh('outlineLeftFootGeometry.json', outlineMaterial);
addMesh('rightFootGeometry.json', skin);
addMesh('outlineRightFootGeometry.json', outlineMaterial);

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


