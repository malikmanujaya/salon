/**
 * Global brand palette — single source of truth for colors across theme, CSS, and components.
 * (Property names keep legacy “purple/orchid” keys for stable imports; values tuned for a pink touch vibe.)
 */

export const palette = {
  purpleDeep: '#2A111C',
  purpleMid: '#7A2E56',
  purpleDark: '#A53E73',
  purple: '#D85B95',
  orchid: '#E88AB3',
  orchidLight: '#F4BED7',
  rose: '#F8DCE8',
  roseLight: '#FDF1F7',
  roseDark: '#CE5E90',
  gold: '#E8A1BC',
  goldLight: '#F2C5D8',
  goldDark: '#C87097',
  ivory: '#FFF6FA',
  white: '#FFFFFF',
  success: '#16A34A',
  successDark: '#166534',
  successLight: '#4ADE80',
  warning: '#CA8A04',
  warningDark: '#A16207',
  warningLight: '#FACC15',
} as const;

export type BrandPalette = typeof palette;

/** RGB channels for rgba() (comma-separated values only). */
export const paletteRgb = {
  purple: '216, 91, 149',
  purpleDeep: '42, 17, 28',
  orchid: '232, 138, 179',
  rose: '248, 220, 232',
  ivory: '255, 246, 250',
} as const;

export const rgbaFrom = (channel: keyof typeof paletteRgb, a: number) =>
  `rgba(${paletteRgb[channel]}, ${a})`;

export const gradients = {
  loginPanel: `linear-gradient(155deg, ${palette.purpleDeep} 0%, ${palette.purpleMid} 38%, ${palette.purple} 72%, ${palette.orchidLight} 100%)`,
  signupPanel: `linear-gradient(165deg, ${palette.purpleDark} 0%, ${palette.purple} 42%, ${palette.orchid} 88%, ${palette.rose} 100%)`,
  heroHeading: `linear-gradient(135deg, ${palette.orchid} 0%, ${palette.purple} 50%, ${palette.rose} 100%)`,
  showcaseCard: `linear-gradient(135deg, ${palette.purple}, ${palette.rose})`,
  heroCta: `linear-gradient(135deg, ${palette.orchid}, ${palette.purple})`,
  roseOrchidPurple: `linear-gradient(135deg, ${palette.rose} 0%, ${palette.orchid} 50%, ${palette.purple} 100%)`,
  ivoryWhiteIvory: `linear-gradient(180deg, ${palette.ivory} 0%, ${palette.white} 50%, ${palette.ivory} 100%)`,
} as const;

export const elevationShadow = {
  logoIcon: `0 8px 24px ${rgbaFrom('purple', 0.25)}`,
  heroPreviewCard: `0 30px 80px -20px ${rgbaFrom('purple', 0.35)}, 0 10px 30px -10px ${rgbaFrom('purpleDeep', 0.15)}`,
  floatingSmsCard: `0 20px 50px -10px ${rgbaFrom('purpleDeep', 0.4)}`,
  floatingStatCard: `0 15px 40px -10px ${rgbaFrom('purpleDeep', 0.2)}`,
  authFormPaper: `0 24px 48px -24px ${rgbaFrom('purpleDeep', 0.12)}`,
  showcaseCalendar: `0 30px 80px -30px ${rgbaFrom('purple', 0.3)}`,
} as const;

const CSS_PREFIX = '--lum-';

/** Sync global.css variables with the TS palette (body bg, selection, scrollbar). */
export function applyThemeCssVariables(root: HTMLElement = document.documentElement) {
  const s = root.style;
  s.setProperty(`${CSS_PREFIX}ivory`, palette.ivory);
  s.setProperty(`${CSS_PREFIX}white`, palette.white);
  s.setProperty(`${CSS_PREFIX}orchid`, palette.orchid);
  s.setProperty(`${CSS_PREFIX}scrollbar-thumb`, rgbaFrom('purple', 0.25));
  s.setProperty(`${CSS_PREFIX}scrollbar-thumb-hover`, rgbaFrom('purple', 0.45));
}
