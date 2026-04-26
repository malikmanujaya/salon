import { Box, Container, Typography, Button, Stack, alpha } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <Box component="section" sx={{ pb: { xs: 10, md: 14 }, pt: { xs: 4, md: 6 } }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: 5,
              overflow: 'hidden',
              p: { xs: 5, md: 9 },
              textAlign: 'center',
              background:
                'linear-gradient(135deg, #1A0F1F 0%, #5A189A 50%, #7B2CBF 100%)',
              color: '#FAF6F2',
              boxShadow: '0 40px 80px -20px rgba(123,44,191,0.5)',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(50% 60% at 80% 0%, rgba(232,180,184,0.25), transparent 60%), radial-gradient(40% 60% at 0% 100%, rgba(212,165,116,0.20), transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(250,246,242,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(250,246,242,0.05) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                maskImage:
                  'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse at center, black 30%, transparent 70%)',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ position: 'relative', maxWidth: 720, mx: 'auto' }}>
              <Typography
                variant="overline"
                sx={{
                  color: '#E8B4B8',
                  letterSpacing: '0.18em',
                  fontWeight: 700,
                }}
              >
                Ready when you are
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: '#FAF6F2',
                  mt: 2,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Run a calmer, more profitable salon — starting today.
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: alpha('#FAF6F2', 0.85),
                  mb: 4,
                  fontSize: '1.1rem',
                }}
              >
                14-day free trial. No credit card required. Onboarding done in
                under an hour, in Sinhala or English.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    bgcolor: '#fff',
                    color: '#1A0F1F',
                    background:
                      'linear-gradient(135deg, #FAF6F2, #E8B4B8)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #E8B4B8, #D4A574)',
                    },
                  }}
                >
                  Start your free trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CallRoundedIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    color: '#FAF6F2',
                    borderColor: alpha('#FAF6F2', 0.4),
                    '&:hover': {
                      borderColor: '#FAF6F2',
                      bgcolor: alpha('#FAF6F2', 0.08),
                    },
                  }}
                >
                  Book a 15-min demo
                </Button>
              </Stack>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
