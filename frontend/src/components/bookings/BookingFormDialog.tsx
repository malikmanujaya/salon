import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Chip,
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
import dayjs, { type Dayjs } from 'dayjs';
import { useFormik } from 'formik';

import { AppDateTimePicker } from '@/components/ui/AppDateTimePicker';
import { FormDialog } from '@/components/ui/FormDialog';
import { LabeledSelect, type LabeledSelectOption } from '@/components/ui/LabeledSelect';
import { LabeledTextField } from '@/components/ui/LabeledTextField';
import { CreateModal } from '@/components/ui/CreateModal';
import { useAuth } from '@/context/AuthContext';
import { SALON_DISPLAY_NAME } from '@/constants/display';
import { api } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/apiError';
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
  canManageStatus?: boolean;
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
  canManageStatus = false,
  onCustomerCreated,
}: Props) {
  const { user } = useAuth();
  const isCustomer = user?.role === 'CUSTOMER';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const isEdit = Boolean(initial);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initial
      ? {
          customerId: initial.customerId,
          staffId: initial.staffId ?? '',
          serviceIds: initial.services.map((s) => s.serviceId),
          status: initial.status,
          start: dayjs(initial.startTime) as Dayjs | null,
          notes: initial.notes ?? '',
        }
      : {
          customerId: isCustomer ? '' : customers[0]?.id ?? '',
          staffId: '',
          serviceIds: services[0] ? [services[0].id] : [],
          status: 'PENDING',
          start: roundToNextQuarter(dayjs(defaultStart ?? new Date())) as Dayjs | null,
          notes: '',
        },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!isCustomer && !values.customerId) errors.customerId = 'Select a customer.';
      if (!values.serviceIds.length) errors.serviceIds = 'Select at least one service.';
      if (!values.start || !values.start.isValid()) errors.start = 'Pick a valid start date and time.';
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      const startIso = values.start!.toDate().toISOString();
      setLoading(true);
      try {
        if (initial) {
          await api.patch<BookingDetail>(`/bookings/${initial.id}`, {
            startTime: startIso,
            serviceIds: values.serviceIds,
            staffId: values.staffId || null,
            notes: values.notes.trim() || null,
            ...(canManageStatus ? { status: values.status } : {}),
          });
        } else {
          await api.post<BookingDetail>('/bookings', {
            ...(isCustomer ? {} : { customerId: values.customerId }),
            startTime: startIso,
            serviceIds: values.serviceIds,
            staffId: values.staffId || undefined,
            notes: values.notes.trim() || undefined,
          });
        }
        onSaved();
        onClose();
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not save booking.'));
      } finally {
        setLoading(false);
      }
    },
  });

  const addCustomerFormik = useFormik({
    initialValues: { fullName: '', phone: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
      if (!values.phone.trim()) errors.phone = 'Phone is required.';
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setCreatingCustomer(true);
      try {
        const { data } = await api.post<CustomerSummary>('/customers', {
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
        });
        onCustomerCreated();
        formik.setFieldValue('customerId', data.id);
        setAddCustomerOpen(false);
        helpers.resetForm();
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not create customer.'));
      } finally {
        setCreatingCustomer(false);
      }
    },
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

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
    formik.setFieldValue('serviceIds', typeof v === 'string' ? v.split(',') : v);
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
        onSubmit={formik.submitForm}
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
              value={formik.values.customerId}
              onChange={(e) => formik.setFieldValue('customerId', e.target.value)}
              options={customerOptions}
              disabled={isEdit}
              required
              error={formik.touched.customerId && Boolean(formik.errors.customerId)}
              helperText={formik.touched.customerId ? formik.errors.customerId : undefined}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Booking for <strong>{user?.fullName}</strong> ({user?.phone ?? 'your profile phone'}).
          </Typography>
        )}

        <LabeledSelect
          label="Stylist"
          value={formik.values.staffId}
          onChange={(e) => formik.setFieldValue('staffId', e.target.value)}
          options={staffOptions}
        />

        {isEdit ? (
          canManageStatus ? (
            <LabeledSelect
              label="Status"
              value={formik.values.status}
              onChange={(e) => formik.setFieldValue('status', e.target.value)}
              options={[
                { value: 'PENDING', label: 'PENDING' },
                { value: 'CONFIRMED', label: 'CONFIRMED' },
                { value: 'COMPLETED', label: 'COMPLETED' },
                { value: 'CANCELLED', label: 'CANCELLED' },
                { value: 'NO_SHOW', label: 'NO_SHOW' },
              ]}
              required
            />
          ) : (
            <Stack spacing={0.75}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip label={formik.values.status} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
            </Stack>
          )
        ) : null}

        <FormControl fullWidth>
          <InputLabel id="svc-label" shrink>
            Services
          </InputLabel>
          <Select<string[]>
            labelId="svc-label"
            multiple
            value={formik.values.serviceIds}
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
                <Checkbox checked={formik.values.serviceIds.includes(s.id)} />
                <ListItemText primary={s.name} secondary={`${s.durationMinutes} min`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <AppDateTimePicker
          label="Start"
          value={formik.values.start}
          onChange={(value) => formik.setFieldValue('start', value)}
          required
          helperText={
            formik.values.start
              ? `Booking begins ${formik.values.start.format('dddd, MMM D · h:mm A')}`
              : formik.errors.start || ' '
          }
        />

        <LabeledTextField
          label="Notes"
          name="notes"
          value={formik.values.notes}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          multiline
          minRows={2}
        />
      </FormDialog>

      {!isCustomer ? (
        <CreateModal
          open={addCustomerOpen}
          onClose={() => setAddCustomerOpen(false)}
          title="New customer"
          submitLabel="Add customer"
          onSubmit={addCustomerFormik.submitForm}
          loading={creatingCustomer}
        >
          <LabeledTextField
            label="Full name"
            name="fullName"
            value={addCustomerFormik.values.fullName}
            onChange={addCustomerFormik.handleChange}
            onBlur={addCustomerFormik.handleBlur}
            error={addCustomerFormik.touched.fullName && Boolean(addCustomerFormik.errors.fullName)}
            helperText={addCustomerFormik.touched.fullName ? addCustomerFormik.errors.fullName : undefined}
            required
          />
          <LabeledTextField
            label="Phone"
            name="phone"
            value={addCustomerFormik.values.phone}
            onChange={addCustomerFormik.handleChange}
            onBlur={addCustomerFormik.handleBlur}
            error={addCustomerFormik.touched.phone && Boolean(addCustomerFormik.errors.phone)}
            helperText={addCustomerFormik.touched.phone ? addCustomerFormik.errors.phone : undefined}
            required
          />
        </CreateModal>
      ) : null}
    </>
  );
}

function formatRangeLabel(b: BookingDetail) {
  return `${b.customer.fullName} · ${new Date(b.startTime).toLocaleString()}`;
}

/** Round up to the next 15-minute mark so the picker opens on a tidy slot. */
function roundToNextQuarter(d: Dayjs): Dayjs {
  const minute = d.minute();
  const remainder = minute % 15;
  const add = remainder === 0 ? 0 : 15 - remainder;
  return d.add(add, 'minute').second(0).millisecond(0);
}
