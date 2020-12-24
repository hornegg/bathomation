import * as THREE from 'three';
import * as React from 'react';

import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';
import { linearMap, TWO_PI } from './common';
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
  const flameCount = 5;

  const [state, setState] = React.useState<PentagramState>({
    frame: 0,
    fires: Array.from(Array(flameCount)).map(() => createFire()),
  });

  useFrame(() => {
    state.fires.forEach((fire) => fire.update(state.frame / 25));
    setState({ ...state, frame: state.frame + 1 });
  });

  const getPosition = (index) => {
    const theta = linearMap(index, 0, flameCount, 0, TWO_PI);
    const radius = 1;

    return new THREE.Vector3(
      -2,
      radius * Math.sin(theta),
      radius * Math.cos(theta)
    );
  };

  return (
    <group rotation={new THREE.Euler(0, props.angle, 0)}>
      {state.fires.map((fire, index) => (
        <primitive object={fire} key={index} position={getPosition(index)} />
      ))}
    </group>
  );
};

export default Pentagram;
