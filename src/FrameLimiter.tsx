/* eslint-disable immutable/no-mutation */
import * as React from 'react';
import * as THREE from 'three';
import { CanvasContext, useFrame } from 'react-three-fiber';

interface FrameLimiterProps {
  fps: number;
}

const FrameLimiter = (props: FrameLimiterProps): JSX.Element => {
  const [clock] = React.useState(new THREE.Clock());

  useFrame((state: CanvasContext) => {
    state.ready = false;
    const timeUntilNextFrame = (1000 / props.fps) - clock.getDelta();

    setTimeout(() => {
      state.ready = true;
      state.invalidate();
    }, Math.max(0, timeUntilNextFrame));

  });

  return <></>;
};

export default FrameLimiter;  