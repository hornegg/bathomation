import {p5, readPngSync, writePngSync} from './p5Headless';
import * as path from 'path';
import {times} from 'lodash';

new p5((p: p5) => {

  const changeHues = (img: p5.Image, adjustment: number) => {
    times(img.width, x => {
      times(img.height, y => {

        p.colorMode(p.RGB);
        const oldColor = p.color(img.get(x, y));

        const oldHue = p.hue(oldColor);
        const s = p.saturation(oldColor);
        const b = p.brightness(oldColor);

        const newHue = oldHue + adjustment;
        p.colorMode(p.HSB);
        const newColor = p.color(newHue, s, b);
        img.set(x, y, newColor);
      });
    });

    img.updatePixels();
  };

  // eslint-disable-next-line immutable/no-mutation
  p.setup = () => {

    const src = path.join(__dirname, '../src/THREE.Fire/Fire.png');

    const imgBlue = readPngSync(src);
    const imgGreen = readPngSync(src);
    const imgYellow = readPngSync(src);
    const imgRed = readPngSync(src);
/*
    for (let adj = 0; adj < 512; adj += 16) {
      const img = readPngSync(src);
      changeHues(img, adj);
      writePngSync(img, path.join(__dirname, `/../dist/Fire${adj}.png`));
    } 
*/
    changeHues(imgBlue, 212);
    writePngSync(imgBlue, path.join(__dirname, '/../dist/blueFire.png'));

    changeHues(imgGreen, 60);
    writePngSync(imgGreen, path.join(__dirname, '/../dist/greenFire.png'));

    changeHues(imgYellow, 12);
    writePngSync(imgYellow, path.join(__dirname, '/../dist/yellowFire.png'));

    changeHues(imgRed, -16);
    writePngSync(imgRed, path.join(__dirname, '/../dist/redFire.png'));

    process.exit(0);
  };

});

