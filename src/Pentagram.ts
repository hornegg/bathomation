import * as THREE from 'three';

import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';
import { linearMap, TWO_PI } from './common';

const flameCount = 5;

interface Fire extends THREE.Object3D {
  update(time: number): void;
}

export interface Pentagram {
  add: (scene: THREE.Scene) => void;
  remove: (scene: THREE.Scene) => void;
  update: (frame: number) => void;
}

export const createPentagram = (angle: number, textureUrl: string): Pentagram => {
  const textureLoader = new THREE.TextureLoader();
  const tex = textureLoader.load(textureUrl);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createFire = () => new (THREE as any).Fire( tex );

  const fireGroup = new THREE.Group();

  const fires: Fire[] = (new Array(flameCount)).fill(0).map((_, index) => {
    const theta = linearMap(index, 0, flameCount, 0, TWO_PI);
    const radius = 1;

    const fire = createFire();

    /* eslint-disable immutable/no-mutation */
    fire.position.x = -2;
    fire.position.y = radius * Math.sin(theta);
    fire.position.z = radius * Math.cos(theta);
    /* eslint-enable immutable/no-mutation */

    return fire;
  });

  fires.forEach(
    (fire) => fireGroup.add(fire)
  );

  fireGroup.rotateY(angle);

  return {
    add: (scene: THREE.Scene) => {
      scene.add(fireGroup);
    },  
    remove: (scene: THREE.Scene) => {
      scene.remove(fireGroup);
    },
    update(frame: number): void {
      fires.forEach(
        (fire) => fire.update(frame / 25)
      );
    }
  };
};

