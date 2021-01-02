/* global require, global, window, document, Buffer, module */

const fs = require('fs');
const globalJsDom = require('jsdom-global');
const Canvas = require('canvas');
const PNG = require('pngjs').PNG;

globalJsDom();
global.ImageData = Canvas.ImageData;
window.ImageData = Canvas.ImageData;

// hack to get error handling working
document._ownerDocument = document;
document._defaultView = window;

const p5 = require('p5');

const readPng = (filename) => {
  return new Promise((resolve) => {
   
  fs.createReadStream(filename)
    .pipe(new PNG())
    .on('parsed', function () {
      const img = new p5.Image();
      img.resize(this.width, this.height);
      img.loadPixels();
      img.pixels = Array.from(this.data);
      img.updatePixels();
      resolve(img);
    });
  });
};

const readPngSync = (filename) => {

  const buffer = fs.readFileSync(filename);
  const png = PNG.sync.read(buffer);

  const img = new p5.Image();
  img.resize(png.width, png.height);
  img.loadPixels();
  img.pixels = Array.from(this.data);
  img.updatePixels();
  return img;
};

const writePng = (g, filename) => {
  return new Promise((resolve) => {

    g.loadPixels();
    const png = new PNG({width: g.width, height: g.height});
    png.data = Buffer.from(g.pixels);

    const writeStream = fs.createWriteStream(filename);
    writeStream.on('close', resolve);
    png.pack().pipe(writeStream);
  });
};

const writePngSync = (g, filename) => {

  g.loadPixels();
  const png = new PNG({width: g.width, height: g.height});
  png.data = Buffer.from(g.pixels);

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(filename, buffer);
};

module.exports = {
  p5,
  default: p5,
  readPng,
  readPngSync,
  writePng,
  writePngSync
};

