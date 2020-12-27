/* eslint-disable immutable/no-mutation */
import * as React from 'react';
import * as THREE from 'three';
import { CanvasContext, useFrame } from 'react-three-fiber';

interface FrameLimiterProps {
  fps?: number;
  logger?: (s: string) => void;
}

interface FrameLimiterState {
  clock: THREE.Clock;
  frame: number;
}

const FrameLimiter = (props: FrameLimiterProps): JSX.Element => {
  const [state, setState] = React.useState<FrameLimiterState>({
    clock: new THREE.Clock(),
    frame: 0,
  });

  // If a logger has been set then each second log the number of frames
  if (props.logger) {
    React.useMemo(() => {
      setInterval(() => {
        setState(currentState => {
          props.logger(currentState.frame.toString());
          return { ...currentState, frame: 0 };
        });
      }, 1000);
    }, []);
  }

  // If an fps has been set, limit the frame rate to it
  useFrame((canvasContext: CanvasContext) => {
    if (props.fps) {
      canvasContext.ready = false;
      const timeUntilNextFrame = 1000 / props.fps - state.clock.getDelta();

      setTimeout(() => {
        canvasContext.ready = true;
        canvasContext.invalidate();
      }, Math.max(0, timeUntilNextFrame));
    }
    setState({ ...state, frame: state.frame + 1 });
  });

  return <></>;
};

export default FrameLimiter;
