
class FrameTimingTool {
  
  private timeLastFrame = 0;
  private timeBetweenFrames: number;

  constructor(fps: number) {
    this.timeBetweenFrames = 1000 / fps;
  }

  calculateTimeToNextFrame(): number {
    const timeThisFrame = performance.now();
    const timeSinceLastFrame = timeThisFrame - this.timeLastFrame;
    const timeToNextFrame = Math.max(this.timeBetweenFrames - timeSinceLastFrame, 0);
    this.timeLastFrame = timeThisFrame;
    return timeToNextFrame;
  }
}

export default FrameTimingTool;

