import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';

import FrameTimingTool from './FrameTimingTool';
import { createHead } from './head';
import { skin, loadGeometry, outlineMaterial, linearMap, boundedMap, HALF_PI } from './common';

//
// Optionally declare stuff that will help us save the animation frames
//

let capture = 0; // Number of frames to capture.  Set to zero for no capture

let zip = capture ? new JSZip() : null;

const saveFrame = (frame: number) => {

  let frameString = frame.toString();

  while (frameString.length < 6) {
    frameString = '0' + frameString;
  }

  canvas.toBlob((blob: Blob) => {

    if (zip) {
      zip.file(`f${frameString}.png`, blob);

      if (Object.keys(zip.files).length >= capture) {
        zip.generateAsync({type: 'blob'}).then((content) => {
          saveAs(content, 'frames.zip');
        });

        zip = null;
        capture = null;
      }
    }
  });
};

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({antialias: true});

if (capture) {
  renderer.setSize(800, 600);
} else {
  renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
}

document.body.appendChild( renderer.domElement );
const canvas: HTMLCanvasElement = renderer.domElement;

const bodyGroup = new THREE.Group();
const leftFootGroup = new THREE.Group();
const rightFootGroup = new THREE.Group();

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
addMesh('leftFootGeometry.json', skin, leftFootGroup);
addMesh('outlineLeftFootGeometry.json', outlineMaterial, leftFootGroup);
addMesh('rightFootGeometry.json', skin, rightFootGroup);
addMesh('outlineRightFootGeometry.json', outlineMaterial, rightFootGroup);

scene.add(bodyGroup);
scene.add(leftFootGroup);
scene.add(rightFootGroup);

//
// Choreograph
//

const choreograph = (frame: number) => {
  const cycleLength = 900;
  const watchTowerLength = cycleLength / 4;
  const pentagramLength = 2 * watchTowerLength / 3;
  const midStepLength = linearMap(0.5, 0, 1, pentagramLength, watchTowerLength);

  const cycleFrame = frame % cycleLength;
  const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
  const watchTowerFrame = cycleFrame % watchTowerLength;

  const bodyAngle = boundedMap(watchTowerFrame, pentagramLength, watchTowerLength, watchTower * HALF_PI, (watchTower - 1) * HALF_PI);
  const leftFootAngle = boundedMap(watchTowerFrame, pentagramLength, midStepLength, watchTower * HALF_PI, (watchTower - 1) * HALF_PI);
  const rightFootAngle = boundedMap(watchTowerFrame, midStepLength, watchTowerLength, watchTower * HALF_PI, (watchTower - 1) * HALF_PI);

  bodyGroup.rotation.y = bodyAngle;
  leftFootGroup.rotation.y = leftFootAngle;
  rightFootGroup.rotation.y = rightFootAngle;
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

  renderer.render(scene, camera);

  if (zip && Object.keys(zip.files).length < capture) {
    saveFrame(frame);
  }

  ++frame;

};

animate();

