/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from 'three';
const ThreeBSP = require('three-js-csg')(THREE);

class ThreeBSPWorkerizer {

  threeBSP;

  constructor(geometry: THREE.Geometry) {
    this.threeBSP = new ThreeBSP(geometry);
  }

  toGeometry(): THREE.Geometry {
    return this.threeBSP.toGeometry();
  } 

  toMesh(): THREE.Mesh {
    return this.threeBSP.toMesh();
  }

  clone(): any {
    return new ThreeBSPWorkerizer(this.threeBSP.clone());
  }

  private csgOperation(methodName: string, other: ThreeBSPWorkerizer): Promise<ThreeBSPWorkerizer> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./ThreeBSPWorker');

      worker.onmessage = (e: MessageEvent): void => {
        resolve(new ThreeBSPWorkerizer(e.data));
      };

      worker.onerror = (e: ErrorEvent): void => {
        reject(e);
      };

      worker.postMessage(methodName, [this.threeBSP.clone(), other.threeBSP.clone()]);
    });
  }

  union(other: ThreeBSPWorkerizer): Promise<ThreeBSPWorkerizer> {
    return this.csgOperation('union', other);
  }

  intersect(other: ThreeBSPWorkerizer): Promise<ThreeBSPWorkerizer> {
    return this.csgOperation('intersect', other);
  }

  subtract(other: ThreeBSPWorkerizer): Promise<ThreeBSPWorkerizer> {
    return this.csgOperation('subtract', other);
  }

}

export default ThreeBSPWorkerizer;

