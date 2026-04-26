import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <Box
      component={motion.a}
      href="/"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        textDecoration: 'none',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '12px',
          background:
            'linear-gradient(135deg, #E8B4B8 0%, #C77DFF 50%, #7B2CBF 100%)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 8px 24px rgba(123,44,191,0.25)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden
        >
          <path
            d="M20 42 C 20 28, 32 20, 44 20 C 38 28, 36 36, 32 44 C 28 38, 24 38, 20 42 Z"
            fill="#fff"
            opacity="0.95"
          />
        </svg>
      </Box>
      <Typography
        variant="h5"
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
