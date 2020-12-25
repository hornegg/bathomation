import * as THREE from 'three';
import * as React from 'react';

import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';
import { HALF_PI, linearMap, PI, TWO_PI } from './common';
import { useFrame } from 'react-three-fiber';

const textureLoader = new THREE.TextureLoader();
const tex = textureLoader.load('./THREE.Fire/Fire.png');

interface Fire extends THREE.Object3D {
  update(time: number): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createFire = () => new (THREE as any).Fire(tex);

interface PentagramState {
  frame: number;
  fires: Fire[];
}

interface PentagramProps {
  angle: number;
}

const Pentagram = (props: PentagramProps): JSX.Element => {
  const flameCount = 30;

  const [state, setState] = React.useState<PentagramState>({
    frame: 0,
    fires: Array.from(Array(flameCount)).map(() => createFire()),
  });

  useFrame(() => {
    state.fires.forEach((fire) => fire.update(state.frame / 25));
    setState({ ...state, frame: state.frame + 1 });
  });

  const getPointOnPentagon = (n: number) => {
    const invert = false;
    const angle = (4 * PI * n / 5) + (invert ? -HALF_PI : HALF_PI);
    const radius = 1;
  
    return new THREE.Vector3(
      -2,
      radius * Math.sin(angle),
      radius * Math.cos(angle)
    );
  };
  
  const getPointOnPentagram = (v: number) => {
    const sideStart = Math.floor(v);
    const sideEnd = sideStart + 1;
    const start = getPointOnPentagon(sideStart);
    const end = getPointOnPentagon(sideEnd);

    return new THREE.Vector3(
      linearMap(v, sideStart, sideEnd, start.x, end.x),
      linearMap(v, sideStart, sideEnd, start.y, end.y),
      linearMap(v, sideStart, sideEnd, start.z, end.z)
    );
  };

  return (
    <group rotation={new THREE.Euler(0, props.angle, 0)}>
      {state.fires.map((fire, index) => (
        <group key={index} position={getPointOnPentagram(5 * index/ state.fires.length)} scale={new THREE.Vector3(0.5, 0.5, 0.5)}>
          <primitive object={fire} />
        </group>
      ))}
    </group>
  );
};

export default Pentagram;
