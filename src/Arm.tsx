import * as THREE from 'three';
import * as React from 'react';
import 'react-three-fiber';

import { createEllipsoid } from '../model/commonGeometry';
import { outlineMaterial, skin } from './common';

const girth = 0.3;
const length = 0.7;

class ArmProps {
  lookAt: THREE.Vector3;
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

  arm.translateX(props.sign * 0.75);
  arm.translateY(-1.3);

  arm.lookAt(props.lookAt);
  return <primitive object={arm} />;
};

export default Arm;
