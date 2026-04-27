import { Box, Container, Stack, Typography, Button, Chip, alpha } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
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
              <HeroStatsBand />
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

function HeroStatsBand() {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
        background: `linear-gradient(125deg, ${alpha(palette.ivory, 0.98)} 0%, ${alpha(palette.rose, 0.14)} 42%, ${alpha(palette.ivory, 0.95)} 100%)`,
        p: { xs: 2.5, sm: 3, md: 3.5 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.45,
          backgroundImage: `linear-gradient(${alpha(palette.purpleDeep, 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(palette.purpleDeep, 0.06)} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: { xs: 'flex', md: 'grid' },
          flexDirection: { xs: 'column', md: 'row' },
          gridTemplateColumns: { md: 'minmax(0, 1fr) 80px minmax(0, 1fr) 80px minmax(0, 1fr)' },
          alignItems: { md: 'center' },
          gap: { xs: 2.5, md: 0 },
          columnGap: { md: 2 },
        }}
      >
        <BulletStat value="92%" label="fewer no-shows" />
        <StatDivider label="Confirmed bookings">
          <EventAvailableRoundedIcon sx={{ fontSize: 30 }} />
        </StatDivider>
        <BulletStat value="<10s" label="to create a booking" />
        <StatDivider label="SMS reminders">
          <SmsRoundedIcon sx={{ fontSize: 30 }} />
        </StatDivider>
        <BulletStat value="24/7" label="SMS reminders" />
      </Box>
    </Box>
  );
}

/** Visual break between stats — icon in a soft circle (hidden on narrow screens). */
function StatDivider({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box
      title={label}
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
      }}
    >
      <Box
        role="img"
        aria-label={label}
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(palette.purpleDeep, 0.06),
          border: `1px solid ${alpha(palette.purpleDeep, 0.1)}`,
          boxShadow: `inset 0 1px 0 ${alpha(palette.white, 0.7)}`,
          color: 'primary.main',
          opacity: 0.92,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function BulletStat({ value, label }: { value: string; label: string }) {
  return (
    <Box sx={{ pr: { md: 1 }, maxWidth: { md: 200 } }}>
      <Typography
        variant="h3"
        sx={{
          fontFamily: '"Playfair Display", serif',
          fontWeight: 700,
          color: 'primary.main',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          mb: 1,
          fontSize: { xs: '2rem', sm: '2.25rem' },
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          lineHeight: 1.45,
          maxWidth: 160,
        }}
      >
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
