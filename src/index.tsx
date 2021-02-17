import ReactDOM from 'react-dom';
import * as React from 'react';
import { Canvas, CanvasContext, useFrame } from 'react-three-fiber';
import * as THREE from 'three';

import {
  HALF_PI,
  linearMap,
  loadGeometry,
  outlineMaterial,
  segmentedMap,
  skin,
} from './common';

import { createHead } from './head';
import { Pentagram } from './pentagram';
import FrameLimiter from './components/FrameLimiter';
import FrameRate from './components/FrameRate';
import settings from './settings';
import FrameCapture from './components/FrameCapture';
import getCameraPosition from './getCameraPosition';
import Room from './Room';
import Arm from './Arm';

const watchTowerLength = settings.cycleLength / 4;
const pentagramLength = (2 * watchTowerLength) / 3;

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
    interface LayerInfo {
      topFlames: boolean;
      baphomet: boolean;
      bottomFlames: boolean;
    }

    interface MainState {
      frame: number;
      bodyAngle: number;
      leftFootAngle: number;
      rightFootAngle: number;
      layerInfo: LayerInfo;
    }

    const choreograph = (frame: number): MainState => {
      const midStepLength = linearMap(
        0.5,
        0,
        1,
        pentagramLength,
        watchTowerLength
      );

      const cycleFrame = frame % settings.cycleLength;
      const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
      const watchTowerFrame = cycleFrame % watchTowerLength;

      const bodyAngle = segmentedMap(
        watchTowerFrame,
        [pentagramLength, watchTowerLength],
        [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
      );

      const leftFootAngle = segmentedMap(
        watchTowerFrame,
        [pentagramLength, midStepLength],
        [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
      );

      const rightFootAngle = segmentedMap(
        watchTowerFrame,
        [midStepLength, watchTowerLength],
        [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
      );

      const layer = Math.floor(frame / settings.cycleLength) % 3;

      const layerInfo = settings.frameCapture
        ? {
            topFlames: layer === 0,
            baphomet: layer === 1,
            bottomFlames: layer === 2,
          }
        : { topFlames: true, baphomet: true, bottomFlames: true };

      return {
        frame,
        bodyAngle,
        leftFootAngle,
        rightFootAngle,
        layerInfo,
      };
    };

    const Main = () => {
      const [state, setState] = React.useState(choreograph(0));

      useFrame((canvasContext: CanvasContext) => {
        const [x, y, z] = getCameraPosition(state.frame).toArray();
        const yAdjust = 0.4;
        canvasContext.camera.position.set(x, y + yAdjust, z);
        canvasContext.camera.lookAt(0, -0.6 + yAdjust, 0);

        // Now update the body position based on what frame number this is
        setState(choreograph(state.frame + 1));
      });

      const Body = () => (
        <group rotation={new THREE.Euler(0, state.bodyAngle, 0)}>
          <primitive object={head} />
          <mesh geometry={bodyGeometry} material={skin} />
          <mesh geometry={outlineBodyGeometry} material={outlineMaterial} />
          <Arm lookAt={new THREE.Vector3(10 * Math.cos(0.1 * state.frame), 10 * Math.sin(0.1 * state.frame), 10)} />
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

      const watchtowers = [
        ...(state.layerInfo.topFlames ? [0, 1] : []),
        ...(state.layerInfo.bottomFlames ? [2, 3] : []),
      ];

      const Pentagrams = (
        <group>
          {watchtowers.map((watchTowerIndex) => {
            const angle = -watchTowerIndex * HALF_PI;
            const position = new THREE.Vector3().setFromCylindricalCoords(
              0.5,
              angle - HALF_PI,
              0
            );
            const startFrame = watchTowerIndex * watchTowerLength;
            const endFrame = startFrame + pentagramLength;

            return (
              <group key={watchTowerIndex} position={position}>
                <Pentagram
                  angle={angle}
                  startFrame={startFrame}
                  endFrame={endFrame}
                />
              </group>
            );
          })}
        </group>
      );

      const baphomet = (
        <group>
          <Body />
          <LeftFoot />
          <RightFoot />
        </group>
      );

      return (
        <group>
          {state.layerInfo.baphomet ? baphomet : <></>}
          {Pentagrams}
          {state.layerInfo.baphomet ? <Room /> : <></>}
        </group>
      );
    };

    ReactDOM.render(
      <div
        style={{
          width: settings.width,
          height: settings.height,
          border: 'solid 1px black',
        }}
      >
        <Canvas>
          <FrameLimiter fps={settings.fps} />
          <FrameRate logger={console.log} />
          {settings.frameCapture ? (
            <FrameCapture
              startFrame={0}
              endFrame={settings.cycleLength * 3}
              filename="frames.zip"
              getCanvas={() => document.getElementsByTagName('canvas')[0]}
            />
          ) : (
            <></>
          )}
          <Main />
        </Canvas>
      </div>,
      document.getElementById('root')
    );
  }
);
