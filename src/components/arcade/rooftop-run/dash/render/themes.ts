/**
 * The six palettes, one per theme (README.md § Art direction). A palette is
 * everything that changes when the theme does: the sky and its sun or moon,
 * the three depths of town, the roofs Kiru runs on, the rim light on
 * hazards, the glow on the things you press, the corridor and the text.
 *
 * The colour language holds across all six:
 *  - Hazards are dark iron with the brightest rim on screen (`rim`) and a
 *    hot inner edge (`hot`). Scenery never uses either.
 *  - The running line (`edge`) on every roof and block is a saturated theme
 *    hue, never white, so it can't be mistaken for a hazard's rim.
 *  - Interactive things (orbs, pads, gates, portals) glow; scenery doesn't.
 */
import type { ThemeId } from '../types';

export type FarKind = 'fuji' | 'castle' | 'peaks' | 'storm' | 'blossom' | 'ink';

export interface Palette {
  id: ThemeId;
  /** Sky gradient, top to bottom: [stop 0..1, colour]. */
  sky: [number, string][];
  /** The sun or moon: centre as fractions of the view, radius × view height. */
  orb: {
    kind: 'sun' | 'moon' | 'veiled' | 'hinomaru';
    x: number;
    y: number;
    r: number;
    disc: string;
    edge: string;
    halo: string;
    haloA: number;
    marks: string;
  };
  /** Star brightness, 0 (none) .. 1. */
  stars: number;
  cloud: string;
  cloudLit: string;
  cloudA: number;
  /** The backdrop's three depths. */
  farKind: FarKind;
  far: string;
  farLit: string;
  farMist: string;
  mid: string;
  midWin: string;
  midMist: string;
  near: string;
  nearWin: string;
  nearMist: string;
  /** Paper lanterns in the town: body colours. */
  lamp: [string, string];
  /** Neon tubes in the town. */
  neon: string[];
  /** Roofs and blocks. */
  wall: string;
  wallDark: string;
  wallLit: string;
  plaster: string;
  wood: string;
  cap: string;
  capLit: string;
  edge: string;
  win: string;
  winDim: string;
  trim: string;
  /** Hazards: iron, the rim light, the hot inner edge. */
  iron: string;
  ironLit: string;
  rim: string;
  hot: string;
  /** How strongly orbs, pads and gates glow on this sky (0.6 .. 1.2). */
  glow: number;
  corridor: string;
  corridorLit: string;
  text: string;
  textShade: string;
  dust: string;
  weather: {
    rain?: boolean;
    lightning?: boolean;
    petals?: boolean;
    fireworks?: boolean;
    ink?: boolean;
  };
  petal: string;
}

export const PALETTES: Record<ThemeId, Palette> = {
  // First Light: violet sky, a warm horizon, the sun coming up behind Fuji.
  dawn: {
    id: 'dawn',
    sky: [
      [0, '#160f3d'],
      [0.32, '#33205f'],
      [0.58, '#6d3474'],
      [0.8, '#c95f6e'],
      [1, '#ffb070'],
    ],
    orb: {
      kind: 'sun',
      x: 0.72,
      y: 0.7,
      r: 0.13,
      disc: '#fff1cf',
      edge: '#ffc27a',
      halo: '#ff9a5c',
      haloA: 0.55,
      marks: '#ffd9a0',
    },
    stars: 0.4,
    cloud: '#8a4a86',
    cloudLit: '#ffb48a',
    cloudA: 0.55,
    farKind: 'fuji',
    far: '#6a3f86',
    farLit: '#ffc6b0',
    farMist: '#e37a7f',
    mid: '#3e2463',
    midWin: '#ffcf8a',
    midMist: '#a2477a',
    near: '#251642',
    nearWin: '#ffbf6e',
    nearMist: '#5d2a63',
    lamp: ['#ff6f4a', '#ffc46b'],
    neon: ['#ff7ab0', '#ffd27a'],
    wall: '#211640',
    wallDark: '#170f2e',
    wallLit: '#4a3577',
    plaster: '#4b3a72',
    wood: '#3a2346',
    cap: '#33285a',
    capLit: '#9c80d0',
    edge: '#ffb98a',
    win: '#ffc878',
    winDim: '#2b2050',
    trim: '#e8432a',
    iron: '#150f1d',
    ironLit: '#4a3d63',
    rim: '#fffaf2',
    hot: '#ff4d3a',
    glow: 1,
    corridor: '#2b1c50',
    corridorLit: '#ffc690',
    text: '#fff6ea',
    textShade: '#24123e',
    dust: '#e6bfd8',
    weather: { petals: true },
    petal: '#ffc3d6',
  },

  // Lantern Row: a festival night, red-lit from below, fireworks overhead.
  lanterns: {
    id: 'lanterns',
    sky: [
      [0, '#09040c'],
      [0.38, '#24091a'],
      [0.68, '#4d1122'],
      [0.88, '#92241f'],
      [1, '#d9542a'],
    ],
    orb: {
      kind: 'moon',
      x: 0.2,
      y: 0.2,
      r: 0.075,
      disc: '#ffe7c2',
      edge: '#ffc88a',
      halo: '#ff9a6a',
      haloA: 0.32,
      marks: '#e8c08e',
    },
    stars: 0.5,
    cloud: '#5a1525',
    cloudLit: '#ff8a5a',
    cloudA: 0.5,
    farKind: 'castle',
    far: '#3d0f24',
    farLit: '#ff8a4d',
    farMist: '#a02a26',
    mid: '#2a0a1c',
    midWin: '#ffb45a',
    midMist: '#6e1a24',
    near: '#1a0712',
    nearWin: '#ffad4d',
    nearMist: '#4a0e1c',
    lamp: ['#ff4f2e', '#ffcf6b'],
    neon: ['#ff4f9a', '#ffd25a', '#3de1ff'],
    wall: '#1d0b17',
    wallDark: '#140710',
    wallLit: '#5a2232',
    plaster: '#5c2a35',
    wood: '#4a1a20',
    cap: '#3a1828',
    capLit: '#c46a6a',
    edge: '#ffc65e',
    win: '#ffb14d',
    winDim: '#2e0f1c',
    trim: '#ffcf6b',
    iron: '#120a10',
    ironLit: '#4d3040',
    rim: '#ffffff',
    hot: '#ffe066',
    glow: 0.9,
    corridor: '#3a0f20',
    corridorLit: '#ffd08a',
    text: '#fff3e6',
    textShade: '#2a0610',
    dust: '#f0b8a0',
    weather: { fireworks: true },
    petal: '#ffcf9a',
  },

  // Moon Gate: cold blue, and a huge moon behind the pagoda.
  moon: {
    id: 'moon',
    sky: [
      [0, '#02050f'],
      [0.4, '#081633'],
      [0.75, '#123264'],
      [1, '#2e6496'],
    ],
    orb: {
      kind: 'moon',
      x: 0.66,
      y: 0.36,
      r: 0.25,
      disc: '#eef5ff',
      edge: '#bcd4f5',
      halo: '#8fb8ff',
      haloA: 0.42,
      marks: '#b9cbe6',
    },
    stars: 1,
    cloud: '#2a4a80',
    cloudLit: '#cfe0ff',
    cloudA: 0.45,
    farKind: 'peaks',
    far: '#133463',
    farLit: '#d6e8ff',
    farMist: '#2f6aa0',
    mid: '#0c2147',
    midWin: '#ffd28a',
    midMist: '#1e4c80',
    near: '#071530',
    nearWin: '#ffd690',
    nearMist: '#123764',
    lamp: ['#ff6b45', '#ffd27a'],
    neon: ['#3de1ff', '#9bb0ff'],
    wall: '#0a1832',
    wallDark: '#071126',
    wallLit: '#2c4d86',
    plaster: '#2a4470',
    wood: '#182a4c',
    cap: '#1c3463',
    capLit: '#8fb2ee',
    edge: '#7fb6ff',
    win: '#ffd690',
    winDim: '#122448',
    trim: '#e8432a',
    iron: '#0b0d18',
    ironLit: '#3b4766',
    rim: '#ffffff',
    hot: '#ff5a3d',
    glow: 1,
    corridor: '#0f2550',
    corridorLit: '#a9ccff',
    text: '#f2f7ff',
    textShade: '#06102a',
    dust: '#b8cff0',
    weather: {},
    petal: '#dfe9ff',
  },

  // Storm Roofs: teal-grey, rain on the beat, soft lightning.
  storm: {
    id: 'storm',
    sky: [
      [0, '#050b0d'],
      [0.42, '#0f2226'],
      [0.78, '#1f3c42'],
      [1, '#3b5f60'],
    ],
    orb: {
      kind: 'veiled',
      x: 0.3,
      y: 0.24,
      r: 0.09,
      disc: '#cfe8e2',
      edge: '#9fc8c0',
      halo: '#9fd8d0',
      haloA: 0.22,
      marks: '#a8c8c0',
    },
    stars: 0,
    cloud: '#0f2024',
    cloudLit: '#5f8a88',
    cloudA: 0.75,
    farKind: 'storm',
    far: '#1b3638',
    farLit: '#6f9c98',
    farMist: '#2f5254',
    mid: '#10262a',
    midWin: '#ffd27a',
    midMist: '#21403f',
    near: '#09191c',
    nearWin: '#ffcf7a',
    nearMist: '#173032',
    lamp: ['#ff6b45', '#ffd27a'],
    neon: ['#5ef2e0', '#ff7ab8'],
    wall: '#0b191c',
    wallDark: '#071214',
    wallLit: '#2e5658',
    plaster: '#2c4a4c',
    wood: '#1d3032',
    cap: '#1d3a3d',
    capLit: '#86ccc2',
    edge: '#7fe8d8',
    win: '#ffcc74',
    winDim: '#132629',
    trim: '#e8432a',
    iron: '#0a0e10',
    ironLit: '#3a4a4e',
    rim: '#ffffff',
    hot: '#ff6a3d',
    glow: 1.1,
    corridor: '#12292c',
    corridorLit: '#9ff0e2',
    text: '#effcfa',
    textShade: '#041012',
    dust: '#a8c8c4',
    weather: { rain: true, lightning: true },
    petal: '#cfe8e2',
  },

  // Dragon Festival: a pink night under the blossoms, fireworks and petals.
  sakura: {
    id: 'sakura',
    sky: [
      [0, '#10061c'],
      [0.38, '#280d3c'],
      [0.7, '#561a58'],
      [0.9, '#a03872'],
      [1, '#e06c98'],
    ],
    orb: {
      kind: 'moon',
      x: 0.24,
      y: 0.26,
      r: 0.11,
      disc: '#fff0f5',
      edge: '#ffc4dc',
      halo: '#ff9cc4',
      haloA: 0.4,
      marks: '#f0c4d8',
    },
    stars: 0.75,
    cloud: '#4a1650',
    cloudLit: '#ff9cc4',
    cloudA: 0.45,
    farKind: 'blossom',
    far: '#3d1650',
    farLit: '#d0679c',
    farMist: '#9a3a78',
    mid: '#2a0e3c',
    midWin: '#ffc49a',
    midMist: '#6a2060',
    near: '#1a0828',
    nearWin: '#ffc28a',
    nearMist: '#45144c',
    lamp: ['#ff5a8a', '#ffd27a'],
    neon: ['#ff7ad0', '#7ae8ff'],
    wall: '#1b0a26',
    wallDark: '#12061c',
    wallLit: '#552a6a',
    plaster: '#4e2a5e',
    wood: '#3a1640',
    cap: '#3a1a4a',
    capLit: '#d68ac2',
    edge: '#ff9ccc',
    win: '#ffc28a',
    winDim: '#2a1238',
    trim: '#e8432a',
    iron: '#100a16',
    ironLit: '#4a3a5a',
    rim: '#ffffff',
    hot: '#ffd23f',
    glow: 0.95,
    corridor: '#2e1040',
    corridorLit: '#ffbfe0',
    text: '#fff2f8',
    textShade: '#1e0828',
    dust: '#f0c0dc',
    weather: { petals: true, fireworks: true },
    petal: '#ffb7d4',
  },

  // Shadow Dojo: black and vermilion, a red sun, drifting ink.
  dojo: {
    id: 'dojo',
    sky: [
      [0, '#040305'],
      [0.45, '#110d11'],
      [0.78, '#2a1412'],
      [1, '#5e1d12'],
    ],
    orb: {
      kind: 'hinomaru',
      x: 0.7,
      y: 0.46,
      r: 0.27,
      disc: '#e8432a',
      edge: '#b8301c',
      halo: '#ff5a3d',
      haloA: 0.28,
      marks: '#c9361f',
    },
    stars: 0.18,
    cloud: '#1a1416',
    cloudLit: '#7a3a2e',
    cloudA: 0.7,
    farKind: 'ink',
    far: '#2c2426',
    farLit: '#5a4644',
    farMist: '#4a2a24',
    mid: '#151012',
    midWin: '#ff8a4d',
    midMist: '#2e1814',
    near: '#0b0809',
    nearWin: '#ff9450',
    nearMist: '#1e100e',
    lamp: ['#e8432a', '#f0e6d2'],
    neon: ['#e8432a', '#f0e6d2'],
    wall: '#0d0a0c',
    wallDark: '#080607',
    wallLit: '#3a2c2e',
    plaster: '#2e2628',
    wood: '#1c1416',
    cap: '#1e1a1e',
    capLit: '#7a6e70',
    edge: '#ff4a2e',
    win: '#ff8a4d',
    winDim: '#1a1214',
    trim: '#e8432a',
    iron: '#0e0c0e',
    ironLit: '#4a4448',
    rim: '#ffffff',
    hot: '#8ff0ff',
    glow: 1.15,
    corridor: '#1e1416',
    corridorLit: '#ff6a4a',
    text: '#f6f0e6',
    textShade: '#000000',
    dust: '#8a7a78',
    weather: { ink: true },
    petal: '#e8432a',
  },
};

export const THEME_IDS: ThemeId[] = [
  'dawn',
  'lanterns',
  'moon',
  'storm',
  'sakura',
  'dojo',
];
