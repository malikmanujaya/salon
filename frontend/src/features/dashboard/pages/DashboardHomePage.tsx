import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, MenuItem, Paper, Select, Typography, alpha, type SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid2';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { DashboardModuleDemo } from '@/components/dashboard/DashboardModuleDemo';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { SALON_DISPLAY_NAME } from '@/constants/display';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import { palette } from '@/theme/palette';
import type { CustomerDashboardSummary } from '@/types/customerDashboard';
import type { StaffDashboardSummary } from '@/types/staffDashboard';
import type { SuperAdminDashboardSummary } from '@/types/superAdminDashboard';

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
            bgcolor: alpha(palette.purple, 0.12),
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
  const qc = useQueryClient();
  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = user?.role === 'STAFF';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const salonId = user?.salonId ?? user?.salon?.id;
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  const customerDashboardQuery = useQuery({
    queryKey: ['customer-dashboard', user?.id],
    queryFn: async () => {
      const { data } = await api.get<CustomerDashboardSummary>('/customers/me/dashboard');
      return data;
    },
    enabled: isCustomer && Boolean(salonId),
  });

  const staffDashboardQuery = useQuery({
    queryKey: ['staff-dashboard', user?.id],
    queryFn: async () => {
      const { data } = await api.get<StaffDashboardSummary>('/staff/me/dashboard');
      return data;
    },
    enabled: isStaff,
  });

  const superAdminDashboardQuery = useQuery({
    queryKey: ['superadmin-dashboard', user?.id],
    queryFn: async () => {
      const { data } = await api.get<SuperAdminDashboardSummary>('/auth/superadmin/dashboard');
      return data;
    },
    enabled: isSuperAdmin,
  });

  if (isCustomer) {
    const data = customerDashboardQuery.data;
    const nextBooking = data?.nextBooking;
    return (
      <Box>
        <PageHeader
          title={`Hello, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
          description={`Your ${SALON_DISPLAY_NAME} booking dashboard.`}
          actions={
            <Button component={RouterLink} to="/bookings" variant="contained">
              Book / manage appointments
            </Button>
          }
        />

        {customerDashboardQuery.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(customerDashboardQuery.error, 'Could not load your dashboard.')}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Upcoming"
              value={String(data?.totals.upcoming ?? 0)}
              subtitle="Future appointments"
              icon={AccessTimeRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Completed"
              value={String(data?.totals.completed ?? 0)}
              subtitle="Past completed visits"
              icon={TaskAltRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Cancelled"
              value={String(data?.totals.cancelled ?? 0)}
              subtitle="Cancelled or no-show"
              icon={CancelRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Lifetime"
              value={String(data?.totals.total ?? 0)}
              subtitle="All your bookings"
              icon={EventAvailableRoundedIcon}
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            Next appointment
          </Typography>
          {nextBooking ? (
            <>
              <Typography variant="body1" fontWeight={600}>
                {new Date(nextBooking.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Services: {nextBooking.services.map((x) => x.service.name).join(', ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stylist: {nextBooking.staff?.user.fullName ?? 'Unassigned'}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No upcoming appointments yet. Create one from the bookings page.
            </Typography>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
            Recent bookings
          </Typography>
          {data?.recentBookings.length ? (
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {data.recentBookings.map((booking) => (
                <Box
                  key={booking.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(palette.purpleDeep, 0.03),
                    border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {new Date(booking.startTime).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.services.map((x) => x.service.name).join(', ')} · {booking.status}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No booking history yet.
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  if (isStaff) {
    const data = staffDashboardQuery.data;
    const nextBooking = data?.nextBooking;
    const updateStatus = async (bookingId: string, status: string) => {
      setStatusActionError(null);
      setStatusUpdatingId(bookingId);
      try {
        await api.patch(`/bookings/${bookingId}`, { status });
        await qc.invalidateQueries({ queryKey: ['staff-dashboard'] });
      } catch (e) {
        setStatusActionError(getApiErrorMessage(e, 'Could not update booking status.'));
      } finally {
        setStatusUpdatingId(null);
      }
    };
    return (
      <Box>
        <PageHeader
          title={`Hello, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
          description={`Your ${SALON_DISPLAY_NAME} staff overview for today.`}
          actions={
            <Button component={RouterLink} to="/calendar" variant="contained">
              Open calendar
            </Button>
          }
        />

        {staffDashboardQuery.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(staffDashboardQuery.error, 'Could not load your staff dashboard.')}
          </Alert>
        ) : null}
        {statusActionError ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setStatusActionError(null)}>
            {statusActionError}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Today"
              value={String(data?.totals.today ?? 0)}
              subtitle="Appointments today"
              icon={AccessTimeRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Upcoming"
              value={String(data?.totals.upcoming ?? 0)}
              subtitle="Future appointments"
              icon={EventAvailableRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Completed"
              value={String(data?.totals.completedThisWeek ?? 0)}
              subtitle="Completed this week"
              icon={TaskAltRoundedIcon}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Lifetime"
              value={String(data?.totals.total ?? 0)}
              subtitle="All assigned bookings"
              icon={TrendingUpRoundedIcon}
            />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
            Next appointment
          </Typography>
          {nextBooking ? (
            <>
              <Typography variant="body1" fontWeight={600}>
                {new Date(nextBooking.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Customer: {nextBooking.customer.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Services: {nextBooking.services.map((x) => x.service.name).join(', ')}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No upcoming appointments assigned yet.
            </Typography>
          )}
        </Paper>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                height: '100%',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                Today's queue
              </Typography>
              {data?.todayBookings.length ? (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {data.todayBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(palette.purpleDeep, 0.03),
                        border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {new Date(booking.startTime).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        · {booking.customer.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.services.map((x) => x.service.name).join(', ')}
                      </Typography>
                      <Box sx={{ mt: 0.75 }}>
                        <Select
                          size="small"
                          value={booking.status}
                          disabled={statusUpdatingId === booking.id}
                          onChange={(e: SelectChangeEvent<string>) => void updateStatus(booking.id, e.target.value)}
                          sx={{ minWidth: 150 }}
                        >
                          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No appointments in today's queue.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                height: '100%',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
                Recent bookings
              </Typography>
              {data?.recentBookings.length ? (
                <Box sx={{ display: 'grid', gap: 1.25 }}>
                  {data.recentBookings.map((booking) => (
                    <Box
                      key={booking.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(palette.purpleDeep, 0.03),
                        border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {new Date(booking.startTime).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.customer.fullName} · {booking.status}
                      </Typography>
                      <Box sx={{ mt: 0.75 }}>
                        <Select
                          size="small"
                          value={booking.status}
                          disabled={statusUpdatingId === booking.id}
                          onChange={(e: SelectChangeEvent<string>) => void updateStatus(booking.id, e.target.value)}
                          sx={{ minWidth: 150 }}
                        >
                          {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent bookings yet.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isSuperAdmin) {
    const data = superAdminDashboardQuery.data;
    return (
      <Box>
        <PageHeader
          title={`Hello, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
          description="Platform overview across all salons."
          actions={
            <Button component={RouterLink} to="/bookings" variant="contained">
              Open all bookings
            </Button>
          }
        />

        {superAdminDashboardQuery.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(superAdminDashboardQuery.error, 'Could not load super admin overview.')}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Salons" value={String(data?.totals.salons ?? 0)} subtitle="Registered salons" icon={GroupsRoundedIcon} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Admins" value={String(data?.totals.admins ?? 0)} subtitle="Active salon admins" icon={TaskAltRoundedIcon} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Staff" value={String(data?.totals.staffMembers ?? 0)} subtitle="Active staff users" icon={TrendingUpRoundedIcon} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Customers" value={String(data?.totals.customers ?? 0)} subtitle="Customer records" icon={EventAvailableRoundedIcon} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard title="Today bookings" value={String(data?.totals.bookingsToday ?? 0)} subtitle="Non-cancelled today" icon={AccessTimeRoundedIcon} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard title="Upcoming" value={String(data?.totals.upcomingBookings ?? 0)} subtitle="Future scheduled bookings" icon={EventAvailableRoundedIcon} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard title="Completed this week" value={String(data?.totals.completedThisWeek ?? 0)} subtitle="Completed bookings (week)" icon={TaskAltRoundedIcon} />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.25 }}>
            Recent bookings (platform)
          </Typography>
          {data?.recentBookings.length ? (
            <Box sx={{ display: 'grid', gap: 1.25 }}>
              {data.recentBookings.map((booking) => (
                <Box
                  key={booking.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(palette.purpleDeep, 0.03),
                    border: `1px solid ${alpha(palette.purpleDeep, 0.08)}`,
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {new Date(booking.startTime).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.salon.name} · {booking.customer.fullName} · {booking.status}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No platform bookings yet.
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Hello, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
        description={`Snapshot for ${user?.role === 'SUPER_ADMIN' ? 'the platform' : user?.role === 'CUSTOMER' ? SALON_DISPLAY_NAME : user?.salon?.name ?? SALON_DISPLAY_NAME}. Stats fill in as modules go live.`}
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
