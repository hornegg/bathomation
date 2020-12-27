import * as THREE from 'three';
import * as React from 'react';
import { useFrame } from 'react-three-fiber';
import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';

import { boundedMap, HALF_PI, linearMap, PI } from './common';
import settings from './settings';

const textureLoader = new THREE.TextureLoader();
const tex = textureLoader.load('./THREE.Fire/Fire.png');

interface Fire extends THREE.Object3D {
  update(time: number): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  material: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createFire = () => new (THREE as any).Fire(tex);

interface PentagramState {
  frame: number;
  fires: Fire[];
}

interface PentagramProps {
  angle: number;
  startFrame: number;
  endFrame: number;
}

const Pentagram = (props: PentagramProps): JSX.Element => {
  const flameCount = 46;

  const [state, setState] = React.useState<PentagramState>({
    frame: 0,
    fires: Array.from(Array(flameCount)).map(() => createFire()),
  });

  useFrame(() => {

    state.fires.forEach((fire, index) => {

      const beginningOfEnd = linearMap(0.9, 0, 1, props.startFrame, props.endFrame);
      const complete = linearMap(0.5, 0, 1, props.startFrame, props.endFrame);
      const flameStart = linearMap(index, 0, state.fires.length, props.startFrame, complete);
      const flameComplete = flameStart + ((props.endFrame - props.startFrame) / 10);

      const minMagnitude = 1.3;
      const maxMagnitude = 10;
      const minGain = 0.5;
      const maxGain = 5;

      if (state.frame >= props.startFrame && state.frame <= props.endFrame) {
        if (state.frame >= beginningOfEnd) {
          // eslint-disable-next-line immutable/no-mutation
          fire.material.uniforms.magnitude.value = boundedMap(state.frame, beginningOfEnd, props.endFrame, minMagnitude, maxMagnitude);
          // eslint-disable-next-line immutable/no-mutation
          fire.material.uniforms.gain.value = boundedMap(state.frame, beginningOfEnd, props.endFrame, minGain, maxGain);
        } else {
          // eslint-disable-next-line immutable/no-mutation
          fire.material.uniforms.magnitude.value = boundedMap(state.frame, flameStart, flameComplete, maxMagnitude, minMagnitude);
          // eslint-disable-next-line immutable/no-mutation
          fire.material.uniforms.gain.value = boundedMap(state.frame, flameStart, flameComplete, maxGain, minGain);
        }

        fire.update(state.frame / 25);
      }
    });

    setState({ ...state, frame: (state.frame + 1) % settings.cycleLength });
  });

  const getPointOnPentagon = (pt: number) => {

    // map the point so the drawing starts in the right place
    const n = (pt - 1) % 5;

    const angle =
      (4 * PI * n) / 5 + (settings.invertPentagrams ? -HALF_PI : HALF_PI);
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

  if ((props.startFrame <= state.frame) && (state.frame <= props.endFrame)) {

    const scale = 0.4;

    return (
      <group rotation={new THREE.Euler(0, props.angle, 0)}>
        {state.fires.map((fire, index) => (
          <group
            key={index}
            position={getPointOnPentagram((5 * index) / state.fires.length)}
            scale={new THREE.Vector3(scale, scale, scale)}
          >
            <primitive object={fire} />
          </group>
        ))}
      </group>
    );
  } else {
    return <></>;
  }
};

export default Pentagram;
