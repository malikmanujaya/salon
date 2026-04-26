import { Box, Container, Typography, Stack, alpha } from '@mui/material';
import { motion } from 'framer-motion';

import { palette } from '@/theme/palette';

const SALONS = [
  'Glamour Studio',
  'Ramani Fernando',
  'Salon Kessaree',
  'Hair on Wheels',
  'Bella Bridal',
  'Studio Senorita',
];

export default function TrustedBy() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 6 },
        borderTop: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
        borderBottom: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
        bgcolor: alpha(palette.white, 0.5),
      }}
    >
      <Container>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems="center"
          spacing={{ xs: 3, md: 4 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              letterSpacing: '0.16em',
              flexShrink: 0,
              fontWeight: 600,
            }}
          >
            Trusted by leading Sri Lankan salons
          </Typography>
          <Box
            sx={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(6, 1fr)',
              },
              gap: { xs: 2, md: 3 },
              alignItems: 'center',
            }}
          >
            {SALONS.map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    color: alpha(palette.purpleDeep, 0.55),
                    fontSize: '1.05rem',
                    textAlign: 'center',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {name}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
