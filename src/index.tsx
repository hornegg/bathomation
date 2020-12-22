import ReactDOM from 'react-dom';
import * as React from 'react';
import { Canvas } from 'react-three-fiber';
import * as THREE from 'three';
import { loadGeometry, outlineMaterial, skin } from './common';
import { createHead } from './head';

const cycleLength = 1200; // The number of frames before the animation repeats itself
const captureOffset = cycleLength; // The number of frames to wait before commencing with any capture
const captureCount = 100; // Number of frames to capture.  Set to zero for no capture

interface LoadedGeometryProps {
  url: string;
  material: THREE.Material
}

const MeshLoadGeom = (props: LoadedGeometryProps) => {

  const [geometry, setGeometry] = React.useState<THREE.BufferGeometry>(null);

  if (geometry) {
    return <mesh geometry={geometry} material={props.material}/>;
  } else {
    loadGeometry(props.url).then(setGeometry);
    return <mesh />;
  }

};

const Head = () => {
  const [head, setHead] = React.useState<THREE.Group>(null);

  if (head) {
    return <primitive object={head} />;
  } else {
    createHead().then(setHead);
    return <group />;
  }
};

const size = captureCount ? {width: 800, height: 600} : {width: window.innerWidth - 10, height: window.innerHeight - 20};

ReactDOM.render(  
  <div style={size}>
    <Canvas>
      <Head />
      <group>
        <MeshLoadGeom url="bodyGeometry.json" material={skin} />
        <MeshLoadGeom url="outlineBodyGeometry.json" material={outlineMaterial} />
      </group>
      <group>
        <MeshLoadGeom url="leftFootGeometry.json" material={skin} />
        <MeshLoadGeom url="outlineLeftFootGeometry.json" material={outlineMaterial} />
      </group>
      <group>
        <MeshLoadGeom url="rightFootGeometry.json" material={skin} />
        <MeshLoadGeom url="outlineRightFootGeometry.json" material={outlineMaterial} />
      </group>
    </Canvas>
  </div>,
  document.getElementById('root')
);

