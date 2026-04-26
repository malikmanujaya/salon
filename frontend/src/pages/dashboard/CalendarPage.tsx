import { useMemo, useState } from 'react';
import { Alert, Box, Button, IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { BookingFormDialog } from '@/components/bookings/BookingFormDialog';
import { WeekCalendarView } from '@/components/bookings/WeekCalendarView';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { SALON_DISPLAY_NAME } from '@/constants/display';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import { addDays, endOfWeekSunday, startOfWeekMonday, toIsoRange } from '@/lib/datetimeLocal';
import type { BookingDetail, CustomerSummary, SalonServiceSummary, StaffSummary } from '@/types/booking';

export default function CalendarPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const salonId = user?.salonId;

  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNonce, setDialogNonce] = useState(0);
  const [editing, setEditing] = useState<BookingDetail | null>(null);
  const [slotDefault, setSlotDefault] = useState<Date | null>(null);

  const range = useMemo(() => toIsoRange(weekStart, endOfWeekSunday(weekStart)), [weekStart]);

  const bookingsQuery = useQuery({
    queryKey: ['bookings', range.from, range.to],
    queryFn: async () => {
      const { data } = await api.get<BookingDetail[]>('/bookings', {
        params: { from: range.from, to: range.to },
      });
      return data;
    },
    enabled: Boolean(salonId),
  });

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get<CustomerSummary[]>('/customers');
      return data;
    },
    enabled: Boolean(salonId),
  });

  const servicesQuery = useQuery({
    queryKey: ['salon-services'],
    queryFn: async () => {
      const { data } = await api.get<SalonServiceSummary[]>('/salon-services');
      return data;
    },
    enabled: Boolean(salonId),
  });

  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get<StaffSummary[]>('/staff');
      return data;
    },
    enabled: Boolean(salonId),
  });

  const invalidateBookings = () => void qc.invalidateQueries({ queryKey: ['bookings'] });

  const openCreate = (start?: Date) => {
    setEditing(null);
    setSlotDefault(start ?? null);
    setDialogNonce((n) => n + 1);
    setDialogOpen(true);
  };

  const openEdit = (b: BookingDetail) => {
    setEditing(b);
    setSlotDefault(null);
    setDialogNonce((n) => n + 1);
    setDialogOpen(true);
  };

  const catalogLoading =
    customersQuery.isLoading || servicesQuery.isLoading || staffQuery.isLoading;

  if (!salonId) {
    return (
      <Box>
        <PageHeader title="Calendar" description={`Week view of appointments at ${SALON_DISPLAY_NAME}.`} />
        <EmptyState
          title="No salon linked"
          description="Sign in with a salon account to use the calendar."
        />
      </Box>
    );
  }

  const weekLabel = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${addDays(weekStart, 6).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <Box>
      <PageHeader
        title="Calendar"
        description="Click a booking to edit, or a time row to add one."
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => openCreate()}
            disabled={catalogLoading || !servicesQuery.data?.length}
          >
            New booking
          </Button>
        }
      />

      {bookingsQuery.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(bookingsQuery.error, 'Could not load calendar.')}
        </Alert>
      ) : null}

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <IconButton aria-label="Previous week" onClick={() => setWeekStart((w) => addDays(w, -7))}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 200, textAlign: 'center' }}>
          {weekLabel}
        </Typography>
        <IconButton aria-label="Next week" onClick={() => setWeekStart((w) => addDays(w, 7))}>
          <ChevronRightRoundedIcon />
        </IconButton>
        <Button size="small" variant="outlined" onClick={() => setWeekStart(startOfWeekMonday(new Date()))}>
          This week
        </Button>
      </Stack>

      <WeekCalendarView
        weekStartMonday={weekStart}
        bookings={bookingsQuery.data ?? []}
        onSelectBooking={openEdit}
        onSelectSlot={(day, hour) => {
          const d = new Date(day);
          d.setHours(hour, 0, 0, 0);
          openCreate(d);
        }}
      />

      <BookingFormDialog
        key={editing?.id ?? `new-${dialogNonce}`}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
          setSlotDefault(null);
        }}
        onSaved={invalidateBookings}
        initial={editing}
        defaultStart={slotDefault}
        customers={customersQuery.data ?? []}
        services={servicesQuery.data ?? []}
        staff={staffQuery.data ?? []}
        onCustomerCreated={() => {
          void qc.invalidateQueries({ queryKey: ['customers'] });
        }}
      />
    </Box>
  );
}
