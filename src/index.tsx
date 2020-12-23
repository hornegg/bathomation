import ReactDOM from 'react-dom';
import * as React from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import * as THREE from 'three';

import {
  boundedMap,
  HALF_PI,
  linearMap,
  loadGeometry,
  outlineMaterial,
  skin,
} from './common';
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

interface BodyState {
  frame: number;
  bodyAngle: number;
  leftFootAngle: number;
  rightFootAngle: number;
}

const choreograph = (frame: number): BodyState => {
  const watchTowerLength = cycleLength / 4;
  const pentagramLength = (2 * watchTowerLength) / 3;
  const midStepLength = linearMap(0.5, 0, 1, pentagramLength, watchTowerLength);

  const cycleFrame = frame % cycleLength;
  const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
  const watchTowerFrame = cycleFrame % watchTowerLength;

  const bodyAngle = boundedMap(
    watchTowerFrame,
    pentagramLength,
    watchTowerLength,
    watchTower * HALF_PI,
    (watchTower - 1) * HALF_PI
  );
  const leftFootAngle = boundedMap(
    watchTowerFrame,
    pentagramLength,
    midStepLength,
    watchTower * HALF_PI,
    (watchTower - 1) * HALF_PI
  );
  const rightFootAngle = boundedMap(
    watchTowerFrame,
    midStepLength,
    watchTowerLength,
    watchTower * HALF_PI,
    (watchTower - 1) * HALF_PI
  );

  return {
    frame,
    bodyAngle,
    leftFootAngle,
    rightFootAngle,
  };
};

const Body = () => {
  const [state, setState] = React.useState(choreograph(0));

  useFrame(() => setState(choreograph(state.frame + 1)));

  console.log(state.frame);

  return (
    <group>
      <group rotation={new THREE.Euler(0, state.bodyAngle, 0)}>
        <Head />
        <MeshLoadGeom url="bodyGeometry.json" material={skin} />
        <MeshLoadGeom
          url="outlineBodyGeometry.json"
          material={outlineMaterial}
        />
      </group>
      <group rotation={new THREE.Euler(0, state.leftFootAngle, 0)}>
        <MeshLoadGeom url="leftFootGeometry.json" material={skin} />
        <MeshLoadGeom
          url="outlineLeftFootGeometry.json"
          material={outlineMaterial}
        />
      </group>
      <group rotation={new THREE.Euler(0, state.rightFootAngle, 0)}>
        <MeshLoadGeom url="rightFootGeometry.json" material={skin} />
        <MeshLoadGeom
          url="outlineRightFootGeometry.json"
          material={outlineMaterial}
        />
      </group>
    </group>
  );
};

const size = captureCount
  ? { width: 800, height: 600 }
  : { width: window.innerWidth - 10, height: window.innerHeight - 20 };

ReactDOM.render(
  <div style={size}>
    <Canvas>
      <FrameLimiter fps={30} />
      <Body />
    </Canvas>
  </div>,
  document.getElementById('root')
);
