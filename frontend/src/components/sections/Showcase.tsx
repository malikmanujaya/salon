import { Box, Container, Stack, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { motion } from 'framer-motion';

import SectionHeading from './SectionHeading';

const POINTS = [
  'SMS through Dialog, Mobitel & Notify.lk',
  'Works on any phone, tablet or desktop',
  'Sinhala-friendly customer names & notes',
  'Multi-branch and multi-salon ready',
  'Receptionist trained in under an hour',
  'Audit log for every important change',
];

export default function Showcase() {
  return (
    <Box component="section" sx={{ py: { xs: 10, md: 14 } }}>
      <Container>
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionHeading
              align="left"
              eyebrow="Made for Sri Lanka"
              title={
                <>
                  Designed for the way your salon{' '}
                  <Box
                    component="span"
                    sx={{
                      background:
                        'linear-gradient(135deg, #7B2CBF, #E8B4B8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    really runs
                  </Box>
                  .
                </>
              }
              description="Built after months of conversations with leading salon owners and receptionists in Colombo, Kandy and Galle."
            />

            <Grid container spacing={1.5} sx={{ mt: 4 }}>
              {POINTS.map((point, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={point}>
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          bgcolor: alpha('#7B2CBF', 0.12),
                          color: 'primary.main',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                          mt: '2px',
                        }}
                      >
                        <CheckRoundedIcon sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {point}
                      </Typography>
                    </Stack>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <CalendarMockup />
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function CalendarMockup() {
  const STAFF = ['Ayesha', 'Ruvini', 'Methika', 'Hashini'];
  const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const SLOTS: { col: number; row: number; rowSpan: number; label: string; color: string }[] = [
    { col: 0, row: 0, rowSpan: 2, label: 'Bridal', color: '#7B2CBF' },
    { col: 1, row: 1, rowSpan: 1, label: 'Color', color: '#C77DFF' },
    { col: 2, row: 0, rowSpan: 1, label: 'Facial', color: '#D4A574' },
    { col: 2, row: 3, rowSpan: 2, label: 'Spa', color: '#10B981' },
    { col: 3, row: 2, rowSpan: 1, label: 'Mani', color: '#E8B4B8' },
    { col: 1, row: 4, rowSpan: 1, label: 'Cut', color: '#F59E0B' },
    { col: 0, row: 4, rowSpan: 1, label: 'Trim', color: '#5A189A' },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        p: 3,
        borderRadius: 4,
        bgcolor: '#fff',
        border: `1px solid ${alpha('#1A0F1F', 0.08)}`,
        boxShadow: '0 30px 80px -30px rgba(123,44,191,0.3)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Friday · 26 Apr
        </Typography>
        <Stack direction="row" spacing={1}>
          {['Day', 'Week', 'Month'].map((v, i) => (
            <Box
              key={v}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                fontSize: '0.78rem',
                fontWeight: 600,
                bgcolor: i === 0 ? alpha('#7B2CBF', 0.12) : 'transparent',
                color: i === 0 ? 'primary.main' : 'text.secondary',
                border: `1px solid ${i === 0 ? alpha('#7B2CBF', 0.2) : 'transparent'}`,
              }}
            >
              {v}
            </Box>
          ))}
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(4, 1fr)',
          gap: 0,
          borderTop: `1px solid ${alpha('#1A0F1F', 0.06)}`,
          borderLeft: `1px solid ${alpha('#1A0F1F', 0.06)}`,
        }}
      >
        <Box />
        {STAFF.map((s) => (
          <Box
            key={s}
            sx={{
              p: 1.25,
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRight: `1px solid ${alpha('#1A0F1F', 0.06)}`,
              borderBottom: `1px solid ${alpha('#1A0F1F', 0.06)}`,
              bgcolor: alpha('#FAF6F2', 0.5),
              textAlign: 'center',
            }}
          >
            {s}
          </Box>
        ))}

        {HOURS.map((h, ri) => (
          <Box key={h} sx={{ display: 'contents' }}>
            <Box
              sx={{
                p: 1,
                fontSize: '0.75rem',
                color: 'text.secondary',
                borderRight: `1px solid ${alpha('#1A0F1F', 0.06)}`,
                borderBottom: `1px solid ${alpha('#1A0F1F', 0.06)}`,
                textAlign: 'right',
              }}
            >
              {h}
            </Box>
            {STAFF.map((_, ci) => {
              const slot = SLOTS.find((s) => s.col === ci && s.row === ri);
              return (
                <Box
                  key={ci}
                  sx={{
                    height: 44,
                    borderRight: `1px solid ${alpha('#1A0F1F', 0.06)}`,
                    borderBottom: `1px solid ${alpha('#1A0F1F', 0.06)}`,
                    p: 0.5,
                    position: 'relative',
                  }}
                >
                  {slot && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + ri * 0.04, duration: 0.4 }}
                      style={{
                        position: 'absolute',
                        inset: 4,
                        height: `calc(${slot.rowSpan * 44}px - 8px)`,
                        zIndex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: '100%',
                          borderRadius: 1.25,
                          bgcolor: alpha(slot.color, 0.15),
                          borderLeft: `3px solid ${slot.color}`,
                          color: slot.color,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'flex-start',
                          p: 0.75,
                        }}
                      >
                        {slot.label}
                      </Box>
                    </motion.div>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
