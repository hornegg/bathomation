import * as THREE from 'three';

import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';
import { linearMap, TWO_PI } from './common';

const flameCount = 10;

interface Fire extends THREE.Object3D {
  update(time: number): void;
}

class Pentagram {

  private fires: Fire[];
  private fireGroup = new THREE.Group();

  constructor(angle: number, textureUrl: string) {

    const textureLoader = new THREE.TextureLoader();
    const tex = textureLoader.load(textureUrl);
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createFire = () => new (THREE as any).Fire( tex );

    this.fires = (new Array(flameCount)).fill(0).map((_, index) => {
      const theta = linearMap(index, 0, flameCount, 0, TWO_PI);
      const radius = 1;

      const fire = createFire();

      fire.position.x = -2;
      fire.position.y = radius * Math.sin(theta);
      fire.position.z = radius * Math.cos(theta);

      fire.renderOrder = -1000;

      return fire;
    });

    this.fires.forEach(
      (fire) => this.fireGroup.add(fire)
    );

    this.fireGroup.rotateY(angle);
  }

  add(scene: THREE.Scene): void {
    scene.add(this.fireGroup);
  }

  remove(scene: THREE.Scene): void {
    scene.remove(this.fireGroup);
  }

  update(frame: number): void {
    this.fires.forEach(
      (fire) => fire.update(frame / 25)
    );
  }

}

export default Pentagram;

