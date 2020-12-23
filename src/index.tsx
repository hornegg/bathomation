import ReactDOM from 'react-dom';
import * as React from 'react';
import { Canvas } from 'react-three-fiber';
import * as THREE from 'three';

import { loadGeometry, outlineMaterial, skin } from './common';
import { createHead } from './head';
import FrameLimiter from './FrameLimiter';

const cycleLength = 1200; // The number of frames before the animation repeats itself
const captureOffset = cycleLength; // The number of frames to wait before commencing with any capture
const captureCount = 100; // Number of frames to capture.  Set to zero for no capture

const usePromise = <T extends unknown>(promise: Promise<T>) => {
  const [state, setState] = React.useState<T>(null);
  if (!state) {
    promise.then(setState);
  }
  return state;
};

interface LoadedGeometryProps {
  url: string;
  material: THREE.Material;
}

const MeshLoadGeom = (props: LoadedGeometryProps) => {
  const geometry = usePromise(loadGeometry(props.url));
  return geometry ? (
    <mesh geometry={geometry} material={props.material} />
  ) : (
    <></>
  );
};

const Head = () => {
  const head = usePromise(createHead());
  return head ? <primitive object={head} /> : <></>;
};

const size = captureCount
  ? { width: 800, height: 600 }
  : { width: window.innerWidth - 10, height: window.innerHeight - 20 };

ReactDOM.render(
  <div style={size}>
    <Canvas>
      <FrameLimiter fps={30} />
      <Head />
      <group>
        <MeshLoadGeom url="bodyGeometry.json" material={skin} />
        <MeshLoadGeom
          url="outlineBodyGeometry.json"
          material={outlineMaterial}
        />
      </group>
      <group>
        <MeshLoadGeom url="leftFootGeometry.json" material={skin} />
        <MeshLoadGeom
          url="outlineLeftFootGeometry.json"
          material={outlineMaterial}
        />
      </group>
      <group>
        <MeshLoadGeom url="rightFootGeometry.json" material={skin} />
        <MeshLoadGeom
          url="outlineRightFootGeometry.json"
          material={outlineMaterial}
        />
      </group>
    </Canvas>
  </div>,
  document.getElementById('root')
);
