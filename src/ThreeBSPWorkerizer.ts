/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from 'three';
import {IThreeBSP, IThreeBSPConstuctor} from './ThreeBSP';

const ThreeBSP: IThreeBSPConstuctor = require('three-js-csg')(THREE);
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

class ThreeBSPWorkerizer {

  private threeBSP$: Observable<IThreeBSP>;

  constructor(geometry: THREE.Geometry | Promise<IThreeBSP>) {
    const subject = new BehaviorSubject(null);

    if (geometry instanceof THREE.Geometry) {
      subject.next(new ThreeBSP(geometry));
    } else {
      geometry.then((resolved) => {
        subject.next(resolved.clone());
      });
    }

    this.threeBSP$ = subject.asObservable().pipe(
      filter((value) => !!value)
    );
  }

  toGeometry(): Promise<THREE.Geometry> {
    return this.threeBSP$.toPromise().then((bsp) => bsp.toGeometry());
  } 

  toMesh(): Promise<THREE.Mesh> {
    return this.threeBSP$.toPromise().then((bsp) => bsp.toMesh());
  }

  clone(): ThreeBSPWorkerizer {
    return new ThreeBSPWorkerizer(this.threeBSP$.toPromise());
  }

  private csgOperation(methodName: string, other: ThreeBSPWorkerizer): ThreeBSPWorkerizer {
    return new ThreeBSPWorkerizer(this.threeBSP$.toPromise().then((threeBSP) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker('./ThreeBSPWorker');

        worker.onmessage = (e: MessageEvent): void => {
          resolve(e.data);
        };

        worker.onerror = (e: ErrorEvent): void => {
          reject(e);
        };

//        worker.postMessage(methodName, [threeBSP.clone(), other.clone()]);
        methodName;
        threeBSP;
        other;
      });
    }));
  }

  union(other: ThreeBSPWorkerizer): ThreeBSPWorkerizer {
    return this.csgOperation('union', other);
  }

  intersect(other: ThreeBSPWorkerizer): ThreeBSPWorkerizer {
    return this.csgOperation('intersect', other);
  }

  subtract(other: ThreeBSPWorkerizer): ThreeBSPWorkerizer {
    return this.csgOperation('subtract', other);
  }

}

export default ThreeBSPWorkerizer;

