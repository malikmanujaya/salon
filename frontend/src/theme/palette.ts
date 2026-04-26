/**
 * Global brand palette — single source of truth for colors across theme, CSS, and components.
 * (Property names keep legacy “purple/orchid” keys for stable imports; values are a red theme.)
 */

export const palette = {
  purpleDeep: '#1C0B0B',
  purpleMid: '#7F1D1D',
  purpleDark: '#B91C1C',
  purple: '#DC2626',
  orchid: '#F87171',
  orchidLight: '#FCA5A5',
  rose: '#FECACA',
  roseLight: '#FEE2E2',
  roseDark: '#EF4444',
  gold: '#F97316',
  goldLight: '#FB923C',
  goldDark: '#EA580C',
  ivory: '#FFF5F5',
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
  purple: '220, 38, 38',
  purpleDeep: '28, 11, 11',
  orchid: '248, 113, 113',
  rose: '254, 202, 202',
  ivory: '255, 245, 245',
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
