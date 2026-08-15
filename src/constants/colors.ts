import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@mui/material/colors';
import { Colors } from '../types/config';

export const COLOR_MAP = {
  [Colors.Amber]: amber,
  [Colors.Blue]: blue,
  [Colors.BlueGrey]: blueGrey,
  [Colors.Brown]: brown,
  [Colors.Cyan]: cyan,
  [Colors.DeepOrange]: deepOrange,
  [Colors.DeepPurple]: deepPurple,
  [Colors.Green]: green,
  [Colors.Grey]: grey,
  [Colors.Indigo]: indigo,
  [Colors.LightBlue]: lightBlue,
  [Colors.LightGreen]: lightGreen,
  [Colors.Lime]: lime,
  [Colors.Orange]: orange,
  [Colors.Pink]: pink,
  [Colors.Purple]: purple,
  [Colors.Red]: red,
  [Colors.Teal]: teal,
  [Colors.Yellow]: yellow,
} as const;

export const COLOR_LABEL_MAP = {
  [Colors.Amber]: 'amber',
  [Colors.Blue]: 'blue',
  [Colors.BlueGrey]: 'blueGrey',
  [Colors.Brown]: 'brown',
  [Colors.Cyan]: 'cyan',
  [Colors.DeepOrange]: 'deepOrange',
  [Colors.DeepPurple]: 'deepPurple',
  [Colors.Green]: 'green',
  [Colors.Grey]: 'grey',
  [Colors.Indigo]: 'indigo',
  [Colors.LightBlue]: 'lightBlue',
  [Colors.LightGreen]: 'lightGreen',
  [Colors.Lime]: 'lime',
  [Colors.Orange]: 'orange',
  [Colors.Pink]: 'pink',
  [Colors.Purple]: 'purple',
  [Colors.Red]: 'red',
  [Colors.Teal]: 'teal',
  [Colors.Yellow]: 'yellow',
} as const;

export const DEFAULT_COLOR_SHADE = 500;

export const LIGHT_SECONDARY_COLOR_SHADE = 'A700';

export const DARK_SECONDARY_COLOR_SHADE = 'A100';

export const SORTED_COLOR_ENTRIES = (() => {
  const getHueKey = (hex: string) => {
    const int = parseInt(hex.substring(1), 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // 无色相
    if (delta === 0) return Infinity;

    let h;
    if (max === r) {
      h = (g - b) / delta;
      if (h < 0) h += 6;
    } else if (max === g) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    return h;
  };
  return Object.entries(COLOR_MAP).sort(
    (a, b) =>
      getHueKey(a[1][DEFAULT_COLOR_SHADE]) -
      getHueKey(b[1][DEFAULT_COLOR_SHADE]),
  );
})();
