import { Box, Container, Typography, Avatar, Stack, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import { motion } from 'framer-motion';

import SectionHeading from './SectionHeading';
import { palette } from '@/theme/palette';

const TESTIMONIALS = [
  {
    quote:
      'Lumora replaced three notebooks and a very crowded WhatsApp. Our receptionists love the calendar and our customers actually arrive on time now.',
    name: 'Anjali Perera',
    role: 'Owner, Glamour Studio · Colombo',
    initial: 'A',
    color: palette.purple,
  },
  {
    quote:
      'The SMS reminders alone paid for the system in the first month. No-shows dropped, and bridal customers feel so much more cared for.',
    name: 'Dilshan Rajapaksa',
    role: 'Manager, Bella Bridal · Kandy',
    initial: 'D',
    color: palette.gold,
  },
  {
    quote:
      'I used to come in early just to plan the day. Now I open the dashboard on my phone and everything is already there. It is a beautiful product.',
    name: 'Methika De Silva',
    role: 'Senior Stylist, Studio Senorita · Galle',
    initial: 'M',
    color: palette.rose,
  },
];

export default function Testimonials() {
  return (
    <Box
      id="testimonials"
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        position: 'relative',
        bgcolor: alpha(palette.white, 0.6),
      }}
    >
      <Container>
        <SectionHeading
          eyebrow="Loved by salon teams"
          title="Real teams, real days, real results."
          description="From single-chair studios to multi-branch chains, Lumora is helping salons take back their time."
        />

        <Grid container spacing={3} sx={{ mt: { xs: 4, md: 6 } }}>
          {TESTIMONIALS.map((t, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={t.name}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ height: '100%' }}
              >
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    bgcolor: palette.white,
                    border: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
                    position: 'relative',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px -20px ${alpha(t.color, 0.4)}`,
                    },
                  }}
                >
                  <FormatQuoteRoundedIcon
                    sx={{
                      color: alpha(t.color, 0.2),
                      fontSize: 48,
                      transform: 'scaleX(-1)',
                      mb: 1,
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontStyle: 'italic',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    {t.quote}
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha(t.color, 0.15),
                        color: t.color,
                        fontWeight: 700,
                      }}
                    >
                      {t.initial}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary' }}
                      >
                        {t.role}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
