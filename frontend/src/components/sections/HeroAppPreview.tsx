import { Box, Stack, Typography, Avatar, Chip, alpha } from '@mui/material';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { motion } from 'framer-motion';

const APPOINTMENTS = [
  {
    time: '10:00',
    name: 'Nimesha P.',
    service: 'Bridal Trial · Hair & Makeup',
    staff: 'Ayesha',
    status: 'Confirmed',
    color: '#7B2CBF',
  },
  {
    time: '11:30',
    name: 'Tharushi D.',
    service: 'Hair Coloring',
    staff: 'Ruvini',
    status: 'Confirmed',
    color: '#C77DFF',
  },
  {
    time: '13:00',
    name: 'Sanduni K.',
    service: 'Facial · Hydra Glow',
    staff: 'Methika',
    status: 'Walk-in',
    color: '#D4A574',
  },
  {
    time: '14:30',
    name: 'Rashmi J.',
    service: 'Manicure & Pedicure',
    staff: 'Hashini',
    status: 'Confirmed',
    color: '#E8B4B8',
  },
];

export default function HeroAppPreview() {
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3 },
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(250,246,242,0.95) 100%)',
          border: `1px solid ${alpha('#1A0F1F', 0.08)}`,
          boxShadow:
            '0 30px 80px -20px rgba(123,44,191,0.35), 0 10px 30px -10px rgba(26,15,31,0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}
            >
              Today · Friday
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              12 appointments
            </Typography>
          </Box>
          <Chip
            icon={<EventAvailableRoundedIcon sx={{ color: '#10B981 !important' }} />}
            label="On track"
            size="small"
            sx={{
              bgcolor: alpha('#10B981', 0.1),
              color: '#0E7C5A',
              fontWeight: 600,
            }}
          />
        </Stack>

        <Stack spacing={1.25}>
          {APPOINTMENTS.map((appt, i) => (
            <motion.div
              key={appt.time}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: `1px solid ${alpha('#1A0F1F', 0.06)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: alpha(appt.color, 0.4),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 44,
                    borderRadius: 4,
                    bgcolor: appt.color,
                  }}
                />
                <Box sx={{ minWidth: 56 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {appt.time}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {appt.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block' }}
                  >
                    {appt.service}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: alpha(appt.color, 0.18),
                      color: appt.color,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {appt.staff[0]}
                  </Avatar>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    {appt.staff}
                  </Typography>
                </Stack>
              </Box>
            </motion.div>
          ))}
        </Stack>
      </Box>

      <FloatingSmsCard />
      <FloatingStatCard />
    </Box>
  );
}

function FloatingSmsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 30 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: 1.2, duration: 0.7 }}
      style={{
        position: 'absolute',
        right: -8,
        bottom: -28,
        zIndex: 2,
      }}
    >
      <Box
        component={motion.div}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          p: 2,
          maxWidth: 280,
          borderRadius: 3,
          bgcolor: '#1A0F1F',
          color: '#fff',
          boxShadow: '0 20px 50px -10px rgba(26,15,31,0.4)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C77DFF, #7B2CBF)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <SmsRoundedIcon fontSize="small" />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            SMS · just now
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
            Hi Nimesha, your appointment at Glamour is confirmed for tomorrow
            at 10:00 AM ✨
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
}

function FloatingStatCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, x: -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: 1, duration: 0.7 }}
      style={{
        position: 'absolute',
        left: -16,
        top: -20,
        zIndex: 2,
      }}
    >
      <Box
        component={motion.div}
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: '#fff',
          boxShadow: '0 15px 40px -10px rgba(26,15,31,0.2)',
          border: `1px solid ${alpha('#1A0F1F', 0.06)}`,
          minWidth: 180,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          This week
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, my: 0.5 }}>
          184 bookings
        </Typography>
        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
          ↑ 23% vs last week
        </Typography>
      </Box>
    </motion.div>
  );
}
