import * as fs from 'fs';
import * as globalJsDom from 'jsdom-global';
import * as Canvas from 'canvas';
import { PNG } from 'pngjs';

globalJsDom();
global.ImageData = Canvas.ImageData;
window.ImageData = Canvas.ImageData;

import * as p5 from 'p5';

export { p5 };

export default p5;

//export const readPng = (filename: string): Promise<p5.Image> => {
//};

export const readPngSync = (filename: string): p5.Image => {

  const buffer = fs.readFileSync(filename);
  const png = PNG.sync.read(buffer);

  const img = new p5.Image();
  img.resize(png.width, png.height);
  img.loadPixels();

  Array.from(png.data).forEach((value, index) => {
    if (index < img.pixels.length) {
      img.pixels[index] = value;
    }
  });
  
  img.updatePixels();

  return img;
};

export const writePng = (g: p5 | p5.Image | p5.Graphics, filename: string): Promise<void> => {
  return new Promise((resolve) => {

    g.loadPixels();
    const png = new PNG({width: g.width, height: g.height});
    png.data = Buffer.from(g.pixels);

    const writeStream = fs.createWriteStream(filename);
    writeStream.on('close', resolve);
    png.pack().pipe(writeStream);
  });
};

export const writePngSync = (g: p5 | p5.Image | p5.Graphics, filename: string): void => {

  g.loadPixels();
  const png = new PNG({width: g.width, height: g.height});
  png.data = Buffer.from(g.pixels);

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filename, buffer);
};


