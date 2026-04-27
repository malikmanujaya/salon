import { createTheme, alpha } from '@mui/material/styles';
import { palette } from './theme/palette';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.purple,
      light: palette.orchid,
      dark: palette.purpleDark,
      contrastText: palette.white,
    },
    secondary: {
      main: palette.rose,
      light: palette.roseLight,
      dark: palette.roseDark,
      contrastText: palette.purpleDeep,
    },
    accent: {
      main: palette.gold,
      light: palette.goldLight,
      dark: palette.goldDark,
      contrastText: palette.purpleDeep,
    },
    success: {
      main: palette.success,
      dark: palette.successDark,
      light: palette.successLight,
      contrastText: palette.white,
    },
    warning: {
      main: palette.warning,
      dark: palette.warningDark,
      light: palette.warningLight,
      contrastText: palette.purpleDeep,
    },
    background: {
      default: palette.ivory,
      paper: palette.white,
    },
    text: {
      primary: palette.purpleDeep,
      secondary: alpha(palette.purpleDeep, 0.7),
    },
    divider: alpha(palette.purpleDeep, 0.14),
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      fontSize: 'clamp(2rem, 3.5vw, 3rem)',
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
    },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1.05rem' },
    subtitle1: { fontSize: '1.125rem', lineHeight: 1.6 },
    body1: { fontSize: '1rem', lineHeight: 1.7 },
    body2: { fontSize: '0.95rem', lineHeight: 1.65 },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 24,
          paddingBlock: 10,
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${palette.purple} 0%, ${palette.orchid} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.purpleDark} 0%, ${palette.purpleMid} 100%)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
  },
});
