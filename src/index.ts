import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const sphereSegments = 16;

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth - 10, window.innerHeight - 20 );
document.body.appendChild( renderer.domElement );

const greenMaterial = new THREE.MeshBasicMaterial( { color: 'lightgreen' } );
const greyMaterial = new THREE.MeshBasicMaterial( { color: 0x333333, wireframe: true } );

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  greenMaterial
);

cube.translateX(2.5);

const head = new THREE.Mesh(
  (new THREE.SphereGeometry(1, sphereSegments, sphereSegments)).applyMatrix4( new THREE.Matrix4().makeScale( 1.0, 1.2, 1.5 ) ),
  greyMaterial
);

scene.add(cube);
scene.add(head);

camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

const animate = (): void => {

  requestAnimationFrame( animate );

  controls.update();

  renderer.render( scene, camera );
};

animate();

