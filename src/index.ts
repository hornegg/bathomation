import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const createGroup = (objects: THREE.Object3D[]): THREE.Group => {
  const group = new THREE.Group();
  objects.forEach(obj => group.add(obj));
  return group;
};

const addOutline = (mesh: THREE.Mesh): THREE.Group => {

  const outlineWidth = 0.07;
  const outlineVec = new THREE.Vector3(outlineWidth, outlineWidth, outlineWidth);
  const box = new THREE.Box3().setFromObject(mesh);
  const outlinedBox = new THREE.Box3(box.min.clone().sub(outlineVec), box.max.clone().add(outlineVec));

  const material = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
  const outline = new THREE.Mesh(mesh.geometry, material);
  outline.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  outline.scale.divide(box.getSize(new THREE.Vector3()));
  outline.scale.multiply(outlinedBox.getSize(new THREE.Vector3()));
  return createGroup([mesh, outline]);
};

const createSphere = (radius: number): THREE.Geometry => {
  const sphereSegments = 32;
  return new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
};

const createEllipsoid = (x: number, y: number, z: number, scalar: number): THREE.Geometry => {
  return createSphere(1).applyMatrix4(new THREE.Matrix4().makeScale(x + scalar, y + scalar, z + scalar));
};

const createHeadGeometry = (scalar: number): THREE.Geometry => {
  const head = createEllipsoid(1.5, 1.0, 1.0, scalar);

  const earVector = new THREE.Vector3(1.44, 0.6, -0.3); // vector between center of head and center of ear

  const leftEar = createEllipsoid(0.4, 0.4, 0.25, scalar);
  
  const rightEar = leftEar.clone();
  
  leftEar.translate(earVector.x, earVector.y, earVector.z);
  earVector.x = -earVector.x;
  rightEar.translate(earVector.x, earVector.y, earVector.z);
  
  head.merge(leftEar);
  head.merge(rightEar);

  return head;
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const skin = new THREE.MeshBasicMaterial({color: 0x333333});
const outlineMaterial = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});

const head = new THREE.Mesh(
  createHeadGeometry(0),
  skin
);

const headOutline = new THREE.Mesh(
  createHeadGeometry(0.07),
  outlineMaterial
);

scene.add(head, headOutline);

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

