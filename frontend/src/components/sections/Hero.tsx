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
import { palette } from '@/theme/palette';

/** Full-bleed art behind the hero. Swap for a photo: add `public/landing/hero-bg.jpg` and set this to `/landing/hero-bg.jpg`. */
const HERO_BG_URL = '/landing/hero-bg.jpg';

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
      <HeroBackground imageUrl={HERO_BG_URL} />
      <BackgroundDecor />

      <Container sx={{ position: 'relative', zIndex: 2 }}>
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
                  bgcolor: alpha(palette.white, 0.82),
                  color: palette.purpleDeep,
                  fontWeight: 600,
                  border: `1px solid ${alpha(palette.gold, 0.45)}`,
                  boxShadow: `0 1px 2px ${alpha(palette.purpleDeep, 0.06)}`,
                  px: 0.5,
                  mb: 3,
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18, clipPath: 'inset(0 100% 0 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.95, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  mb: 2.5,
                  maxWidth: { xs: '100%', sm: 560, md: 520 },
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 800,
                  lineHeight: 1.22,
                  letterSpacing: '-0.02em',
                }}
              >
                {/* Per-line “marker” blocks: solid fill + clone so each wrapped line is its own rectangle */}
                <Box
                  component={motion.span}
                  initial={{ boxShadow: `0px 0px 0 ${alpha(palette.purpleDeep, 0)}` }}
                  animate={{
                    boxShadow: [
                      `0px 0px 0 ${alpha(palette.purpleDeep, 0)}`,
                      `2px 3px 18px ${alpha(palette.purpleDeep, 0.45)}`,
                      `2px 3px 0 ${alpha(palette.purpleDeep, 0.2)}`,
                    ],
                  }}
                  transition={{ duration: 1.2, delay: 0.95, times: [0, 0.55, 1], ease: [0.22, 1, 0.36, 1] }}
                  sx={{
                    color: palette.white,
                    bgcolor: palette.orchid,
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                    py: '0.14em',
                    px: '0.22em',
                    borderRadius: 0,
                    boxShadow: `2px 3px 0 ${alpha(palette.purpleDeep, 0.2)}`,
                  }}
                >
                  The salon software that works as hard as you do.
                </Box>
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box
                component={motion.div}
                whileHover={{ y: -3, boxShadow: `0 2px 0 ${alpha(palette.purpleDeep, 0.06)}, 0 18px 40px ${alpha(palette.purpleDeep, 0.14)}` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                sx={{
                  position: 'relative',
                  maxWidth: 560,
                  mt: { xs: 3, sm: 4 },
                  mb: 4,
                  pl: { xs: 2.25, sm: 2.5 },
                  pr: { xs: 2, sm: 2.5 },
                  py: { xs: 1.75, sm: 2 },
                  bgcolor: palette.white,
                  borderLeft: `4px solid ${palette.orchid}`,
                  borderRadius: '4px',
                  boxShadow: `0 1px 0 ${alpha(palette.purpleDeep, 0.04)}, 0 8px 28px ${alpha(palette.purpleDeep, 0.08)}`,
                }}
              >
                <Typography
                  variant="subtitle1"
                  component="p"
                  sx={{
                    m: 0,
                    color: palette.purpleDeep,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    '& strong': { color: palette.purpleDark, fontWeight: 700 },
                  }}
                >
                  Replace the booking book, the WhatsApp chaos, and the missed appointments.{' '}
                  <Box
                    component={motion.strong}
                    initial={{ color: palette.purpleDeep }}
                    animate={{ color: palette.purpleDark }}
                    transition={{ duration: 0.5, delay: 1.4, ease: 'easeOut' }}
                  >
                    Lumora
                  </Box>{' '}
                  gives your front desk one calm, beautiful place to manage bookings, staff and customers — with{' '}
                  <Box
                    component={motion.strong}
                    initial={{ color: palette.purpleDeep }}
                    animate={{ color: palette.purpleDark }}
                    transition={{ duration: 0.5, delay: 1.55, ease: 'easeOut' }}
                  >
                    SMS reminders
                  </Box>{' '}
                  that actually arrive.
                </Typography>
              </Box>
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
                <Box component={motion.div} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
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
                </Box>
                <Box component={motion.div} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    startIcon={<LoginRoundedIcon />}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      fontSize: '1rem',
                      color: palette.purpleDeep,
                      fontWeight: 600,
                      bgcolor: alpha(palette.white, 0.9),
                      borderColor: alpha(palette.purpleDeep, 0.38),
                      borderWidth: 1.5,
                      boxShadow: `0 1px 0 ${alpha(palette.white, 1)}, 0 6px 24px ${alpha(palette.purpleDeep, 0.1)}`,
                      '&:hover': {
                        borderColor: palette.purpleDark,
                        bgcolor: palette.white,
                        borderWidth: 1.5,
                      },
                    }}
                  >
                    Sign in
                  </Button>
                </Box>
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
        border: `1px solid ${alpha(palette.purpleDeep, 0.12)}`,
        // Keep mid-band opaque — low-alpha rose was letting the photo show through labels
        background: [
          `linear-gradient(125deg, ${alpha(palette.white, 0.94)} 0%, ${alpha(palette.ivory, 0.98)} 45%, ${alpha(palette.white, 0.92)} 100%)`,
          `linear-gradient(125deg, ${alpha(palette.rose, 0.2)} 0%, transparent 42%, ${alpha(palette.rose, 0.12)} 100%)`,
        ].join(', '),
        boxShadow: `0 12px 40px ${alpha(palette.purpleDeep, 0.1)}, inset 0 1px 0 ${alpha(palette.white, 0.95)}`,
        backdropFilter: 'blur(10px)',
        p: { xs: 2.5, sm: 3, md: 3.5 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.22,
          backgroundImage: `linear-gradient(${alpha(palette.purpleDeep, 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(palette.purpleDeep, 0.07)} 1px, transparent 1px)`,
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
          bgcolor: alpha(palette.white, 0.85),
          border: `1px solid ${alpha(palette.purpleDeep, 0.14)}`,
          boxShadow: `inset 0 1px 0 ${alpha(palette.white, 0.95)}, 0 4px 14px ${alpha(palette.purpleDeep, 0.08)}`,
          color: 'primary.main',
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
          textShadow: `0 1px 0 ${alpha(palette.white, 0.9)}`,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: palette.purpleDeep,
          fontWeight: 600,
          lineHeight: 1.45,
          maxWidth: 160,
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/** Photo or illustration behind headline + preview; scrim + overlays keep text readable on busy photos. */
function HeroBackground({ imageUrl }: { imageUrl: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: palette.ivory,
        backgroundImage: [
          // Narrow, lighter scrim on the left for copy only — rest of photo stays vivid
          `linear-gradient(90deg, ${alpha(palette.white, 0.62)} 0%, ${alpha(palette.white, 0.35)} 18%, ${alpha(palette.ivory, 0.14)} 34%, transparent 56%)`,
          // Gentle top veil (nav) without washing out the whole frame
          `linear-gradient(180deg, ${alpha(palette.white, 0.38)} 0%, transparent 28%, transparent 100%)`,
          `linear-gradient(115deg, ${alpha(palette.white, 0.08)} 0%, transparent 40%)`,
          `url(${imageUrl})`,
        ].join(', '),
        backgroundSize: 'auto, auto, auto, cover',
        backgroundPosition: '0 0, 0 0, 0 0, center center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}

function BackgroundDecor() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: 0.45 }}>
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(60% 60% at 80% 0%, ${alpha(palette.orchid, 0.16)}, transparent 60%), radial-gradient(50% 60% at 0% 30%, ${alpha(palette.rose, 0.14)}, transparent 60%), radial-gradient(40% 40% at 50% 100%, ${alpha(palette.gold, 0.1)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${alpha(palette.purple, 0.04)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(palette.purple, 0.04)} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
