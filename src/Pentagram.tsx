import * as THREE from 'three';
import * as React from 'react';
import { useFrame } from 'react-three-fiber';
import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';

import { boundedMap, HALF_PI, linearMap, PI } from './common';
import settings from './settings';

const getPointOnPentagon = (pt: number) => {
  // map the point so the drawing starts in the right place
  const n = (pt - 1) % 5;

  const angle =
    ((4 * PI * n) / 5) + (settings.invertPentagrams ? -HALF_PI : HALF_PI);
  const radius = 1.5;

  return new THREE.Vector3(
    -2,
    radius * Math.sin(angle),
    radius * Math.cos(angle)
  );
};

export const getPointOnPentagram = (v: number): THREE.Vector3 => {
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

export const Pentagram = (props: PentagramProps): JSX.Element => {
  const flameCount = settings.frameCapture ? 196 : 31;

  const [state, setState] = React.useState<PentagramState>({
    frame: 0,
    fires: Array.from(Array(flameCount)).map(() => createFire()),
  });

  useFrame(() => {
    state.fires.forEach((fire, index) => {
      const flare = linearMap(0.8, 0, 1, props.startFrame, props.endFrame);
      const beginningOfEnd = linearMap(
        0.9,
        0,
        1,
        props.startFrame,
        props.endFrame
      );
      const complete = linearMap(0.5, 0, 1, props.startFrame, props.endFrame);
      const flameStart = linearMap(
        index,
        0,
        state.fires.length,
        props.startFrame,
        complete
      );
      const flameComplete =
        flameStart + ((props.endFrame - props.startFrame) / 10);

      const minMagnitude = 1.3;
      const maxMagnitude = 10;
      const minGain = 0.5;
      const maxGain = 5;

      const mid = 0.06;
      const midMagnitude = linearMap(mid, 0, 1, minMagnitude, maxMagnitude);
      const midGain = linearMap(mid, 0, 1, minGain, maxGain);

      /* eslint-disable immutable/no-mutation */
      if (state.frame >= props.startFrame && state.frame <= props.endFrame) {
        if (state.frame >= flare) {
          // Fade out
          const ratio = Math.pow(
            boundedMap(state.frame, beginningOfEnd, props.endFrame, 0, 1),
            5
          );
          fire.material.uniforms.magnitude.value = linearMap(
            ratio,
            0,
            1,
            minMagnitude,
            maxMagnitude
          );
          fire.material.uniforms.gain.value = boundedMap(
            ratio,
            0,
            1,
            minGain,
            maxGain
          );
        } else {
          // Fade in
          const ratio = Math.pow(
            boundedMap(state.frame, flameStart, flameComplete, 0, 1),
            2
          );
          fire.material.uniforms.magnitude.value = boundedMap(
            ratio,
            0,
            1,
            maxMagnitude,
            midMagnitude
          );
          fire.material.uniforms.gain.value = boundedMap(
            ratio,
            0,
            1,
            maxGain,
            midGain
          );
        }
        /* eslint-enable immutable/no-mutation */

        fire.update(state.frame / 25);
      }
    });

    setState({ ...state, frame: (state.frame + 1) % settings.cycleLength });
  });

  if (props.startFrame <= state.frame && state.frame <= props.endFrame) {
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
