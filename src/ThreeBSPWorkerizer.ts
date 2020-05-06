/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from 'three';
import {IThreeBSP, IThreeBSPConstuctor} from './ThreeBSP';

const ThreeBSP: IThreeBSPConstuctor = require('three-js-csg')(THREE);
import {BehaviorSubject, Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

class ThreeBSPWorkerizer {

  public subject: BehaviorSubject<IThreeBSP> = new BehaviorSubject(null);

  public threeBSP$: Observable<IThreeBSP> = this.subject.asObservable().pipe(
    filter((value) => !!value)
  );

  constructor(geometry: THREE.Geometry | Promise<IThreeBSP>) {

    if (geometry instanceof THREE.Geometry) {
      this.subject.next(new ThreeBSP(geometry));
    } else {
      geometry.then((resolved) => {
        this.subject.next(resolved.clone());
      });
    }

    this.threeBSP$ = this.subject.asObservable().pipe(
      filter((value) => !!value)
    );
  }

  toPromise(): Promise<IThreeBSP> {
    return this.subject.value ? Promise.resolve(this.subject.value) : this.threeBSP$.toPromise();
  }

  toGeometry(): Promise<THREE.Geometry> {
    return this.toPromise().then((bsp) => bsp.toGeometry());
  } 

  toMesh(): Promise<THREE.Mesh> {
    return this.toPromise().then((bsp) => bsp.toMesh());
  }

  clone(): ThreeBSPWorkerizer {
    return new ThreeBSPWorkerizer(this.toPromise());
  }

  private csgOperation(methodName: string, other: ThreeBSPWorkerizer): ThreeBSPWorkerizer {
    return new ThreeBSPWorkerizer(this.toPromise().then((threeBSP) => {
      return new Promise((resolve, reject) => {
        const worker = new Worker('./ThreeBSPWorker.ts');

        worker.onmessage = (e: MessageEvent): void => {
          resolve(e.data);
        };

        worker.onerror = (e: ErrorEvent): void => {
          reject(e);
        };

        worker.postMessage(methodName/*, [threeBSP.clone(), other.clone()]*/);
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

