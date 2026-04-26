import { Box, Paper, Typography, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import { DashboardModuleDemo } from '../../components/dashboard/DashboardModuleDemo';
import { PageHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof EventAvailableRoundedIcon;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.75,
        borderRadius: 3,
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
        background: (t) =>
          `linear-gradient(145deg, ${alpha(t.palette.primary.main, 0.06)}, ${alpha(t.palette.secondary.main, 0.05)})`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
          {title}
        </Typography>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha('#7B2CBF', 0.12),
            color: 'primary.main',
          }}
        >
          <Icon fontSize="small" />
        </Box>
      </Box>
      <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default function DashboardHomePage() {
  const { user } = useAuth();

  return (
    <Box>
      <PageHeader
        title={`Hello, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
        description={`Snapshot for ${user?.role === 'SUPER_ADMIN' ? 'the platform' : user?.salon?.name ?? 'your salon'}. Stats fill in as modules go live.`}
      />

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Today" value="—" subtitle="Bookings (coming soon)" icon={EventAvailableRoundedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Customers" value="—" subtitle="Total profiles (coming soon)" icon={GroupsRoundedIcon} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard title="Occupancy" value="—" subtitle="Chair utilisation (coming soon)" icon={TrendingUpRoundedIcon} />
        </Grid>
      </Grid>

      <DashboardModuleDemo
        title="Shared UI preview"
        description="These fields, table, and modals are the same building blocks used across dashboard sections."
      />
    </Box>
  );
}
