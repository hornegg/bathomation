import {p5, readPngSync, writePngSync} from './p5Headless';

new p5((p: p5) => {

  const changeHues = (img: p5.Image, adjustment: number) => {
    for (let x = 0; x < img.width; ++x) {
      for (let y = 0; y < img.height; ++y) {

        p.colorMode(p.RGB);
        const oldColor = p.color(img.get(x, y));

        let h = p.hue(oldColor);
        const s = p.saturation(oldColor);
        const b = p.brightness(oldColor);

        h += adjustment;
        p.colorMode(p.HSB);
        const newColor = p.color(h, s, b);
        img.set(x, y, newColor);
      }
    }

    img.updatePixels();
  };

  p.setup = () => {

    const imgBlue = readPngSync(`${__dirname}/../src/THREE.Fire/Fire.png`);
    const imgGreen = readPngSync(`${__dirname}/../src/THREE.Fire/Fire.png`);
    const imgYellow = readPngSync(`${__dirname}/../src/THREE.Fire/Fire.png`);
    const imgRed = readPngSync(`${__dirname}/../src/THREE.Fire/Fire.png`);

    changeHues(imgBlue, 256);
    writePngSync(imgBlue, '${__dirname}/../dist/blueFire.png');

    changeHues(imgGreen, 128);
    writePngSync(imgGreen, '${__dirname}/../dist/greenFire.png');

    changeHues(imgYellow, 64);
    writePngSync(imgYellow, '${__dirname}/../dist/yellowFire.png');

    changeHues(imgRed, 0);
    writePngSync(imgRed, '${__dirname}/../dist/redFire.png');

    process.exit(0);
  };

});

