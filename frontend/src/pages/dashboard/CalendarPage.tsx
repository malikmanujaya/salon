import { useMemo, useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { BookingFormDialog } from '@/components/bookings/BookingFormDialog';
import { BookingsCalendar } from '@/components/bookings/BookingsCalendar';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { SALON_DISPLAY_NAME } from '@/constants/display';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import type {
  BookingDetail,
  CustomerSummary,
  SalonServiceSummary,
  StaffSummary,
} from '@/types/booking';

type CustomersResponse = CustomerSummary[] | { items?: CustomerSummary[] };

export default function CalendarPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const salonId = user?.salonId;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNonce, setDialogNonce] = useState(0);
  const [editing, setEditing] = useState<BookingDetail | null>(null);
  const [slotDefault, setSlotDefault] = useState<Date | null>(null);

  /**
   * The big-calendar component manages its own visible date internally; for fetching,
   * we load a generous window (current month ± 6 weeks) so navigation feels instant.
   * If the dataset grows large, switch to on-`range-change` refetches.
   */
  const range = useMemo(() => {
    const now = dayjs();
    return {
      from: now.subtract(6, 'week').startOf('day').toISOString(),
      to: now.add(6, 'week').endOf('day').toISOString(),
    };
  }, []);

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
      const { data } = await api.get<CustomersResponse>('/customers');
      return Array.isArray(data) ? data : data.items ?? [];
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

  return (
    <Box>
      <PageHeader
        title="Calendar"
        description="Click a booking to edit, drag to select a time, or use the toolbar to switch views."
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

      <BookingsCalendar
        bookings={bookingsQuery.data ?? []}
        onSelectBooking={openEdit}
        onSelectSlot={(start) => openCreate(start)}
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
