import ReactDOM from 'react-dom';
import * as React from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import * as THREE from 'three';

import {
  boundedMap,
  HALF_PI,
  linearMap,
  loadGeometry,
  outlineMaterial,
  PI,
  QUARTER_PI,
  skin,
} from './common';
import { createHead } from './head';
import FrameLimiter from './FrameLimiter';
import Pentagram from './pentagram';

const cycleLength = 1200; // The number of frames before the animation repeats itself
const captureCount = 100; // Number of frames to capture.  Set to zero for no capture

Promise.all([
  createHead(),
  loadGeometry('bodyGeometry.json'),
  loadGeometry('outlineBodyGeometry.json'),
  loadGeometry('leftFootGeometry.json'),
  loadGeometry('outlineLeftFootGeometry.json'),
  loadGeometry('rightFootGeometry.json'),
  loadGeometry('outlineRightFootGeometry.json'),
]).then(
  ([
    head,
    bodyGeometry,
    outlineBodyGeometry,
    leftFootGeometry,
    outlineLeftFootGeometry,
    rightFootGeometry,
    outlineRightFootGeometry,
  ]) => {
    interface MainState {
      frame: number;
      bodyAngle: number;
      leftFootAngle: number;
      rightFootAngle: number;
    }

    const choreograph = (frame: number): MainState => {
      const watchTowerLength = cycleLength / 4;
      const pentagramLength = (2 * watchTowerLength) / 3;
      const midStepLength = linearMap(
        0.5,
        0,
        1,
        pentagramLength,
        watchTowerLength
      );

      const cycleFrame = frame % cycleLength;
      const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
      const watchTowerFrame = cycleFrame % watchTowerLength;

      const bodyAngle = boundedMap(
        watchTowerFrame,
        pentagramLength,
        watchTowerLength,
        watchTower * HALF_PI,
        (watchTower - 1) * HALF_PI
      );
      const leftFootAngle = boundedMap(
        watchTowerFrame,
        pentagramLength,
        midStepLength,
        watchTower * HALF_PI,
        (watchTower - 1) * HALF_PI
      );
      const rightFootAngle = boundedMap(
        watchTowerFrame,
        midStepLength,
        watchTowerLength,
        watchTower * HALF_PI,
        (watchTower - 1) * HALF_PI
      );

      return {
        frame,
        bodyAngle,
        leftFootAngle,
        rightFootAngle,
      };
    };

    const Main = () => {
      const [state, setState] = React.useState(choreograph(0));

      useFrame((frameState) => {
        // First time in, reposition the camera, because I can't get the perspectiveCamera component to play ball
        if (frameState.camera.position.x === 0) {
          frameState.camera.position.setFromSphericalCoords(
            5,
            HALF_PI,
            QUARTER_PI
          );
          frameState.camera.lookAt(0, 0, 0);
        }

        // Now update the body position based on what frame number this is
        setState(choreograph(state.frame + 1));
      });

      const Body = () => (
        <group rotation={new THREE.Euler(0, state.bodyAngle, 0)}>
          <primitive object={head} />
          <mesh geometry={bodyGeometry} material={skin} />
          <mesh geometry={outlineBodyGeometry} material={outlineMaterial} />
        </group>
      );

      const LeftFoot = () => (
        <group rotation={new THREE.Euler(0, state.leftFootAngle, 0)}>
          <mesh geometry={leftFootGeometry} material={skin} />
          <mesh geometry={outlineLeftFootGeometry} material={outlineMaterial} />
        </group>
      );

      const RightFoot = () => (
        <group rotation={new THREE.Euler(0, state.rightFootAngle, 0)}>
          <mesh geometry={rightFootGeometry} material={skin} />
          <mesh
            geometry={outlineRightFootGeometry}
            material={outlineMaterial}
          />
        </group>
      );

      const Pentagrams = (
        <group>
          {[0, HALF_PI, PI, PI + HALF_PI].map((angle, index) => {

            const position = new THREE.Vector3().setFromCylindricalCoords(0.5, angle - HALF_PI, 0);

            return (
              <group key={index} position={position}>
                <Pentagram angle={angle} />
              </group>
            );
          })}
        </group>
      );

      return (
        <group>
          <Body />
          <LeftFoot />
          <RightFoot />
          {Pentagrams}
        </group>
      );
    };

    const size = captureCount
      ? { width: 800, height: 600 }
      : { width: window.innerWidth - 10, height: window.innerHeight - 20 };

    ReactDOM.render(
      <div style={size}>
        <Canvas>
          <FrameLimiter fps={30} />
          <Main />
        </Canvas>
      </div>,
      document.getElementById('root')
    );
  }
);
