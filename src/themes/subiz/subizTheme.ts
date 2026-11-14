import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
const fontSizes = {
    '--font-size-base': '1rem',
    '--font-size-4xs': '0.875rem',
    '--font-size-3xs': '0.875rem',
    '--font-size-2xs': '0.875rem',
    '--font-size-xs': '0.875rem',
    '--font-size-sm': '0.875rem',
} as const;
export const subizTheme = defineTheme({
  name: 'subiz',
  extends: neutralTheme,
  adaptations: {
    rules: [{when: {pointer: 'coarse', width: {below: 'lg'}}, value: {tokens: fontSizes}}],
  },
  tokens: {
    ...fontSizes,
    '--text-body-leading': '1.5',
    '--text-code-leading': '1.5',
    '--color-accent': '#0d6efd',
    '--color-on-accent': '#ffffff',
    '--color-accent-muted': ['#dceaff', '#123967'],
  },
});
