import * as THREE from 'three';

interface IThreeBSP {
  toGeometry(): THREE.Geometry;
  toMesh(): THREE.Mesh;
  clone(): IThreeBSP;
  union(other: IThreeBSP): IThreeBSP;
  intersect(other: IThreeBSP): IThreeBSP;
  subtract(other: IThreeBSP): IThreeBSP;
}

interface IThreeBSPConstuctor {
  new (geometry: THREE.Geometry): IThreeBSP;
}

