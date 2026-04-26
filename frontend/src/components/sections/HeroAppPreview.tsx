import { useState } from 'react';
import { Box, Stack, Typography, Avatar, Chip, alpha } from '@mui/material';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import SmsRoundedIcon from '@mui/icons-material/SmsRounded';
import { motion } from 'framer-motion';

import { LabeledSelect, SearchableDropdown, type SearchableOption, type SelectChangeEvent } from '../ui';
import { elevationShadow, gradients, palette } from '@/theme/palette';

const APPOINTMENTS = [
  {
    time: '10:00',
    name: 'Nimesha P.',
    service: 'Bridal Trial · Hair & Makeup',
    staff: 'Ayesha',
    status: 'Confirmed',
    color: palette.purple,
  },
  {
    time: '11:30',
    name: 'Tharushi D.',
    service: 'Hair Coloring',
    staff: 'Ruvini',
    status: 'Confirmed',
    color: palette.orchid,
  },
  {
    time: '13:00',
    name: 'Sanduni K.',
    service: 'Facial · Hydra Glow',
    staff: 'Methika',
    status: 'Walk-in',
    color: palette.gold,
  },
  {
    time: '14:30',
    name: 'Rashmi J.',
    service: 'Manicure & Pedicure',
    staff: 'Hashini',
    status: 'Confirmed',
    color: palette.rose,
  },
];

const branchOpts = [
  { value: 'colombo', label: 'Colombo' },
  { value: 'kandy', label: 'Kandy' },
];

const staffOpts: SearchableOption[] = [
  { value: 'all', label: 'All stylists' },
  { value: 'ayesha', label: 'Ayesha' },
  { value: 'ruvini', label: 'Ruvini' },
];

export default function HeroAppPreview() {
  const [branch, setBranch] = useState('colombo');
  const [staff, setStaff] = useState<SearchableOption | null>(staffOpts[0] ?? null);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          p: { xs: 2.5, sm: 3 },
          background: `linear-gradient(160deg, ${alpha(palette.white, 0.95)} 0%, ${alpha(palette.ivory, 0.95)} 100%)`,
          border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
          boxShadow: elevationShadow.heroPreviewCard,
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
            icon={
              <EventAvailableRoundedIcon sx={{ color: `${palette.success} !important` }} />
            }
            label="On track"
            size="small"
            sx={{
              bgcolor: alpha(palette.success, 0.1),
              color: palette.successDark,
              fontWeight: 600,
            }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <LabeledSelect
            size="small"
            label="Branch"
            value={branch}
            onChange={(e: SelectChangeEvent<string>) => setBranch(e.target.value)}
            options={branchOpts}
          />
          <SearchableDropdown
            size="small"
            label="Stylist"
            options={staffOpts}
            value={staff}
            onChange={(_, v) => setStaff(v)}
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
                  bgcolor: palette.white,
                  border: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
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
          bgcolor: palette.purpleDeep,
          color: palette.white,
          boxShadow: elevationShadow.floatingSmsCard,
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
            background: gradients.heroCta,
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
          bgcolor: palette.white,
          boxShadow: elevationShadow.floatingStatCard,
          border: `1px solid ${alpha(palette.purpleDeep, 0.06)}`,
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
        <Typography variant="caption" sx={{ color: palette.success, fontWeight: 600 }}>
          ↑ 23% vs last week
        </Typography>
      </Box>
    </motion.div>
  );
}
