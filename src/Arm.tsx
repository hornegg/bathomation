import * as THREE from 'three';
import * as React from 'react';
import 'react-three-fiber';

import { linearMap, outlineMaterial, skin, TWO_PI } from './common';

const parametricEllipsoid = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  maxGirth: number
) => {
  const vec = end.clone().sub(start);
  const crossx = new THREE.Vector3(1, 0, 0).cross(vec);
  const crossy = new THREE.Vector3(0, 1, 0).cross(vec);
  // If v is zero-length, we'll end up drawing everything at a single point, which is correct.
  // Otherwise he larger of these two cross products is guaranteed to be perpendicular.
  // The smaller one might be zero-length as a consequence of taking the cross product of two parallel vectors.
  const perp1 =
    crossx.lengthSq() > crossy.lengthSq()
      ? crossx.normalize()
      : crossy.normalize();
  // Now find one that is perpendicular to both the original vector and the first perpendicular
  const perp2 = perp1.clone().cross(vec).normalize();

  return (u: number, v: number, dest: THREE.Vector3) => {
    dest.set(
      linearMap(u, 0, 1, start.x, end.x),
      linearMap(u, 0, 1, start.y, end.y),
      linearMap(u, 0, 1, start.z, end.z)
    );

    const circlePosition = 2 * Math.abs(u - 0.5);
    const girth = maxGirth * Math.sqrt(1 - circlePosition);
    const angle = linearMap(v, 0, 1, 0, TWO_PI);
    const component1 = perp1.clone().multiplyScalar(girth * Math.cos(angle));
    const component2 = perp2.clone().multiplyScalar(girth * Math.sin(angle));

    dest.add(component1);
    dest.add(component2);
  };
};

const girth = 0.3;
const length = 1.4;

class ArmProps {
  pointAt: THREE.Vector3;
  sign: 1 | -1;
  rotateY: number;
}

const Arm = (props: ArmProps): JSX.Element => {
  const start = new THREE.Vector3(props.sign * 0.75, -1.1, 0);

  const end: THREE.Vector3 = props.pointAt
    .clone()
    .sub(start)
    .normalize()
    .multiplyScalar(length)
    .add(start);

  const armEllipsoid = new THREE.Mesh(
    new THREE.ParametricGeometry(
      parametricEllipsoid(start, end, girth),
      20,
      20
    ),
    skin
  );

  const arm = new THREE.Group();

  arm.add(armEllipsoid);
  //  arm.add(outlineEllipsoid);

  return <primitive object={arm} />;
};

export default Arm;
