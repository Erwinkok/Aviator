import { ColorManagement } from 'three';

// Keep r115's raw linear palette throughout this standalone game.
ColorManagement.enabled = false;

const Colors = {
  white: 0xffffff,
  offWhite: 0xd8d0d1,
  blue: 0xa8e6ce,
  green: 0xdcedc2,
  orange: 0xffd3b5,
  red: 0xff8c94,
  black: 0x2a363b,
  lightBlack: 0x5a5050,
} as const;

export default Colors;
