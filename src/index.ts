import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const createGroup = (objects: THREE.Object3D[]): THREE.Group => {
  const group = new THREE.Group();
  objects.forEach(obj => group.add(obj));
  return group;
};

const addOutline = (mesh: THREE.Mesh): THREE.Group => {
  const material = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
  const outline = new THREE.Mesh(mesh.geometry, material);
  outline.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  outline.scale.multiplyScalar(1.05);
  return createGroup([mesh, outline]);
};

const createSphere = (radius: number): THREE.Geometry => {
  const sphereSegments = 16;
  return new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
};

const createEllipsoid = (x: number, y: number, z: number): THREE.Geometry => {
  return createSphere(1).applyMatrix4(new THREE.Matrix4().makeScale(x, y, z));
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const skin = new THREE.MeshBasicMaterial({color: 0x333333});

const basicHead = addOutline(
  new THREE.Mesh(
    createEllipsoid(1.5, 1.0, 1.0),
    skin
  )
);

const leftEar = addOutline(
  new THREE.Mesh(
    createEllipsoid(0.3, 0.3, 0.3),
    skin
  )
);

const head = createGroup([basicHead, leftEar]);

scene.add(head);

leftEar.position.set(2, 0, 0);

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

