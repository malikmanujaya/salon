import { useLocation } from 'react-router-dom';
import { Box, Paper, Typography, alpha } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

import { DashboardModuleDemo } from '../../components/dashboard/DashboardModuleDemo';
import { palette } from '@/theme/palette';

const SECTIONS: Record<string, { title: string; body: string }> = {
  '/dashboard/bookings': {
    title: 'Bookings',
    body: 'Calendar, drag-reschedule, and walk-ins will live here.',
  },
  '/dashboard/bookings/calendar': {
    title: 'Calendar',
    body: 'Week / day views with drag-reschedule and colour-coded staff columns.',
  },
  '/dashboard/customers': {
    title: 'Customers',
    body: 'Profiles, visit history, and notes tailored for repeat guests.',
  },
  '/dashboard/staff': {
    title: 'Staff',
    body: 'Schedules, services, and leave — all in one roster.',
  },
  '/dashboard/services': {
    title: 'Services',
    body: 'Service menu, durations, and branch-specific pricing.',
  },
  '/dashboard/settings/profile': {
    title: 'Profile',
    body: 'Your account, password, and notification preferences.',
  },
  '/dashboard/settings/salon': {
    title: 'Salon',
    body: 'Business details, branches, and branding.',
  },
};

export default function DashboardPlaceholderPage() {
  const { pathname } = useLocation();
  const section = SECTIONS[pathname] ?? {
    title: 'Dashboard',
    body: 'This section is on the roadmap.',
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          mb: 3,
          borderRadius: 3,
          border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2.5,
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(palette.purple, 0.1),
            color: 'primary.main',
          }}
        >
          <ConstructionRoundedIcon />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, mb: 0.75 }}>
            {section.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {section.body}
          </Typography>
        </Box>
      </Paper>

      <DashboardModuleDemo title={`${section.title} · preview`} description={section.body} />
    </Box>
  );
}
