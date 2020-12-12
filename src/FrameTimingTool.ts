
export const createFrameTimingTool = (fps: number): (() => number) => {
  // eslint-disable-next-line immutable/no-let
  let timeLastFrame = 0;
  const timeBetweenFrames = 1000 / fps;

  return (): number => {
    const timeThisFrame = performance.now();
    const timeSinceLastFrame = timeThisFrame - timeLastFrame;
    const timeToNextFrame = Math.max(timeBetweenFrames - timeSinceLastFrame, 0);
    timeLastFrame = timeThisFrame;
    return timeToNextFrame;
  };
};

