import { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';

import { BookingFormDialog } from '@/components/bookings/BookingFormDialog';
import { AppDataTable, type AppTableColumn } from '@/components/ui/AppDataTable';
import { AppDatePicker } from '@/components/ui/AppDatePicker';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatBookingRange } from '@/lib/datetimeLocal';
import type { BookingDetail, CustomerSummary, SalonServiceSummary, StaffSummary } from '@/types/booking';

export default function BookingsPage() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';
  const qc = useQueryClient();
  const salonId = user?.salonId;

  const [from, setFrom] = useState<Dayjs | null>(() => dayjs().subtract(14, 'day').startOf('day'));
  const [to, setTo] = useState<Dayjs | null>(() => dayjs().endOf('day'));

  const rangeError =
    from && to && from.isValid() && to.isValid() && from.isAfter(to)
      ? 'From must be on or before To.'
      : null;

  const fromIso = useMemo(
    () => (from && from.isValid() ? from.startOf('day').toDate().toISOString() : null),
    [from],
  );
  const toIso = useMemo(
    () => (to && to.isValid() ? to.endOf('day').toDate().toISOString() : null),
    [to],
  );

  const bookingsQuery = useQuery({
    queryKey: ['bookings', fromIso, toIso],
    queryFn: async () => {
      const { data } = await api.get<BookingDetail[]>('/bookings', { params: { from: fromIso, to: toIso } });
      return data;
    },
    enabled: Boolean(salonId) && Boolean(fromIso) && Boolean(toIso) && !rangeError,
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNonce, setDialogNonce] = useState(0);
  const [editing, setEditing] = useState<BookingDetail | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const invalidateBookings = () => void qc.invalidateQueries({ queryKey: ['bookings'] });

  const rows = bookingsQuery.data ?? [];

  const columns: AppTableColumn<BookingDetail>[] = [
    {
      id: 'when',
      label: 'When',
      minWidth: 200,
      render: (b) => formatBookingRange(b.startTime, b.endTime),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (b) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {b.customer.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {b.customer.phone}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'services',
      label: 'Services',
      render: (b) => (
        <Typography variant="body2" color="text.secondary">
          {b.services.map((s) => s.service.name).join(', ')}
        </Typography>
      ),
    },
    {
      id: 'staff',
      label: 'Stylist',
      render: (b) => (
        <Typography variant="body2" color="text.secondary">
          {b.staff?.user.fullName ?? '—'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (b) => <Chip size="small" label={b.status} color={statusColor(b.status)} variant="outlined" />,
    },
  ];

  if (!salonId) {
    return (
      <Box>
        <PageHeader title="Bookings" description="Sign in with a salon account to manage appointments." />
        <EmptyState
          title="No salon linked"
          description="Platform admin accounts are not tied to a salon. Use an owner or staff login to view bookings."
        />
      </Box>
    );
  }

  const catalogLoading =
    customersQuery.isLoading || servicesQuery.isLoading || staffQuery.isLoading;

  return (
    <Box>
      <PageHeader
        title="All bookings"
        description="Filter by date range, then create or edit appointments."
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditing(null);
              setDialogNonce((n) => n + 1);
              setDialogOpen(true);
            }}
            disabled={catalogLoading || !servicesQuery.data?.length}
          >
            New booking
          </Button>
        }
      />

      {!isCustomer && !customersQuery.data?.length ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Add a customer first (button on New booking dialog), then create a booking.
        </Alert>
      ) : null}

      {actionError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      ) : null}

      {bookingsQuery.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(bookingsQuery.error, 'Could not load bookings.')}
        </Alert>
      ) : null}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 2 }}
        alignItems={{ sm: 'flex-start' }}
      >
        <Box sx={{ flex: 1, minWidth: { sm: 220 } }}>
          <AppDatePicker
            label="From"
            size="small"
            value={from}
            onChange={(value) => setFrom(value)}
            maxDate={to ?? undefined}
            error={Boolean(rangeError)}
            helperText={rangeError ?? ' '}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: { sm: 220 } }}>
          <AppDatePicker
            label="To"
            size="small"
            value={to}
            onChange={(value) => setTo(value)}
            minDate={from ?? undefined}
            error={Boolean(rangeError)}
            helperText={' '}
          />
        </Box>
        <Button
          variant="outlined"
          onClick={() => void bookingsQuery.refetch()}
          disabled={bookingsQuery.isFetching || Boolean(rangeError)}
          sx={{ alignSelf: { sm: 'center' } }}
        >
          Refresh
        </Button>
      </Stack>

      <AppDataTable
        columns={columns}
        rows={rows}
        toolbar={
          <Typography variant="body2" color="text.secondary">
            {rows.length} booking{rows.length === 1 ? '' : 's'}
          </Typography>
        }
        emptyTitle="No bookings in this range"
        emptyDescription="Try widening the dates or create a new booking."
        onEdit={(row) => {
          setEditing(row);
          setDialogNonce((n) => n + 1);
          setDialogOpen(true);
        }}
        onDelete={(row) => setCancelId(row.id)}
      />

      <BookingFormDialog
        key={editing?.id ?? `new-${dialogNonce}`}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSaved={invalidateBookings}
        initial={editing}
        customers={customersQuery.data ?? []}
        services={servicesQuery.data ?? []}
        staff={staffQuery.data ?? []}
        onCustomerCreated={() => {
          void qc.invalidateQueries({ queryKey: ['customers'] });
        }}
      />

      <DeleteConfirmModal
        open={Boolean(cancelId)}
        title="Cancel this booking?"
        entityLabel={rows.find((r) => r.id === cancelId)?.customer.fullName}
        description="The booking will be marked as cancelled. You can still see it in history."
        confirmLabel="Cancel booking"
        loading={cancelLoading}
        onClose={() => setCancelId(null)}
        onConfirm={async () => {
          if (!cancelId) return;
          setCancelLoading(true);
          setActionError(null);
          try {
            await api.delete(`/bookings/${cancelId}`);
            setCancelId(null);
            invalidateBookings();
          } catch (e) {
            setActionError(getApiErrorMessage(e, 'Could not cancel.'));
          } finally {
            setCancelLoading(false);
          }
        }}
      />
    </Box>
  );
}

function statusColor(
  s: string,
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
  switch (s) {
    case 'CONFIRMED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'COMPLETED':
      return 'info';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'error';
    default:
      return 'default';
  }
}
