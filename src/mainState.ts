interface LayerInfo {
  topFlames: boolean;
  baphomet: boolean;
  bottomFlames: boolean;
}

export interface MainState {
  frame: number;
  bodyAngle: number;
  leftFootAngle: number;
  rightFootAngle: number;
  layerInfo: LayerInfo;
}
