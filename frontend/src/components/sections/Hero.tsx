import { Box, Container, Stack, Typography, Button, Chip, alpha } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';

import HeroAppPreview from './HeroAppPreview';
import { gradients, palette } from '@/theme/palette';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        overflow: 'hidden',
      }}
    >
      <BackgroundDecor />

      <Container sx={{ position: 'relative' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 6, md: 8 }}
          alignItems="center"
        >
          <Box sx={{ flex: 1, maxWidth: 640 }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
            >
              <Chip
                icon={<StarRoundedIcon sx={{ color: `${palette.gold} !important` }} />}
                label="Built for Sri Lanka's premier salons"
                sx={{
                  bgcolor: alpha(palette.gold, 0.12),
                  color: 'text.primary',
                  fontWeight: 600,
                  border: `1px solid ${alpha(palette.gold, 0.3)}`,
                  px: 0.5,
                  mb: 3,
                }}
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
            >
              <Typography variant="h1" sx={{ mb: 2.5 }}>
                The salon software that{' '}
                <Box
                  component="span"
                  sx={{
                    background: gradients.heroHeading,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  works as hard as you do
                </Box>
                .
              </Typography>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: 'text.secondary', mb: 4, maxWidth: 560 }}
              >
                Replace the booking book, the WhatsApp chaos, and the missed
                appointments. Lumora gives your front desk one calm, beautiful
                place to manage bookings, staff and customers — with SMS reminders
                that actually arrive.
              </Typography>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ mb: 4 }}
              >
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ py: 1.5, px: 3.5, fontSize: '1rem' }}
                >
                  Create account
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  startIcon={<LoginRoundedIcon />}
                  sx={{
                    color: 'text.primary',
                    py: 1.5,
                    px: 2.5,
                    fontSize: '1rem',
                    borderColor: alpha(palette.purpleDeep, 0.2),
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(palette.purple, 0.04),
                    },
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
            >
              <Stack
                direction="row"
                spacing={3}
                sx={{ color: 'text.secondary' }}
                divider={
                  <Box
                    sx={{
                      width: 1,
                      bgcolor: alpha(palette.purpleDeep, 0.15),
                      mx: 0,
                    }}
                  />
                }
              >
                <BulletStat value="92%" label="fewer no-shows" />
                <BulletStat value="<10s" label="to create a booking" />
                <BulletStat value="24/7" label="SMS reminders" />
              </Stack>
            </motion.div>
          </Box>

          <Box
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: 620,
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <HeroAppPreview />
            </motion.div>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function BulletStat({ value, label }: { value: string; label: string }) {
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          color: 'primary.main',
          lineHeight: 1,
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}

function BackgroundDecor() {
  return (
    <>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(60% 60% at 80% 0%, ${alpha(palette.orchid, 0.2)}, transparent 60%), radial-gradient(50% 60% at 0% 30%, ${alpha(palette.rose, 0.2)}, transparent 60%), radial-gradient(40% 40% at 50% 100%, ${alpha(palette.gold, 0.12)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${alpha(palette.purple, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(palette.purple, 0.05)} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
