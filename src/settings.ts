/* eslint-disable @typescript-eslint/no-unused-vars */
import { SettingsInterface, WatchTowers} from './SettingsInterface';

const watchTowersBlank: WatchTowers = {
  name: ['', '', '', ''],
  color: ['yellow', 'red', 'blue', 'green'],
};

const watchTowersGD: WatchTowers = {
  name: ['Iahveh', 'Adonai', 'Eheieh', 'Alga'],
  color: ['yellow', 'red', 'blue', 'green'],
};

const watchTowersAngels: WatchTowers = {
  name: ['Raphael', 'Michael', 'Gabriel', 'Auriel'],
  color: ['yellow', 'red', 'blue', 'green'],
};

const watchTowersQuillhoth: WatchTowers = {
  name: ['Leviathan', 'Belial', 'Lucifer', 'Satan'],
  color: ['blue', 'green', 'yellow', 'red', ],
};

const settings: SettingsInterface = {
  cycleLength: 1200,
  invertPentagrams: false,
  frameCapture: true,
  watchTowers: watchTowersBlank,
};

export default settings;

