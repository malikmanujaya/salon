import { Box, Container, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { motion } from 'framer-motion';

import SectionHeading from './SectionHeading';
import { gradients, palette } from '@/theme/palette';

const STEPS = [
  {
    number: '01',
    title: 'Set up your salon in 10 minutes',
    description:
      'Add your services, prices, staff and working hours. Import existing customers from a CSV or paste a phone list.',
    color: palette.purple,
  },
  {
    number: '02',
    title: 'Take bookings without the chaos',
    description:
      'Create appointments from the calendar in seconds. Lumora prevents double-bookings and assigns the right stylist automatically.',
    color: palette.orchid,
  },
  {
    number: '03',
    title: 'Customers show up — on time',
    description:
      'Confirmation and reminder SMS go out automatically through Dialog, Mobitel or Notify.lk. No more last-minute no-shows.',
    color: palette.rose,
  },
  {
    number: '04',
    title: 'See what is working, every day',
    description:
      'A clean daily dashboard tells your team what is happening today — and gives you the trends behind every busy week.',
    color: palette.gold,
  },
];

export default function HowItWorks() {
  return (
    <Box
      id="how-it-works"
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        background: gradients.ivoryWhiteIvory,
        overflow: 'hidden',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(40% 40% at 90% 30%, ${alpha(palette.orchid, 0.1)}, transparent 60%), radial-gradient(40% 40% at 10% 80%, ${alpha(palette.rose, 0.1)}, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
      <Container sx={{ position: 'relative' }}>
        <SectionHeading
          eyebrow="How it works"
          title="From paper book to peace of mind."
          description="No tech team needed. No long onboarding. Most salons go live the same day."
        />

        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: { xs: 4, md: 8 } }}>
          {STEPS.map((step, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={step.number}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Typography
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: '4rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      mb: 1.5,
                      background: `linear-gradient(135deg, ${step.color}, ${alpha(step.color, 0.4)})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 700 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {step.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
