import { createTheme, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

const PURPLE_DEEP = '#1A0F1F';
const PURPLE = '#7B2CBF';
const ORCHID = '#C77DFF';
const ROSE = '#E8B4B8';
const GOLD = '#D4A574';
const IVORY = '#FAF6F2';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: PURPLE,
      light: ORCHID,
      dark: '#5A189A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ROSE,
      light: '#F4D4D6',
      dark: '#C48A8E',
      contrastText: PURPLE_DEEP,
    },
    accent: {
      main: GOLD,
      light: '#E6C49A',
      dark: '#B8884F',
      contrastText: PURPLE_DEEP,
    },
    background: {
      default: IVORY,
      paper: '#FFFFFF',
    },
    text: {
      primary: PURPLE_DEEP,
      secondary: alpha(PURPLE_DEEP, 0.7),
    },
    divider: alpha(PURPLE_DEEP, 0.08),
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
          background: `linear-gradient(135deg, ${PURPLE} 0%, ${ORCHID} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #5A189A 0%, ${PURPLE} 100%)`,
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
