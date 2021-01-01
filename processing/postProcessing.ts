import * as path from 'path';
import { performance } from 'perf_hooks';

import { times } from 'lodash';
import * as pLimit from 'p-limit';

import { p5, readPng, writePng } from './p5Headless';
import settings from '../src/settings';

const usage = 'usage: ts-node postProcessing.ts [offset] [frameCount]';

if (process.argv.length !== 4) {
  console.error(usage);
  console.error();
  process.exit(1);
}

const offset = parseInt(process.argv[2]);
const frameCount = parseInt(process.argv[3]);

if (isNaN(offset)) {
  console.error(usage);
  console.error('offset is not a number');
  console.error();
  process.exit(1);
}

if (isNaN(frameCount)) {
  console.error(usage);
  console.error('frameCount is not a number');
  console.error();
  process.exit(1);
}

const start = performance.now();

const inputDir = path.resolve(path.join(__dirname, '..', 'dist', 'rawFrames'));
const outputDir = path.resolve(path.join(__dirname, '..', 'dist', 'frames'));

const getFrameFilename = (frame: number) => {
  const frameString = frame.toString().padStart(6, '0');
  return `f${frameString}.png`;
};

const getInputFrameFilename = (frame: number) =>
  path.join(inputDir, getFrameFilename(frame));

const getOutputFrameFilename = (frame: number) =>
  path.join(outputDir, getFrameFilename(frame));

const limit = pLimit(8);

new p5((p: p5) => {
  const changeHues = (img: p5.Image, adjustment: number) => {
    times(img.width, (x) => {
      times(img.height, (y) => {
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
  p.setup = async () => {
    const framePromises = times(frameCount, (index) => limit(() => {
      const frame = offset + index;
      return Promise.all([
        readPng(getInputFrameFilename(frame)),
        readPng(getInputFrameFilename(frame + settings.cycleLength)),
        readPng(
          getInputFrameFilename(
            frame + settings.cycleLength + settings.cycleLength
          )
        ),
      ]).then(([topFlames, baphomet, bottomFlames]) => {
        const g = p.createGraphics(settings.width, settings.height);
        g.background(255);
        g.image(bottomFlames, 0, 0);
        g.image(baphomet, 0, 0);
        g.image(topFlames, 0, 0);
        return writePng(g, getOutputFrameFilename(frame));
      });
    }));

    await Promise.all(framePromises);

    const end = performance.now();

    console.log(`Post-processed frames ${offset} to ${offset + frameCount - 1} in ${((end - start) / 1000).toFixed(1)} seconds`);

    process.exit(0);

    /*
    const src = path.join(__dirname, '../src/THREE.Fire/Fire.png');

    const imgBlue = readPngSync(src);
    const imgGreen = readPngSync(src);
    const imgYellow = readPngSync(src);
    const imgRed = readPngSync(src);

    changeHues(imgBlue, 212);
    writePngSync(imgBlue, path.join(__dirname, '/../dist/blueFire.png'));

    changeHues(imgGreen, 60);
    writePngSync(imgGreen, path.join(__dirname, '/../dist/greenFire.png'));

    changeHues(imgYellow, 12);
    writePngSync(imgYellow, path.join(__dirname, '/../dist/yellowFire.png'));

    changeHues(imgRed, -16);
    writePngSync(imgRed, path.join(__dirname, '/../dist/redFire.png'));
*/
  };
});
