import {p5, readPngSync, writePngSync} from './p5Headless';

new p5((p: p5) => {

  p.setup = () => {

    const img = readPngSync(`${__dirname}/../src/THREE.Fire/Fire.png`);

    writePngSync(img, `${__dirname}/../dist/RedFire.png`);

    process.exit(0);
  };

});

