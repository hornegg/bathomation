import * as THREE from 'three';
import * as React from 'react';
import 'react-three-fiber';

import { createEllipsoid } from '../model/commonGeometry';
import { cartesianToSpherical, outlineMaterial, skin } from './common';

const girth = 0.3;
const length = 0.7;

class ArmProps {
  pointAt: THREE.Vector3;
  sign: 1 | -1;
}

const Arm = (props: ArmProps): JSX.Element => {
  const armEllipsoid = new THREE.Mesh(
    createEllipsoid(length, girth, girth, 0),
    skin
  );

  const outlineEllipsoid = new THREE.Mesh(
    createEllipsoid(length, girth, girth, 0.07),
    outlineMaterial
  );

  armEllipsoid.translateX(-length);
  outlineEllipsoid.translateX(-length);

  const arm = new THREE.Group();

  arm.add(armEllipsoid);
  arm.add(outlineEllipsoid);

  // Attach the arm to the body
  arm.translateX(props.sign * 0.75);
  arm.translateY(-1.1);

  const polar = cartesianToSpherical(...props.pointAt.toArray());
  arm.rotateX(polar.theta);
  arm.rotateY(polar.phi);

  return <primitive object={arm} />;
};

export default Arm;
