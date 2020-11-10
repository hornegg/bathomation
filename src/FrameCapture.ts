import JSZip from 'jszip';
import {saveAs} from 'file-saver';

class FrameCapture {

  zip: JSZip;

  constructor(
    private captureCount: number, // Number of frames to capture.  Set to zero for no capture
    private canvas: HTMLCanvasElement
  ) {
    this.zip = captureCount ? new JSZip() : null;
  }

  captureFrame(frame: number): void {
    if (frame < this.captureCount) {

      let frameString = frame.toString();
  
      while (frameString.length < 6) {
        frameString = '0' + frameString;
      }
  
      this.canvas.toBlob((blob: Blob) => {
  
        if (this.zip) {
          this.zip.file(`f${frameString}.png`, blob);
  
          if (Object.keys(this.zip.files).length >= this.captureCount) {
            this.zip.generateAsync({type: 'blob'}).then((content) => {
              saveAs(content, 'frames.zip');
            });
  
            this.zip = null;
          }
        }
      });
    }
  }
}

export default FrameCapture;

