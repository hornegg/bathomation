import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const createOutline = (mesh: THREE.Mesh): THREE.Mesh => {
  const material = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
  const outline = new THREE.Mesh(mesh.geometry, material);
  outline.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  outline.scale.multiplyScalar(1.05);
  return outline;
};

const sphereSegments = 16;

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const greyMaterial = new THREE.MeshBasicMaterial({color: 0x333333});

const head = new THREE.Mesh(
  (new THREE.SphereGeometry(1, sphereSegments, sphereSegments)).applyMatrix4( new THREE.Matrix4().makeScale(1.5, 1.0, 1.0)),
  greyMaterial
);

scene.add(head);
scene.add(createOutline(head));

camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

const timingTool = new FrameTimingTool(30);

const animate = (): void => {

  setTimeout(() => {
      requestAnimationFrame( animate );
    },
    timingTool.calculateTimeToNextFrame()
  );

  controls.update();

  renderer.render( scene, camera );
};

animate();

