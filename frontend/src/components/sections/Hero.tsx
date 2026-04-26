import { Box, Container, Stack, Typography, Button, Chip, alpha } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { motion } from 'framer-motion';

import HeroAppPreview from './HeroAppPreview';

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
                icon={<StarRoundedIcon sx={{ color: '#D4A574 !important' }} />}
                label="Built for Sri Lanka's premier salons"
                sx={{
                  bgcolor: alpha('#D4A574', 0.12),
                  color: 'text.primary',
                  fontWeight: 600,
                  border: `1px solid ${alpha('#D4A574', 0.3)}`,
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
                    background:
                      'linear-gradient(135deg, #C77DFF 0%, #7B2CBF 50%, #E8B4B8 100%)',
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
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ py: 1.5, px: 3.5, fontSize: '1rem' }}
                >
                  Start free 14-day trial
                </Button>
                <Button
                  variant="text"
                  size="large"
                  startIcon={<PlayCircleFilledRoundedIcon />}
                  sx={{
                    color: 'text.primary',
                    py: 1.5,
                    px: 2.5,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: alpha('#7B2CBF', 0.06) },
                  }}
                >
                  Watch 2-min demo
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
                      bgcolor: alpha('#1A0F1F', 0.15),
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
          background:
            'radial-gradient(60% 60% at 80% 0%, rgba(199,125,255,0.20), transparent 60%), radial-gradient(50% 60% at 0% 30%, rgba(232,180,184,0.20), transparent 60%), radial-gradient(40% 40% at 50% 100%, rgba(212,165,116,0.12), transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(123,44,191,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(123,44,191,0.05) 1px, transparent 1px)',
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
