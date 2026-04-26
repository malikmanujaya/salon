import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';

import { FormDialog } from '@/components/ui/FormDialog';
import { LabeledSelect, type LabeledSelectOption } from '@/components/ui/LabeledSelect';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { CreateModal } from '@/components/ui/CreateModal';
import { useAuth } from '@/context/AuthContext';
import { SALON_DISPLAY_NAME } from '@/constants/display';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
import { toDatetimeLocalValue } from '@/lib/datetimeLocal';
import type { BookingDetail, CustomerSummary, SalonServiceSummary, StaffSummary } from '@/types/booking';

type Props = {
  open: boolean;
  onClose: () => void;
  /** After successful create/update */
  onSaved: () => void;
  initial?: BookingDetail | null;
  /** Prefill when creating from calendar slot */
  defaultStart?: Date | null;
  customers: CustomerSummary[];
  services: SalonServiceSummary[];
  staff: StaffSummary[];
  onCustomerCreated: () => void;
};

export function BookingFormDialog({
  open,
  onClose,
  onSaved,
  initial,
  defaultStart,
  customers,
  services,
  staff,
  onCustomerCreated,
}: Props) {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';

  const [customerId, setCustomerId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [startLocal, setStartLocal] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const isEdit = Boolean(initial);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setCustomerId(initial.customerId);
      setStaffId(initial.staffId ?? '');
      setServiceIds(initial.services.map((s) => s.serviceId));
      setStartLocal(toDatetimeLocalValue(new Date(initial.startTime)));
      setNotes(initial.notes ?? '');
    } else {
      const start = defaultStart ?? new Date();
      if (!isCustomer) {
        setCustomerId(customers[0]?.id ?? '');
      } else {
        setCustomerId('');
      }
      setStaffId('');
      setServiceIds(services[0] ? [services[0].id] : []);
      setStartLocal(toDatetimeLocalValue(start));
      setNotes('');
    }
  }, [open, initial, defaultStart, customers, services, isCustomer]);

  const customerOptions: LabeledSelectOption[] = useMemo(
    () => customers.map((c) => ({ value: c.id, label: `${c.fullName} · ${c.phone}` })),
    [customers],
  );

  const staffOptions: LabeledSelectOption[] = useMemo(
    () => [
      { value: '', label: 'Unassigned' },
      ...staff.map((s) => ({ value: s.id, label: s.user.fullName + (s.title ? ` · ${s.title}` : '') })),
    ],
    [staff],
  );

  const handleServiceChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    setServiceIds(typeof v === 'string' ? v.split(',') : v);
  };

  const submit = async () => {
    setError(null);
    if (!isCustomer && !customerId) {
      setError('Select a customer.');
      return;
    }
    if (!serviceIds.length) {
      setError('Select at least one service.');
      return;
    }
    const start = new Date(startLocal);
    if (Number.isNaN(start.getTime())) {
      setError('Invalid date/time.');
      return;
    }

    setLoading(true);
    try {
      if (initial) {
        await api.patch<BookingDetail>(`/bookings/${initial.id}`, {
          startTime: start.toISOString(),
          serviceIds,
          staffId: staffId || null,
          notes: notes.trim() || null,
        });
      } else {
        await api.post<BookingDetail>('/bookings', {
          ...(isCustomer ? {} : { customerId }),
          startTime: start.toISOString(),
          serviceIds,
          staffId: staffId || undefined,
          notes: notes.trim() || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save booking.'));
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    setCreatingCustomer(true);
    try {
      const { data } = await api.post<CustomerSummary>('/customers', {
        fullName: newName.trim(),
        phone: newPhone.trim(),
      });
      onCustomerCreated();
      setCustomerId(data.id);
      setAddCustomerOpen(false);
      setNewName('');
      setNewPhone('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create customer.'));
    } finally {
      setCreatingCustomer(false);
    }
  };

  return (
    <>
      <FormDialog
        open={open}
        onClose={onClose}
        title={isEdit ? 'Edit booking' : 'New booking'}
        subtitle={
          isEdit
            ? formatRangeLabel(initial!)
            : isCustomer
              ? `Book a service at ${SALON_DISPLAY_NAME} — you are booked as yourself.`
              : 'Choose customer, services, and time.'
        }
        onSubmit={submit}
        loading={loading}
        submitLabel={isEdit ? 'Save changes' : 'Create booking'}
        maxWidth="sm"
      >
        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {!isCustomer ? (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Customer
              </Typography>
              <Button size="small" onClick={() => setAddCustomerOpen(true)} disabled={isEdit}>
                New customer
              </Button>
            </Stack>
            <LabeledSelect
              label="Customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={customerOptions}
              disabled={isEdit}
              required
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Booking for <strong>{user?.fullName}</strong> ({user?.phone ?? 'your profile phone'}).
          </Typography>
        )}

        <LabeledSelect label="Stylist" value={staffId} onChange={(e) => setStaffId(e.target.value)} options={staffOptions} />

        <FormControl fullWidth>
          <InputLabel id="svc-label" shrink>
            Services
          </InputLabel>
          <Select<string[]>
            labelId="svc-label"
            multiple
            value={serviceIds}
            onChange={handleServiceChange}
            input={<OutlinedInput label="Services" />}
            renderValue={(selected) =>
              selected
                .map((id) => services.find((s) => s.id === id)?.name)
                .filter(Boolean)
                .join(', ')
            }
          >
            {services.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Checkbox checked={serviceIds.includes(s.id)} />
                <ListItemText primary={s.name} secondary={`${s.durationMinutes} min`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LabeledTextField
          label="Start"
          type="datetime-local"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <LabeledTextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />
      </FormDialog>

      {!isCustomer ? (
        <CreateModal
          open={addCustomerOpen}
          onClose={() => setAddCustomerOpen(false)}
          title="New customer"
          submitLabel="Add customer"
          onSubmit={createCustomer}
          loading={creatingCustomer}
        >
          <LabeledTextField label="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <LabeledTextField label="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
        </CreateModal>
      ) : null}
    </>
  );
}

function formatRangeLabel(b: BookingDetail) {
  return `${b.customer.fullName} · ${new Date(b.startTime).toLocaleString()}`;
}
