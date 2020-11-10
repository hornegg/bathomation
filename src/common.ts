import * as THREE from 'three';
import { BufferGeometry } from 'three';

export const PI = Math.PI;
export const TWO_PI = 2 * PI;
export const HALF_PI = 0.5 * PI;
export const QUARTER_PI = 0.25 * PI;

export const linearMap = (value: number, range1start: number, range1end: number, range2start: number, range2end: number): number => {
  return range2start + (range2end - range2start) * ((value - range1start) / (range1end - range1start));
};

export const boundedMap = (value: number, range1start: number, range1end: number, range2start: number, range2end: number): number => {
  const value2 = linearMap(value, range1start, range1end, 0, 1);
  if (value2 < 0) {
    return range2start;
  } else if (value2 < 1) {
    return linearMap(value, range1start, range1end, range2start, range2end);
  } else {
    return range2end;
  }
};

export const headWidth = 1.5;
export const headHeight = 1;
export const headDepth = 1;

export const ellipticalToCartesian = (r: number, theta: number, phi: number, vec?: THREE.Vector3): THREE.Vector3 => {

  vec = vec ? vec : new THREE.Vector3();

  return vec.set(
    r * headWidth * Math.sin(theta) * Math.cos(phi),
    r * headHeight * Math.sin(theta) * Math.sin(phi),
    r * headDepth * Math.cos(theta)
  );
};

//
// Materials
//

export const skin = new THREE.MeshBasicMaterial({color: 0x333333, side: THREE.DoubleSide});
export const outlineMaterial = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});
export const outlineMaterialDouble = new THREE.MeshBasicMaterial({color: 'black', side: THREE.DoubleSide});
export const redMaterial = new THREE.MeshBasicMaterial({color: 'red', side: THREE.DoubleSide});

//
// Basic shapes upon the ellipical head
//

interface TubeParameters {
  thetaStart: number;
  phiStart: number;
  thetaEnd: number;
  phiEnd: number;
  radius: number;
}

export const createTube = (param: TubeParameters): THREE.TubeGeometry => {

  class Tube extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const theta = linearMap(t, 0, 1, param.thetaStart, param.thetaEnd);
      const phi = linearMap(t, 0, 1, param.phiStart, param.phiEnd);
      return ellipticalToCartesian(
        1,
        theta,
        phi
      );
    }
  }

  return new THREE.TubeGeometry(new Tube, 100, param.radius, 100, false);
};

interface ArcParameters {
  centerTheta: number;
  centerPhi: number;
  thetaRadius: number;
  phiRadius: number;
  tubeRadius: number;
  startAngle: number;
  finishAngle: number;
}

export const createArc = (param: ArcParameters): THREE.TubeGeometry => {

  class Arc extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const angle = linearMap(t, 0, 1, param.startAngle, param.finishAngle);
      return ellipticalToCartesian(
        1,
        param.centerTheta + (param.thetaRadius * Math.cos(angle)),
        param.centerPhi + (param.phiRadius * Math.sin(angle))
      );
    }
  }

  return new THREE.TubeGeometry(new Arc, 100, param.tubeRadius, 100, false);
};

//
// loadGeometry
//

export const loadGeometry = (filename: string): Promise<BufferGeometry> => {

  return new Promise((resolve, reject) => {

    (new THREE.BufferGeometryLoader()).load(
      filename,
      (geometry) => resolve(geometry),
      null,
      (error: ErrorEvent) => reject(error)
    );

  });
};

