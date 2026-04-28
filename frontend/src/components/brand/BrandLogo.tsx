import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { BRANDING_LOGO_URL, FAVICON_URL } from '@/constants/branding';
import { gradients, palette } from '@/theme/palette';

export type BrandLogoVariant =
  | 'navbar'
  | 'navbar-compact'
  | 'sidebar-expanded'
  | 'sidebar-collapsed';

type BrandLogoProps = {
  variant: BrandLogoVariant;
};

const imgSx: Record<BrandLogoVariant, object> = {
  navbar: {
    height: 40,
    maxWidth: 200,
    width: 'auto',
    objectFit: 'contain',
    objectPosition: 'left center',
  },
  'navbar-compact': {
    height: 32,
    maxWidth: 160,
    width: 'auto',
    objectFit: 'contain',
    objectPosition: 'left center',
  },
  'sidebar-expanded': {
    maxHeight: 88,
    width: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
  },
  'sidebar-collapsed': {
    width: 56,
    height: 56,
    objectFit: 'contain',
    objectPosition: 'center',
    borderRadius: 2,
  },
};

function NavbarFallback({ compact }: { compact?: boolean }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 1 : 1.25,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        sx={{
          width: compact ? 30 : 36,
          height: compact ? 30 : 36,
          borderRadius: '12px',
          background: gradients.roseOrchidPurple,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <svg width={compact ? 17 : 20} height={compact ? 17 : 20} viewBox="0 0 64 64" fill="none" aria-hidden>
          <path
            d="M20 42 C 20 28, 32 20, 44 20 C 38 28, 36 36, 32 44 C 28 38, 24 38, 20 42 Z"
            fill={palette.white}
            opacity="0.95"
          />
        </svg>
      </Box>
      <Typography
        variant={compact ? 'h6' : 'h5'}
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          color: 'text.primary',
          letterSpacing: '-0.01em',
        }}
      >
        Lumora
      </Typography>
    </Box>
  );
}

export function BrandLogo({ variant }: BrandLogoProps) {
  const [useFallback, setUseFallback] = useState(false);

  if (!useFallback) {
    return (
      <Box
        component="img"
        src={BRANDING_LOGO_URL}
        alt="Lumora"
        onError={() => setUseFallback(true)}
        sx={imgSx[variant]}
      />
    );
  }

  if (variant === 'navbar' || variant === 'navbar-compact') {
    return <NavbarFallback compact={variant === 'navbar-compact'} />;
  }

  if (variant === 'sidebar-collapsed') {
    return (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          background: gradients.roseOrchidPurple,
          display: 'grid',
          placeItems: 'center',
          color: palette.white,
          fontFamily: '"Playfair Display", serif',
          fontWeight: 800,
          fontSize: '1.1rem',
          mx: 'auto',
        }}
      >
        L
      </Box>
    );
  }

  return (
    <Typography
      component="div"
      sx={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 800,
        fontSize: { xs: '1.65rem', sm: '1.85rem' },
        letterSpacing: '-0.04em',
        lineHeight: 1.05,
        background: gradients.roseOrchidPurple,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'inherit',
      }}
    >
      Lumora
    </Typography>
  );
}

export type BrandLogoNavLinkProps = {
  /** Router path (marketing home `/` or app shell `/overview`). */
  to?: string;
  onClick?: () => void;
  /** Tighter mark for dense headers (e.g. mobile dashboard bar). */
  compact?: boolean;
};

/** Marketing navbar, auth layout, mobile app bar: `favicon.png` or gradient + wordmark fallback. */
export function BrandLogoNavLink({ to = '/', onClick, compact }: BrandLogoNavLinkProps) {
  const [useFallback, setUseFallback] = useState(false);
  const variant: BrandLogoVariant = compact ? 'navbar-compact' : 'navbar';

  if (!useFallback) {
    return (
      <Box
        component={RouterLink}
        to={to}
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <Box
          component="img"
          src={FAVICON_URL}
          alt="Lumora"
          onError={() => setUseFallback(true)}
          sx={imgSx[variant]}
        />
      </Box>
    );
  }

  return (
    <Box
      component={RouterLink}
      to={to}
      onClick={onClick}
      sx={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex' }}
    >
      <NavbarFallback compact={compact} />
    </Box>
  );
}
